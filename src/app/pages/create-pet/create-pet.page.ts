import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { PetService } from 'src/app/services/pet.servise';
import { UserService } from 'src/app/services/user.service';

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
  showInput: boolean = false;
  petName: string = '';
  dogStats: any = {};

  constructor(
    private router: Router,
    private alertController: AlertController,
    private petService: PetService,
    private userService: UserService
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
    const profileExists = this.userService.profileExists();
    if (!profileExists) {
      this.router.navigate(['/create-profile']);
      return;
    }
  
    const alert = await this.alertController.create({
      message: 'Are you sure you want to pick this dog?',
      cssClass: 'alert',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.showInput = true; 
            // Set default dog stats
            let dogStats = { name: this.petName, smart: 0, speed: 0, strength: 0 };
  
            // Determine dog stats based on current slide index
            switch (this.currentSlideIndex) {
              case 0:
                this.selectedDogImage = 'assets/dog 1.png';
                dogStats = { name: this.petName, smart: 10, speed: 5, strength: 5 };
                break;
              case 1:
                this.selectedDogImage = 'assets/dog 2.png';
                dogStats = { name: this.petName, smart: 5, speed: 10, strength: 5 };
                break;
              case 2:
                this.selectedDogImage = 'assets/dog 3.png';
                dogStats = { name: this.petName, smart: 5, speed: 5, strength: 10 };
                break;
            }
  
            // Check if petName has been set before saving
            if (this.petName.trim()) {
              // Save dog data with petName and stats to PetService
              this.petService.setSelectedDog({ image: this.selectedDogImage, name: this.petName, stats: dogStats });
              this.router.navigate(['/game']); // Navigate here if required
            } else {
              // Handle case where petName is not set (maybe show an alert or error message)
              console.warn('Pet name is empty or not set.');
            }
          }
        }
      ]
    });
  
    await alert.present();
  }
  

}
