import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as SHA1 from 'crypto-js/sha1';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {
}

  private username: string = '';

  setUsername(name: string) {
    this.username = name;
    localStorage.setItem('username', name); 
  }

  getUsername(): string {
    return this.username || localStorage.getItem('username') || '';
  }

  saveOnlineData(username: string, password: string, petName: string, pushToken: string) {
    const hashedUsername = SHA1(username).toString();
    const hashedPassword = SHA1(password).toString();

    const data = {
      username: hashedUsername,
      password: hashedPassword,
      petName,
      pushToken,
    };

    return this.http.post(this.apiUrl, data); 
  }

  saveOfflineData(username: string) {
    const hashedUsername = SHA1(username).toString();

    const offlineData = {
      username: hashedUsername,
    };

    localStorage.setItem('userData', JSON.stringify(offlineData));
    console.log('Saved offline data:', offlineData);
  }

  getSleepTime(): string {
    return localStorage.getItem('sleepTime') || '';
  }
  
  setSleepTime(time: string) {
    localStorage.setItem('sleepTime', time);
  }
  
  getWakeTime(): string {
    return localStorage.getItem('wakeTime') || '';
  }
  
  setWakeTime(time: string) {
    localStorage.setItem('wakeTime', time);
  }  

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const payload = { currentPassword, newPassword };
    return this.http.post<any>('/api/change-password', payload);
  }
  
  profileExists() {
    return this.username.length > 0;
  }

}
