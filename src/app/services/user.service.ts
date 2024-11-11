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

  profileExists() {
    return this.username.length > 0;
  }
}
