import { Injectable } from '@angular/core';
//import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(){//private http: HttpClient) {
}

  private username: string = '';

  setUsername(name: string) {
    this.username = name;
    localStorage.setItem('username', name); 
  }

  getUsername(): string {
    return this.username || localStorage.getItem('username') || '';
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

  /*changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const payload = { currentPassword, newPassword };
    return this.http.post<any>('/api/change-password', payload);
  }*/
  
  profileExists() {
    return this.username.length > 0;
  }

}
