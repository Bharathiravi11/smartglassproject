import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  // This array stores our photos in memory
  public photos: UserPhoto[] = [];

  constructor() { }

  public async addNewToGallery() {
    // 1. Take a photo using the device/web camera
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    // 2. Add the new photo to the top of our gallery array
    this.photos.unshift({
      filepath: 'soon-to-be-saved.jpg',
      webviewPath: capturedPhoto.webPath
    });
  }
}