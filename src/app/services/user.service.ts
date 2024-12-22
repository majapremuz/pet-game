import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import * as SHA1 from 'crypto-js/sha1';

export interface GameState {
  hungerValue: number;
  fatigueValue: number;
  purityValue: number;
  attentionValue: number;
  hungerColor: string;
  fatigueColor: string;
  purityColor: string; 
  attentionColor: string; 
  hungerNextAction: Date;
  fatigueNextAction: Date;
  purityNextAction: Date;
  attentionNextAction: Date;
  points: number;
  level: number;
  progressBarWidth: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private username: string = '';
  private password: string = '';
  private selectedDog: any = null;
  private gameState: GameState = {
    hungerValue: 100,
    fatigueValue: 100,
    purityValue: 100,
    attentionValue: 100,
    hungerColor: '#d3ba77',
    fatigueColor: '#d3ba77',  
    purityColor: '#d3ba77',
    attentionColor: '#d3ba77',
    hungerNextAction: new Date(),
    fatigueNextAction: new Date(),
    purityNextAction: new Date(),
    attentionNextAction: new Date(),
    points: 0,
    level: 0,
    progressBarWidth: 0
  };

  constructor(private router: Router) {
    this.initializeUserData();
    this.initializeGameState();
  }

  setUsername(name: string) {
    this.username = name;
    localStorage.setItem('username', name);
    console.log('Username set:', this.username);
  }

  getUsername(): string {
    return this.username || '';
  }

  setUserPassword(password: string) {
    this.password = password;
    localStorage.setItem('password', password);
    console.log('Password set');
  }

  getUserPassword(): string {
    return this.password || '';
  }

      initializeUserData(): void {
        this.username = localStorage.getItem('username') || '';
      this.password = localStorage.getItem('password') || '';
      const storedPetData = localStorage.getItem('selectedDog');
      this.selectedDog = storedPetData ? JSON.parse(storedPetData) : null;
        const savedState = this.getGameState();
        const defaultState = this.getDefaultGameState();
      
        // Merge saved state with defaults to avoid missing properties
        const initializedState = { ...defaultState, ...savedState };
        this.setGameState(initializedState);
        console.log('Initialized game state:', initializedState);
      }
      
    
    initializeGameState(): void {
      const savedState = localStorage.getItem('gameState');
      if (savedState) {
        try {
          this.gameState = { ...this.getDefaultGameState(), ...JSON.parse(savedState) };
        } catch (error) {
          console.error('Failed to parse game state, resetting to default:', error);
          this.resetGameState();
        }
      } else {
        this.resetGameState(); 
      }
    }
    
    
  // User-related methods
  login(username: string, password: string): Observable<any> {
    const hashedUsername = SHA1(username).toString();
    const hashedPassword = SHA1(password).toString();
  
    console.log('login: ', hashedUsername, hashedPassword);
  
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.username === hashedUsername && u.password === hashedPassword);
  
