import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonButton, 
  IonIcon, 
  IonSpinner,
  IonText,
  IonItem,
  IonLabel,
  IonInput,
  AlertController,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { imageOutline, settingsOutline, closeCircleOutline } from 'ionicons/icons';
import { ImageDescriptionService, ImageDescriptionResult } from '../services/image-description.service';
import { provideHttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonSpinner,
    IonText,
    IonItem,
    IonLabel,
    IonInput
  ],
  providers: [
    ImageDescriptionService
  ]
})
export class Tab3Page {
  selectedImage: string | null = null;
  selectedFile: File | null = null;
  description: string = '';
  isLoading: boolean = false;
  apiKey: string = '';
  modelName: string = 'gemini-2.5-flash';
  
  results: ImageDescriptionResult[] = [];

  constructor(
    private imageDescriptionService: ImageDescriptionService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    addIcons({ imageOutline, settingsOutline, closeCircleOutline });
    
    // Load saved configuration from localStorage
    const savedApiKey = localStorage.getItem('geminiApiKey');
    const savedModel = localStorage.getItem('geminiModel');
    
    if (savedApiKey) this.apiKey = savedApiKey;
    
    // Only 2.x models are supported; force-clear any cached 1.x model
    const supportedModels = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
    this.modelName = (savedModel && supportedModels.includes(savedModel)) ? savedModel : 'gemini-2.5-flash';
    localStorage.setItem('geminiModel', this.modelName);
  }

  /**
   * Handle file input change event
   */
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.showAlert('Invalid File', 'Please select a valid image file.');
        return;
      }

      this.selectedFile = file;
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
      };
      reader.readAsDataURL(file);
      
      // Clear previous description
      this.description = '';
    }
  }

  /**
   * Trigger file input click
   */
  selectImage() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.click();
  }

  /**
   * Clear selected image
   */
  clearImage() {
    this.selectedImage = null;
    this.selectedFile = null;
    this.description = '';
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  /**
   * Get image description from Gemini
   */
  async describeImage() {
    if (!this.selectedFile) {
      this.showAlert('No Image', 'Please select an image first.');
      return;
    }

    if (!this.apiKey) {
      this.showAlert('Configuration Required', 'Please configure your Gemini API key first.');
      await this.showConfigDialog();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Analyzing image with Gemini AI...',
      spinner: 'crescent'
    });
    await loading.present();

    this.isLoading = true;

    try {
      // Configure service
      this.imageDescriptionService.setConfiguration(this.apiKey, this.modelName);
      
      const result = await this.imageDescriptionService.describeImageWithGemini(this.selectedFile);
      
      this.description = result.description;
      this.results.unshift(result);
      
    } catch (error: any) {
      console.error('Error:', error);
      this.showAlert('Error', `Failed to describe image: ${error.message || 'Unknown error'}`);
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  /**
   * Show configuration dialog
   */
  async showConfigDialog() {
    const alert = await this.alertController.create({
      header: 'Gemini API Configuration',
      message: 'Get your free API key from <a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a><br><br><small>Key format: AIzaSy...</small>',
      inputs: [
        {
          name: 'apiKey',
          type: 'password',
          placeholder: 'Enter your Gemini API Key (AIzaSy...)',
          value: this.apiKey
        },
        {
          name: 'model',
          type: 'radio',
          label: 'Gemini 2.5 Flash (Latest - Recommended)',
          value: 'gemini-2.5-flash',
          checked: this.modelName === 'gemini-2.5-flash'
        },
        {
          name: 'model',
          type: 'radio',
          label: 'Gemini 2.5 Pro (Best Quality)',
          value: 'gemini-2.5-pro',
          checked: this.modelName === 'gemini-2.5-pro'
        },
        {
          name: 'model',
          type: 'radio',
          label: 'Gemini 2.0 Flash (Fast)',
          value: 'gemini-2.0-flash',
          checked: this.modelName === 'gemini-2.0-flash'
        },
        {
          name: 'model',
          type: 'radio',
          label: 'Gemini 2.0 Flash Lite (Lightweight)',
          value: 'gemini-2.0-flash-lite',
          checked: this.modelName === 'gemini-2.0-flash-lite'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            if (!data.apiKey) {
              this.showAlert('Error', 'Please enter your API key.');
              return false;
            }
            
            this.apiKey = data.apiKey;
            this.modelName = data.model || 'gemini-2.5-flash';
            
            // Save to localStorage
            localStorage.setItem('geminiApiKey', this.apiKey);
            localStorage.setItem('geminiModel', this.modelName);
            
            this.showAlert('Success', 'Gemini API configured successfully!');
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Show alert dialog
   */
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
