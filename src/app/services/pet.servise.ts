import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {
  }

  private selectedDog: any = null;
  private apiUrl = 'http://localhost:3000/users';
  private userId: string = '';

  setSelectedDog(dogData: any) {
    this.selectedDog = dogData;
  }

  getSelectedDog(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${this.userService.getUserId()}`).pipe(
      map(user => user.petStats)
    );
  }
  
  updateDogStats(updatedStats: any) {
    this.selectedDog = { ...this.selectedDog, stats: updatedStats };
    console.log('Dog stats updated:', this.selectedDog);
  }

  initializePetData(): Observable<any> {
    return this.getSelectedDog().pipe(
      map(stats => {
        this.selectedDog = stats;
        console.log('Pet data initialized:', this.selectedDog);
        return this.selectedDog;
      })
    );
  }

  setUserId(id: string) {
    this.userId = id;
    console.log("User ID successfully set:", this.userId);
  }

  getPetStatsByUserId(userId: string): Observable<any> {
    const url = `${this.apiUrl}/${userId}`;
    return this.http.get<any>(url).pipe(
      map(user => user.petStats)
    );
  }

  updatePetStats(petStats: { name: string; smart: number; speed: number; strength: number }) {
    return this.http.put(`${this.apiUrl}${this.userService.getUserId()}`, petStats);
  }
  
  clearPetData() {
    this.selectedDog = null;
  }
    
}