    if (user) {
      this.username = hashedUsername;
      this.password = hashedPassword;
  
      // Save to localStorage
      localStorage.setItem('username', this.username);
      localStorage.setItem('password', this.password);
  
      this.initializeUserData();
      console.log('Login successful');
      return of(user);
    } else {
      console.error('Invalid credentials');
      throw new Error('Invalid credentials');
    }
  }
  

  isLoggedIn(): Observable<boolean> {
    const user = localStorage.getItem('username');
    return of(!!user);
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
      this.password = '';
      this.selectedDog = null;
      this.resetGameState();
  
      sessionStorage.clear();
    
      this.router.navigate(['/home'], { replaceUrl: true }).then(() => {
        console.log('Redirected to home and cleared session state.');
      });
    
      console.log('User logged out. Session cleared.');
    }
    
    
    
  
  
  // Pet-related methods
  getSelectedDog() {
    return this.selectedDog || {};
  }

  setSelectedDog(dogStats: any) {
    this.selectedDog = dogStats;
    localStorage.setItem('selectedDog', JSON.stringify(dogStats));
    console.log("SELECTED DOG: ", this.selectedDog)
  }

      getPetStatsByUsername(username: string): Observable<any> {
        // Attempt to get pet data associated with the username
        const storedPetData = localStorage.getItem('selectedDog');
        if (storedPetData) {
          const petData = JSON.parse(storedPetData);
          console.log("Fetched pet stats:", petData);
          return of(petData); // Return as observable
        } else {
          console.warn('No pet data found for the user.');
          return of(null); // Return null if no pet data found
        }
      }

      selectDog(dog: any) {
        const selectedDog = {
          image: dog.image,
          name: dog.name,
          smart: dog.smart,
          speed: dog.speed,
          strength: dog.strength,
        };
        localStorage.setItem('selectedDog', JSON.stringify(selectedDog));
      }
      
      

  initializePetData(): Observable<any> {
    const user = JSON.parse(localStorage.getItem('username') || '{}');
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
      // Retrieve the existing pet data
      const storedPetData = localStorage.getItem('selectedDog');
      if (storedPetData) {
        const existingPetData = JSON.parse(storedPetData);
    
        // Merge the existing data with the new stats
        const updatedPetData = { ...existingPetData, ...petStats };
    
        // Save the merged data back to localStorage
        localStorage.setItem('selectedDog', JSON.stringify(updatedPetData));
        console.log('Pet stats updated:', updatedPetData);
      } else {
        console.warn('No existing pet data found. Unable to update stats.');
      }
    }
    

  /*clearPetData() {
    this.selectedDog = null; // Clear pet session memory
    console.log('Pet session data cleared.');
  }
  */

  // Profile management methods
  deleteProfile(username: string): void {
    // Remove user from the local storage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.filter((u: any) => u.username !== username);
  
    // Remove the user from the users list
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  
    // Clear the specific user data
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('password');
  
    // Clear the user's dog and game data
    localStorage.removeItem('selectedDog');
    localStorage.removeItem('offlinePetData');
    localStorage.removeItem('gameState'); 
    // Reset in-memory data
    this.username = '';
    this.password = '';
    this.selectedDog = null;
    this.resetGameState(); 
  
    this.router.navigate(['/home'], { replaceUrl: true }).then(() => {
      console.log('Profile deleted. Redirected to home.');
    });
  
    // Call necessary initialization methods again
    this.initializeUserData();
    this.initializeGameState();
  }
    
  changePassword(currentPassword: string, newPassword: string): void {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === this.username);

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

 // Game data handling
 
getGameState(): any {
  const savedState = localStorage.getItem('gameState');
  return savedState ? JSON.parse(savedState) : this.getDefaultGameState();
}


setGameState(newGameState: any): void {
  this.gameState = newGameState;
  localStorage.setItem('gameState', JSON.stringify(newGameState));
  console.log('Game state updated:', newGameState);
}


getStatValue(stat: keyof GameState): number {
  return this.gameState[stat] as number; 
}

updateStatValue(stat: keyof GameState, value: number): void {
  if (this.gameState[stat] !== value) {
    this.gameState[stat] = value;
    this.saveGameState(this.gameState); // Persist changes
  }
}

updateGameState(newState: Partial<GameState>): void {
  const savedState = localStorage.getItem('gameState');
  const currentState = this.gameState;

  // Check if the new state is different from the current state
  const hasChanges = Object.keys(newState).some(key => currentState[key] !== newState[key]);

  // Check if the saved state is the same as the new state to avoid unnecessary updates
  const isDifferentFromSaved = savedState && JSON.parse(savedState) !== newState;

  if (hasChanges && isDifferentFromSaved) {
    this.gameState = { ...this.gameState, ...newState };
    console.log('Updated game state:', this.gameState);
    this.saveGameState(this.gameState); // Persist changes
  }
}

saveGameState(gameState: GameState): void {
  // Store the game state in localStorage
  localStorage.setItem('gameState', JSON.stringify(gameState));
  console.log('Game state saved:', gameState);
}





getDefaultGameState(): GameState {
  return {
    hungerValue: 100,
    fatigueValue: 100,
    purityValue: 100,
    attentionValue: 100,
    hungerColor: '#d3ba77',
    fatigueColor: '#d3ba77',
    purityColor: '#d3ba77',
    attentionColor: '#d3ba77',
    hungerNextAction: new Date(),
    fatigueNextAction: new Date(),
    purityNextAction: new Date(),
    attentionNextAction: new Date(),
    points: 0,
    level: 0,
    progressBarWidth: 0
  };
}

resetGameState(): void {
  this.gameState = this.getDefaultGameState();
  localStorage.removeItem('gameState');  
  console.log('Game state has been reset.');
}


clearGameState(): void {
  localStorage.removeItem('gameState');
  console.log('Game state cleared');
}


gethungerValue(): number {
  return this.gameState.hungerValue;
}

getattentionValue(): number {
  return this.gameState.attentionValue;
}

getpurityValue(): number {
  return this.gameState.purityValue;
} 

getfatigueValue(): number {
  return this.gameState.fatigueValue;   
}

}
