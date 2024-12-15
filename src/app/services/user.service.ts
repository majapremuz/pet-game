import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import * as SHA1 from 'crypto-js/sha1';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users';
  private username: string = '';
  private password: string = '';
  private userId: string = '';
  private selectedDog: any = null;

  constructor(private http: HttpClient) {}

  // User-related methods
  setUsername(name: string) {
    this.username = name;
    console.log('Username fetched:', this.username);
  }

  getUsername(): string {
    return this.username || '';
  }

  setUserId(id: string) {
    this.userId = id;
  }

  getUserId(): string {
    return this.userId || '';
  }

  setUserPassword(password: string) {
    this.password = password;
  }

  getUserPassword(): string {
    return this.password;
  }

  isLoggedIn(): boolean {
    return this.username.length > 0;
  }

  login(username: string, password: string): Observable<any> {
    const hashedUsername = SHA1(username).toString();
    const hashedPassword = SHA1(password).toString();
    const url = `${this.apiUrl}?username=${hashedUsername}&password=${hashedPassword}`;
    return this.http.get<any[]>(url).pipe(
      tap((response) => {
        if (response.length > 0) {
          console.log('Login successful:', response[0]);
        } else {
          console.log('Login failed: Invalid credentials');
        }
      })
    );
  }

  saveOnlineData(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

    saveOfflineData(data: any) {
      const offlineData = {
        username: data.username,
        petStats: data.petStats,
      };
      this.http.post(this.apiUrl, offlineData);
      console.log('Offline data saved:', offlineData);
    }

    getOfflineData(): any {
      const data = localStorage.getItem('offlinePetData');
      return data ? JSON.parse(data) : null;
    }

  clearUserData() {
    this.username = '';
    this.userId = '';
    console.log('User data cleared from service.');
  }

  logOut(): void {
    this.username = '';
    this.userId = '';
    console.log('User logged out and data cleared.');
  }

  // Pet-related methods
  setSelectedDog(dogData: any) {
    this.selectedDog = dogData;
  }

  getSelectedDog(): Observable<any> {
    const url = `${this.apiUrl}/${this.userId}`;
    return this.http.get<any>(url).pipe(
      tap(response => {
        console.log('API response:', response);
      }),
      map(user => user.petStats)
    );
  }
  

  updateDogStats(updatedStats: any) {
    if (this.selectedDog) {
      this.selectedDog = { ...this.selectedDog, stats: updatedStats };
      console.log('Dog stats updated:', this.selectedDog);
    }
  }

  /*initializePetData(): Observable<any> {
    return this.getSelectedDog().pipe(
      map(stats => {
        this.selectedDog = stats;
        console.log('Pet data initialized:', this.selectedDog);
        return this.selectedDog;
      })
    );
  }*/

    initializePetData(): Observable<any> {
      return this.getSelectedDog().pipe(
        map(stats => {
          if (stats) {
            this.selectedDog = stats;
            console.log('Pet data initialized:', this.selectedDog);
          } else {
            console.error('No pet data found.');
          }
          return this.selectedDog;
        })
      );
    }
    
    
  getPetStatsByUserId(userId: string): Observable<any> {
    const url = `${this.apiUrl}/${userId}`;
    return this.http.get<any>(url).pipe(
      map(user => user.petStats)
    );
  }

  updatePetStats(petStats: { name: string; smart: number; speed: number; strength: number }): Observable<any> {
    const url = `${this.apiUrl}/${this.userId}`;
    return this.http.put(url, { petStats });
  }

  clearPetData() {
    this.selectedDog = null;
  }

  // Profile management methods
  profileExists(): boolean {
    return this.username.length > 0;
  }

  deleteProfile(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }

  // Sleep and wake time methods
  getSleepTime(): string {
    return ''; 
  }

  setSleepTime(time: string) {}

  getWakeTime(): string {
    return ''; 
  }

  setWakeTime(time: string) {}

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const payload = { currentPassword, newPassword };
    return this.http.post<any>('/api/change-password', payload);
  }

  initializeUserData() {
    this.username = localStorage.getItem('username') || '';
    this.userId = localStorage.getItem('userId') || '';
    console.log('User data initialized:', this.username, this.userId);
  }
}
