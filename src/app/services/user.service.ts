import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as SHA1 from 'crypto-js/sha1'; 
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users';
  

  constructor(private http: HttpClient) {}

  private username: string = '';
  private password: string = '';
  private userId: string = '';

  setUsername(name: string) {
    this.username = name;
    console.log("username: ", this.username);
  }

  getUsername(): string {
    return this.username;
  }

  setUserId(id: string) {
    this.userId = id;
    console.log("User ID successfully set:", this.userId);
  }

  getUserId(): string {
    return this.userId;
  }

  setUserPassword(password: string) {
    this.password = password;
  }
  
  getUserPassword(): string {
    return this.password;
  }

  checkDuplicate(username: string, petName: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-duplicate`, {
      params: { username, petName },
    });
  }

  isLoggedIn(): boolean {
    return this.username.length > 0; // Check if username is set in memory
  }

  saveOnlineData(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  saveOfflineData(username: string) {
    const hashedUsername = SHA1(username).toString();
    const offlineData = {
      username: hashedUsername,
    };
    console.log('Saved offline data:', offlineData);
  }

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

  login(username: string, password: string): Observable<any> {
    const hashedUsername = SHA1(username).toString();
    const hashedPassword = SHA1(password).toString();
  
    // Query JSON Server to find matching username and password
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
    
  profileExists() {
    return this.username.length > 0;
  }

  logOut(): void {
    this.username = '';
    this.userId = '';
    console.log('User logged out and data cleared.');
  }

  clearUserData() {
    this.username = '';
    this.userId = '';
    console.log('User data cleared from service.');
  }

  initializeUserData() {
    console.log('User data initialized:', this.username, this.userId);
  }
    
  deleteProfile(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }
}
