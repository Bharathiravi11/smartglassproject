import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonIcon, IonGrid, IonRow, IonCol, IonImg } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { PhotoService } from '../services/photo';
import { addIcons } from 'ionicons';
import { camera } from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonIcon, IonGrid, IonRow, IonCol, IonImg, CommonModule]
})
export class Tab2Page {

  constructor(public photoService: PhotoService) {
    // Register the camera icon
    addIcons({ camera });
  }

  takePhoto() {
    this.photoService.addNewToGallery();
  }
}