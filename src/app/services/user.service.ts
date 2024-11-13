import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
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

  profileExists() {
    return this.username.length > 0;
  }
}
