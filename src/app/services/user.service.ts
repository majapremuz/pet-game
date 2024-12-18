import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import * as SHA1 from 'crypto-js/sha1';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users';
  private username: string = '';
  private userId: string = '';
  private password: string = '';
  private selectedDog: any = null;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

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

  initializeUserData(): void {
    const user = localStorage.getItem('authUser');
    if (user) {
      const parsedUser = JSON.parse(user);
      this.username = parsedUser.username;
      this.userId = parsedUser.id;
      console.log('User data initialized:', this.username, this.userId);
    } else {
      console.log('No user data found in local storage.');
    }
  }

  // User-related methods
  login(username: string, password: string): Observable<any> {
    const hashedUsername = SHA1(username).toString();
    const hashedPassword = SHA1(password).toString();
    const url = `${this.apiUrl}?username=${hashedUsername}&password=${hashedPassword}`;

    return this.http.get<any[]>(url).pipe(
      map(users => {
        if (users.length > 0) {
          const user = users[0];
          this.username = user.username;
          this.userId = user.id;
          console.log('Login successful:', user);
          this.router.navigate(['/game']);
          return user;
        } else {
          throw new Error('Invalid credentials');
        }
      })
    );
  }

  isLoggedIn(): Observable<boolean> {
    if (!this.username || !this.userId) {
      return this.fetchUserData().pipe(
        map(user => {
          this.username = user.username;
          this.userId = user.id;
          return !!this.username && !!this.userId;
        })
      );
    }
    return new Observable(observer => observer.next(true));
  }

  fetchUserData(): Observable<any> {
    if (!this.userId) {
      console.warn('User ID not available. Returning empty observable.');
      return new Observable((observer) => observer.next(null));
    }
    const url = `${this.apiUrl}/${this.userId}`;
    return this.http.get<any>(url).pipe(
      tap(user => console.log('Fetched user data:', user))
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

  logOut(): void {
    this.username = '';
    this.userId = '';
    this.selectedDog = null;
    this.router.navigateByUrl('/home').then(() => {
      console.log('Redirected to home after logout.');
    }).catch(error => {
      console.error('Navigation error during logout:', error);
    });
  }

  clearUserData() {
    this.username = '';
    this.userId = '';
    console.log('User data cleared from service.');
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

  getPetStatsByUserId(userId: string): Observable<any> {
    const url = `${this.apiUrl}/${userId}`;
    return this.http.get<any>(url).pipe(
      map(user => user.petStats)
    );
  }

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

  updatePetStats(petStats: { name: string; smart: number; speed: number; strength: number }): Observable<any> {
    if (!this.userId) {
      throw new Error('No user ID available for updating pet stats.');
    }
    const url = `${this.apiUrl}/${this.userId}`;
    return this.http.put(url, { petStats }).pipe(
      tap(response => console.log('Updated pet stats:', response))
    );
  }

  clearPetData() {
    this.selectedDog = null;
    console.log('Pet data cleared from service.');  
  }

  // Profile management methods
  deleteProfile(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`).pipe(
      tap(() => console.log('Profile deleted for user ID:', userId))
    );
  }

    changePassword(currentPassword: string, newPassword: string): Observable<any> {
      if (!this.userId) {
        throw new Error('No user ID available for changing password.');
      }
    
      // Fetch user data to validate current password
      return this.http.get<any>(`${this.apiUrl}/${this.userId}`).pipe(
        map(user => {
          if (user.password !== currentPassword) {
            throw new Error('Current password is incorrect.');
          }
          // Update user data with the new password
          const updatedUser = { ...user, password: newPassword };
          return updatedUser;
        }),
        // Save updated user data
        switchMap(updatedUser => 
          this.http.put(`${this.apiUrl}/${this.userId}`, updatedUser)
        ),
        tap(() => console.log('Password changed successfully.'))
      );
    }
    
  getSleepTime(): string {
    return ''; 
  }

  setSleepTime(time: string) {}
}
