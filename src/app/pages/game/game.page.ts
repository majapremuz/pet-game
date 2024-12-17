import { Component, ChangeDetectorRef, Injector } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

type StatName = 'hunger' | 'fatigue' | 'purity' | 'attention';
type StatColorName = 'hungerColor' | 'fatigueColor' | 'purityColor' | 'attentionColor';

interface StatProperties {
  hungerValue: number;
  fatigueValue: number;
  purityValue: number;
  attentionValue: number;
}

@Component({
  selector: 'app-game',
  templateUrl: 'game.page.html',
  styleUrls: ['game.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class GamePage implements StatProperties  {
  hungerValue: number = 100;
  fatigueValue: number = 100;
  purityValue: number = 100;
  attentionValue: number = 100;

  hungerColor: string = '#d3ba77';
  fatigueColor: string = '#d3ba77';
  purityColor: string = '#d3ba77';
  attentionColor: string = '#d3ba77';

  value: number = 100;
  decreaseInterval: any;
  points: number = 0; 
  level: number = 0; 
  pointsNeeded: number = 10; 
  maxPoints: number = 100; 
  progressBarWidth: number = 0; 
  currentColor: string = '#d3ba77';
  isJumping: boolean = false;
  audio: HTMLAudioElement;
  petName: string = '';
  petSmart: number = 0;
  petSpeed: number = 0;
  petStrength: number = 0;
  selectedDogImage: string = '';
  dogStats: any = {};
  showHeart: boolean = false;
  nextFeedTime: Date | undefined;

  currentStatValue: number = this.hungerValue;
currentStatColor: string = this.getStatusColor(this.hungerValue);

   // New properties for intervals and next action times
   hungerNextAction: Date | undefined;
   fatigueNextAction: Date | undefined;
   purityNextAction: Date | undefined;
   attentionNextAction: Date | undefined;
   
  constructor(
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private injector: Injector
  ) {
    const navigation = this.router.getCurrentNavigation();
  if (navigation?.extras.state) {
    this.selectedDogImage = navigation.extras.state['selectedDogImage'];
    this.petName = navigation.extras.state['petName'];
  }
  this.audio = new Audio('assets/bark.wav');
  }

  private get userService(): UserService {
    return this.injector.get(UserService);
  }

  ngOnInit() {
    this.loadGameState();
    this.userService.initializePetData().subscribe(selectedDog => {
      if (selectedDog) {
        this.selectedDogImage = selectedDog.image;
        this.petName = selectedDog.name;
          this.petSmart = selectedDog.smart;
          this.petSpeed = selectedDog.speed;
          this.petStrength = selectedDog.strength;
          console.log("dog stats: ", this.petSmart, this.petSpeed, this.petStrength)
      } else {
        console.warn("No selected dog found. Redirecting to pet selection page.");
        this.router.navigate(['/create-pet']);
      }
    });

    this.setInitialActionTimes();
    this.startStatusDecreasing();
    this.updateColorGradually();
  }

   /*setInitialActionTimes() {
    const now = new Date();
    this.hungerNextAction = new Date(now.getTime() + this.getRandomInterval(6, 12)); // 6-12 hours
    this.fatigueNextAction = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    this.purityNextAction = new Date(now.getTime() + 18 * 60 * 60 * 1000); // 18 hours
    this.attentionNextAction = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8 hours
  }*/

    setInitialActionTimes() {
      const now = new Date();
      this.hungerNextAction = new Date(now.getTime() + this.getRandomInterval(1, 2)); // 1-2 minutes
      this.fatigueNextAction = new Date(now.getTime() + 3 * 60 * 1000); // 3 minutes
      this.purityNextAction = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes
      this.attentionNextAction = new Date(now.getTime() + 1 * 60 * 1000); // 1 minute
    }

  // Returns a random interval within the given hour range
  /*getRandomInterval(minHours: number, maxHours: number): number {
    const randomHours = Math.floor(Math.random() * (maxHours - minHours + 1) + minHours);
    return randomHours * 60 * 60 * 1000;
  }*/
getRandomInterval(minMinutes: number, maxMinutes: number): number {
  const randomMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1) + minMinutes);
  return randomMinutes * 60 * 1000; // Convert minutes to milliseconds
}

  /*startStatusDecreasing() {
    const decrementIntervals: Record<StatName, number> = {
      hunger: 6 * 60 * 60 * 1000, // 6 hours
      fatigue: 24 * 60 * 60 * 1000, // 24 hours
      purity: 18 * 60 * 60 * 1000, // 18 hours
      attention: 8 * 60 * 60 * 1000, // 8 hours
    };
  
    Object.entries(decrementIntervals).forEach(([stat, interval]) => {
      setInterval(() => {
        this.decreaseStat(stat as StatName, 10);
      }, interval);
    });
  }*/

    startStatusDecreasing() {
      const decrementIntervals: Record<StatName, number> = {
        hunger: 1 * 60 * 1000, // 1 minute
        fatigue: 3 * 60 * 1000, // 3 minutes
        purity: 2 * 60 * 1000, // 2 minutes
        attention: 1 * 60 * 1000, // 1 minute
      };
    
      Object.entries(decrementIntervals).forEach(([stat, interval]) => {
        setInterval(() => {
          this.decreaseStat(stat as StatName, 10); // Decrement by 10 for testing
        }, interval);
      });
    }
  
  /*decreaseStat(stat: StatName, decrement: number) {
    let valueKey: keyof StatProperties;

    switch (stat) {
        case 'hunger':
            valueKey = 'hungerValue';
            break;
        case 'fatigue':
            valueKey = 'fatigueValue';
            break;
        case 'purity':
            valueKey = 'purityValue';
            break;
        case 'attention':
            valueKey = 'attentionValue';
            break;
        default:
            throw new Error(`Invalid stat: ${stat}`);
    }

    this[valueKey] = Math.max(this[valueKey] - decrement, 0);
    this.checkAlert(stat);
    this.updateContainerHeight(stat);
    this.cdRef.markForCheck();
}*/

decreaseStat(stat: StatName, decrement: number) {
  const valueKey = `${stat}Value` as keyof StatProperties;
  this[valueKey] = Math.max(this[valueKey] - decrement, 0);
  this.updateStatColorsAndHeight(stat);
  this.updateCurrentStat(stat);
}

  // Update the next action time based on the stat
  private updateNextActionTime(stat: StatName) {
    const now = Date.now();
    switch(stat) {
      case 'hunger':
        this.hungerNextAction = new Date(now + this.getRandomInterval(6, 12));
        break;
      case 'fatigue':
        this.fatigueNextAction = new Date(now + 24 * 60 * 60 * 1000);
        break;
      case 'purity':
        this.purityNextAction = new Date(now + 18 * 60 * 60 * 1000);
        break;
      case 'attention':
        this.attentionNextAction = new Date(now + 8 * 60 * 60 * 1000);
        break;
    }
  }

handleAction(action: StatName) {
  const now = new Date();
  let nextActionTime: Date | undefined;
  let incrementValue: number = 0;

  switch (action) {
    case 'hunger':
      nextActionTime = this.hungerNextAction;
      incrementValue = 20;
      break;
    case 'fatigue':
      nextActionTime = this.fatigueNextAction;
      incrementValue = 30;
      break;
    case 'purity':
      nextActionTime = this.purityNextAction;
      incrementValue = 20;
      break;
    case 'attention':
      nextActionTime = this.attentionNextAction;
      incrementValue = 25;
      break;
  }

  if (nextActionTime) {
    const timeDifference = Math.abs(now.getTime() - nextActionTime.getTime()) / (60 * 1000);
    if (timeDifference <= 10) this.addPoint(1);
    else if (now < nextActionTime) this.addPoint(0.5);
    else this.addPoint(0);

    nextActionTime.setTime(now.getTime() + this.getRandomInterval(6, 12));
  }

  this.increaseStat(action, incrementValue);
  this.updateStatColorsAndHeight(action);
}

increaseStat(stat: StatName, increment: number) {
  const valueKey = `${stat}Value` as keyof StatProperties;
  this[valueKey] = Math.min(this[valueKey] + increment, 100);
  this.updateStatColorsAndHeight(stat);
  this.updateCurrentStat(stat);
}

updateStatColorsAndHeight(stat: StatName) {
  const valueKey = `${stat}Value` as keyof StatProperties;
  const colorKey = `${stat}Color` as StatColorName;

  const currentValue = this[valueKey] as number;
  this[colorKey] = this.getStatusColor(currentValue);
  this.cdRef.markForCheck();
}

updateCurrentStat(stat: StatName) {
  const valueKey = `${stat}Value` as keyof StatProperties;
  const colorKey = `${stat}Color` as StatColorName;
  this.currentStatValue = this[valueKey];
  this.currentStatColor = this[colorKey];
}

checkAlert(stat: StatName) {
  const valueKey = `${stat}Value` as keyof StatProperties;
  if (this[valueKey] < 10) {
    alert(`Your pet's ${stat} is critically low!`);
  }
}


  getStatusColor(value: number): string {
    if (value >= 75) {
      return '#176205';
    } else if (value >= 50) {
      return '#2fc50c';
    } else if (value >= 30) {
      return '#f4ed19';
    } else if (value >= 10) {
      return '#f59019';
    } else {
      return '#a60807';
    }
  }

updateContainerHeight(stat: StatName) {
  const valueKey = `${stat}Value` as keyof StatProperties;
  const statElement = document.getElementById(`${stat}-container`);
  if (statElement) {
    statElement.style.height = this.getContainerHeight(this[valueKey] as number);
  }
}


  getContainerHeight(value: number): string {
    return `${value}%`; 
}

  updateColorGradually() {
    setInterval(() => {
      const currentHour = new Date().getHours();
      // Map the hour (0-23) to a color value (from morning to night)
      const colorValue = 255 - Math.floor((currentHour / 23) * 255); // Adjust as needed
      this.currentColor = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
      this.cdRef.detectChanges();
    }, 2000); // Update every hour
  }

  syncCurrentStat(stat: StatName) {
    const valueKey = `${stat}Value` as keyof StatProperties;
    this.currentStatValue = this[valueKey] as number;
    this.currentStatColor = this.getStatusColor(this.currentStatValue);
  }

  increaseSmart() {
    this.petSmart = Number(this.petSmart) + 1;
    console.log("smart: ", this.petSmart);
    this.savePetStats();
}

increaseSpeed() {
  this.petSpeed = Number(this.petSpeed) + 1;
    console.log("speed: ", this.petSpeed);
    this.savePetStats();
}

increaseStrength() {
  this.petStrength = Number(this.petStrength) + 1;
    console.log("strength: ", this.petStrength);
    this.savePetStats();
}

  // Save the updated stats to the user service
savePetStats() {
  this.userService.updatePetStats({
      name: this.petName,
      smart: this.petSmart,
      speed: this.petSpeed,
      strength: this.petStrength,
  }).subscribe(
      () => console.log(`Pet stats updated successfully.`),
      (error) => console.error("Failed to update pet stats:", error)
  );
}
  
  bath() {
    this.handleAction('purity');
    this.updateCurrentStat('purity');
  }

  sleep() {
    this.handleAction('fatigue');
    this.updateCurrentStat('fatigue');
  }

  care() {
    this.handleAction('attention');
    this.updateCurrentStat('attention');
  }

  feed() {
    this.handleAction('hunger');
    this.updateCurrentStat('hunger');
  }

  setNextFeedTime() {
    const now = new Date();
    const randomHours = Math.floor(Math.random() * 6) + 6; // 6 do 12 sati
    this.nextFeedTime = new Date(now.getTime() + randomHours * 60 * 60 * 1000);
  }

  loadGameState() {
    const savedLevel = localStorage.getItem('level');
    const savedPoints = localStorage.getItem('points');
    const savedPointsNeeded = localStorage.getItem('pointsNeeded');

    if (savedLevel) {
      this.level = parseInt(savedLevel);
    }
    if (savedPoints) {
      this.points = parseInt(savedPoints);
    }
    if (savedPointsNeeded) {
      this.pointsNeeded = parseInt(savedPointsNeeded);
    }
  }

  saveGameState() {
    localStorage.setItem('level', this.level.toString());
    localStorage.setItem('points', this.points.toString());
    localStorage.setItem('pointsNeeded', this.pointsNeeded.toString());
  }

  checkLevelUp() {
    if (this.points >= this.pointsNeeded) {
      this.level += 1;
      this.points = 0;
      this.pointsNeeded = Math.floor(this.pointsNeeded * 1.1);
      console.log('Navigating with levelUp:', this.level);
      // Navigate to profile page and pass a flag to trigger the level-up modal
      this.router.navigate(['/profile'], { state: { levelUp: true } });
    }
  }
  

  // Adds points based on user timing
  addPoint(points: number) {
    this.points += points;
    this.checkLevelUp();
    this.progressBarWidth = (this.points / this.pointsNeeded) * 100;
    if (this.points >= this.pointsNeeded) {
      this.levelUp();
    }
  }

  // Method to handle leveling up
  levelUp() {
    if (this.level < 50) { 
      this.level += 1;        
      this.points = 0;
      this.pointsNeeded = Math.ceil(this.pointsNeeded * 1.1); 
      this.progressBarWidth = 0;
      this.openLevelUpModal();
    } else {
      this.points = this.pointsNeeded;
      this.progressBarWidth = 100;
      console.log("Maximum level reached.");
    }
  }

  openLevelUpModal() {
    this.router.navigate(['/profile'], { state: { levelUp: true } });
  }

  makeDogJump() {
    this.isJumping = true;
    this.showHeart = true;
    setTimeout(() => {
      this.isJumping = false;
      this.showHeart = false;
    }, 500);
    this.playSound();
  }

  playSound() {
    this.audio.currentTime = 0;
    this.audio.play().catch(error => {
      console.error('Audio playback failed:', error);
    });
  }

  profile() {
    this.router.navigate(['/profile']);
  }

}

