import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-create-pet',
  templateUrl: './create-pet.page.html',
  styleUrls: ['./create-pet.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CreatePetPage implements OnInit {
  currentSlideIndex: number = 0;
  slides: HTMLElement[] = [];
  selectedDogImage: string = '';


  constructor(
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.showSlide(this.currentSlideIndex);
  }

  plusSlides(n: number) {
    this.currentSlideIndex += n;
    if (this.currentSlideIndex >= this.slides.length) {
      this.currentSlideIndex = 0;
    } else if (this.currentSlideIndex < 0) {
      this.currentSlideIndex = this.slides.length - 1;
    }
    this.showSlide(this.currentSlideIndex);
  }

  showSlide(index: number) {
    this.slides = Array.from(document.getElementsByClassName('slide') as HTMLCollectionOf<HTMLElement>);
    this.slides.forEach((slide, i) => {
      slide.style.display = i === index ? 'block' : 'none';
    });
  }

    async game() {
      const alert = await this.alertController.create({
        message: 'Are you sure you want to pick this dog?',
        cssClass: 'alert',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
            }
          },
          {
            text: 'Yes',
            handler: () => {
              switch (this.currentSlideIndex) {
                case 0:
                  this.selectedDogImage = 'assets/dog 1.png';
                  break;
                case 1:
                  this.selectedDogImage = 'assets/dog 2.png';
                  break;
                case 2:
                  this.selectedDogImage = 'assets/dog 3.png';
                  break;
              }
              this.router.navigate(['/game'], { state: { selectedDogImage: this.selectedDogImage } });
            }
          }
        ]
      });
    
      await alert.present();
    }
    

}
