import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface ImageDescriptionResult {
  description: string;
  timestamp: Date;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageDescriptionService {
  private apiKey = '';
  private modelName = 'gemini-2.5-flash'; // Latest free tier model
  
  constructor(private http: HttpClient) {}

  /**
   * Configure the API key and optional model
   */
  setConfiguration(apiKey: string, modelName?: string) {
    this.apiKey = apiKey;
    if (modelName) {
      this.modelName = modelName;
    }
  }

  /**
   * Get MIME type from file
   */
  private getMimeType(file: File): string {
    return file.type || 'image/jpeg';
  }

  /**
   * Convert image file to base64 string (without data URL prefix)
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = base64String.split(',')[1] || base64String;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get image description using Google Gemini API
   */
  async describeImageWithGemini(imageFile: File): Promise<ImageDescriptionResult> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not set. Please configure your API key.');
    }

    try {
      const base64Image = await this.fileToBase64(imageFile);
      const mimeType = this.getMimeType(imageFile);
      const imageUrl = URL.createObjectURL(imageFile);

      // v1beta supports all Gemini models including 2.x and 2.5
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      // Gemini API request format
      const body = {
        contents: [
          {
            parts: [
              {
                text: 'Please provide a detailed description of this image. Describe what you see, including objects, people, activities, colors, and the overall scene.'
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      };

      console.log('Using model:', this.modelName);
      console.log('Endpoint:', endpoint.replace(this.apiKey, 'API_KEY_HIDDEN'));

      const response = await this.http.post<any>(endpoint, body, { headers }).toPromise();
      
      // Extract description from Gemini response
      const description = response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No description available';

      return {
        description,
        timestamp: new Date(),
        imageUrl
      };
    } catch (error: any) {
      console.error('Error describing image with Gemini:', error);
      
      // Provide more helpful error messages
      if (error?.error?.error?.message) {
        const errorMsg = error.error.error.message;
        console.error('API Error Message:', errorMsg);
        
        if (errorMsg.includes('API key not valid')) {
          throw new Error('Invalid API key. Please check your API key in Google AI Studio.');
        } else if (errorMsg.includes('models/') && errorMsg.includes('not found')) {
          throw new Error(`Model "${this.modelName}" not available with your API key. Try a different model in settings or check your API access at https://aistudio.google.com`);
        }
        
        throw new Error(`Gemini API Error: ${errorMsg}`);
      } else if (error?.status === 400) {
        throw new Error('Invalid request. Please check your API key and try a different model.');
      } else if (error?.status === 403) {
        throw new Error('API key is invalid or does not have permission. Please create a new key at https://aistudio.google.com/app/apikey');
      } else if (error?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a minute.');
      } else if (error?.status === 404) {
        throw new Error(`Model "${this.modelName}" not found. Try selecting "Gemini 1.5 Flash" in settings.`);
      }
      
      throw error;
    }
  }
}
