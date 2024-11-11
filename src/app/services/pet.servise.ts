import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private selectedDog: any = null;

  setSelectedDog(dogData: any) {
    this.selectedDog = dogData;
    localStorage.setItem('selectedDog', JSON.stringify(dogData));
  }

  getSelectedDog() {
    return JSON.parse(localStorage.getItem('selectedDog') || 'null');
  }
  

  updateDogStats(updatedStats: any) {
    this.selectedDog = { ...this.selectedDog, stats: updatedStats };
    localStorage.setItem('selectedDog', JSON.stringify(this.selectedDog));  // Update the stats in local storage
    console.log('Dog stats updated:', this.selectedDog);
  }
    
}
