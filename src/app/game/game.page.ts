import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';

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
  selectedDogImage: string = '';
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
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
  if (navigation?.extras.state) {
    this.selectedDogImage = navigation.extras.state['selectedDogImage'];
  }
  this.audio = new Audio('assets/bark.wav');
  }

  ngOnInit() {
    this.setInitialActionTimes();
    this.startStatusDecreasing();
    this.updateColorGradually();
  }

   // Sets initial times for each action
   setInitialActionTimes() {
    const now = new Date();
    this.hungerNextAction = new Date(now.getTime() + this.getRandomInterval(6, 12)); // 6-12 hours
    this.fatigueNextAction = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    this.purityNextAction = new Date(now.getTime() + 18 * 60 * 60 * 1000); // 18 hours
    this.attentionNextAction = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8 hours
  }

  // Returns a random interval within the given hour range
  getRandomInterval(minHours: number, maxHours: number): number {
    const randomHours = Math.floor(Math.random() * (maxHours - minHours + 1) + minHours);
    return randomHours * 60 * 60 * 1000;
  }

  // Decrease stats gradually at specified intervals
  startStatusDecreasing() {
    setInterval(() => {
      this.decreaseStat('hunger', 10);
    }, 6 * 60 * 60 * 1000); 
  
    setInterval(() => {
      this.decreaseStat('fatigue', 10);
    }, 24 * 60 * 60 * 1000);
  
    setInterval(() => {
      this.decreaseStat('purity', 15);
    }, 18 * 60 * 60 * 1000);
  
    setInterval(() => {
      this.decreaseStat('attention', 5);
    }, 8 * 60 * 60 * 1000);
  }
  
  decreaseStat(stat: StatName, decrement: number) {
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

   // Method to handle actions (e.g., feed, sleep) with timing checks and points assignment
   handleAction(action: StatName) {
    const now = new Date();
    let nextActionTime : Date | undefined;
    let incrementValue: number = 0;
    
    clearInterval(this.decreaseInterval);

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

    this.increaseStat(action, incrementValue);

   // Ensure nextActionTime is defined before proceeding
  if (nextActionTime) {
    const timeDifference = Math.abs(now.getTime() - nextActionTime.getTime()) / (60 * 1000);

    if (timeDifference <= 10) {
      this.addPoint(1);
    } else if (now < nextActionTime) {
      this.addPoint(0.5);
    } else {
      this.addPoint(0); 
    }

    // Update the next interval based on whether the action was early or late
    const newInterval = this.getRandomInterval(6, 12);
    nextActionTime.setTime(now.getTime() + newInterval);
  } else {
    console.warn(`nextActionTime is undefined for action: ${action}`);
  }

  this.increaseStat(action, incrementValue);
}

 // Increase stat helper method
 increaseStat(stat: StatName, increment: number) {
  const valueKey = `${stat}Value` as keyof StatProperties;
  this[valueKey] = Math.min(this[valueKey] + increment, 100);
  this.updateNextActionTime(stat);
  //this.updateStatColors();
  this.updateContainerHeight(stat);
}

updateCurrentStat(stat: StatName) {
  const valueKey = `${stat}Value` as keyof StatProperties;
  this.currentStatValue = this[valueKey];
  this.currentStatColor = this.getStatusColor(this[valueKey] as number);
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
    const colorKey = `${stat}Color` as StatColorName; // Change here
    this[colorKey] = this.getStatusColor(this[valueKey] as number);
    this.cdRef.detectChanges(); 
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

  // Adds points based on user timing
  addPoint(points: number) {
    this.points += points;
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
    } else {
      this.points = this.pointsNeeded;
      this.progressBarWidth = 100;
      console.log("Maximum level reached.");
    }
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

}

