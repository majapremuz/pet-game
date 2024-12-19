import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import * as SHA1 from 'crypto-js/sha1';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private username: string = '';
  private userId: string = '';
  private password: string = '';
  private selectedDog: any = null;

  constructor(private router: Router) {}

  setUsername(name: string) {
    this.username = name;
    localStorage.setItem('username', name);
    console.log('Username fetched:', this.username);
  }

  getUsername(): string {
    return this.username || localStorage.getItem('username') || '';
  }

  setUserId(id: string) {
    this.userId = id;
    localStorage.setItem('userId', id);
    console.log("ID", this.userId)
  }

  getUserId(): string {
    return this.userId || localStorage.getItem('userId') ||  '';
  }

  setUserPassword(password: string) {
    this.password = password;
    localStorage.setItem('password', password);
    console.log("password", this.password)
  }

  getUserPassword(): string {
    return this.password|| localStorage.getItem('password') ||  '';
  }

  initializeUserData(): void {
    const user = localStorage.getItem('authUser');
    if (user) {
      const parsedUser = JSON.parse(user);
      this.username = parsedUser.username;
      this.userId = parsedUser.id;
      console.log('User data initialized from local storage:', this.username, this.userId);
    } else {
      console.log('No user data found in local storage.');
    }
  }

  // User-related methods
  login(username: string, password: string): Observable<any> {
    const hashedUsername = SHA1(username).toString();
    const hashedPassword = SHA1(password).toString();

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(
      (u: any) => u.username === hashedUsername && u.password === hashedPassword
    );

    if (user) {
      this.username = user.username;
      this.userId = user.id;
      localStorage.setItem('authUser', JSON.stringify(user));
      console.log('Login successful:', user);
      this.router.navigate(['/game']);
      return of(user);
    } else {
      throw new Error('Invalid credentials');
    }
  }


  isLoggedIn(): Observable<boolean> {
    const user = localStorage.getItem('authUser');
    return of(!!user);
  }

  fetchUserData(): Observable<any> {
    if (!this.userId) {
      console.warn('User ID not available. Returning empty observable.');
      return new Observable((observer) => observer.next(null));
    }
  
    const user = localStorage.getItem('authUser');
    if (user) {
      const parsedUser = JSON.parse(user);
      console.log('Fetched user data:', parsedUser);
      return new Observable((observer) => observer.next(parsedUser));
    } else {
      console.warn('User data not found in localStorage.');
      return new Observable((observer) => observer.next(null));
    }
  }

  saveOnlineData(data: any): Observable<any> {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(data);
    localStorage.setItem('users', JSON.stringify(users));
    console.log('User data saved to localStorage:', data);
    return new Observable((observer) => observer.next(data));
  }

  saveOfflineData(data: any): void {
    const offlineData = {
      username: data.username,
      petStats: data.petStats,
    };
    const offlineDataArray = JSON.parse(localStorage.getItem('offlineData') || '[]');
    offlineDataArray.push(offlineData);
    localStorage.setItem('offlineData', JSON.stringify(offlineDataArray));
  
    console.log('Offline data saved to localStorage:', offlineData);
  }

  getOfflineData(): any {
    const data = localStorage.getItem('offlinePetData');
    return data ? JSON.parse(data) : null;
  }

  logOut(): void {
    this.username = '';
    this.userId = '';
    this.selectedDog = null;
    localStorage.removeItem('authUser');
    this.router.navigateByUrl('/home').then(() => {
      console.log('Redirected to home after logout.');
    }).catch(error => {
      console.error('Navigation error during logout:', error);
    });
  }

  clearUserData() {
    this.username = '';
    this.userId = '';
    this.selectedDog = null;
    localStorage.removeItem('authUser');
    console.log('User data cleared.');
  }
  


  // Pet-related methods
  getSelectedDog() {
    return JSON.parse(localStorage.getItem('selectedDog') || '{}');
  }

  setSelectedDog(dogStats: any) {
    localStorage.setItem('selectedDog', JSON.stringify(dogStats));
  }

    getPetStatsByUsername(username: string): Observable<any> {
      const user = JSON.parse(localStorage.getItem('authUser') || '{}');
      if (user && user.username === username) {
        return of(user.petStats || null); 
      }
      return of(null);
    }

  initializePetData(): Observable<any> {
    const user = JSON.parse(localStorage.getItem('authUser') || '{}');
    if (user && user.petStats) {
      this.selectedDog = user.petStats;
      console.log('Pet data initialized:', user.petStats);
      return of(this.selectedDog);
    } else {
      console.error('No pet data found.');
      return of(null); 
    }
  }

  updatePetStats(petStats: any): void {
    const user = JSON.parse(localStorage.getItem('authUser') || '{}');
    if (user) {
      user.petStats = petStats;
      localStorage.setItem('authUser', JSON.stringify(user));
      console.log('Pet stats updated:', petStats);
    } else {
      console.error('No user logged in to update pet stats.');
    }
  }


  clearPetData() {
    this.selectedDog = null;
    console.log('Pet data cleared from service.');  
  }

  // Profile management methods
  deleteProfile(userId: string): void {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.filter((u: any) => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.removeItem('authUser');
    localStorage.removeItem('offlinePetData');
    
    console.log('Profile deleted for user ID:', userId);
  }
  


  changePassword(currentPassword: string, newPassword: string): void {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === this.userId);

    if (userIndex > -1 && users[userIndex].password === SHA1(currentPassword).toString()) {
      users[userIndex].password = SHA1(newPassword).toString();
      localStorage.setItem('users', JSON.stringify(users));
      console.log('Password changed successfully.');
    } else {
      console.error('Current password is incorrect or user not found.');
    }
  }
    
  getSleepTime(): string {
    return ''; 
  }

  setSleepTime(time: string) {}
}

