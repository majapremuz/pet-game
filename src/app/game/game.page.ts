import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-game',
  templateUrl: 'game.page.html',
  styleUrls: ['game.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class GamePage {
  hungerValue: number = 100;
  fatigueValue: number = 100;
  purityValue: number = 100;
  attentionValue: number = 100;
  //statusValue: number = 100;
  decreaseInterval: any;
  points: number = 0; 
  level: number = 0; 
  pointsNeeded: number = 10; 
  maxPoints: number = 100; 
  progressBarWidth: number = 0; 

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.startStatusDecreasing();
  }

  startStatusDecreasing() {
    // Hunger decreases 2-4 times per day (adjust as needed)
    setInterval(() => this.decreaseStat('hunger', 2), 10000); // 10 seconds for testing, adjust to hours
    setInterval(() => this.decreaseStat('fatigue', 1), 20000); // 20 seconds for testing, adjust to hours
    setInterval(() => this.decreaseStat('purity', 1), 30000); // 30 seconds for testing
    setInterval(() => this.decreaseStat('attention', 3), 40000); // 40 seconds for testing
  }

  decreaseStat(stat: string, decrement: number) {
    switch(stat) {
      case 'hunger':
        this.hungerValue = Math.max(this.hungerValue - decrement, 0);
        break;
      case 'fatigue':
        this.fatigueValue = Math.max(this.fatigueValue - decrement, 0);
        break;
      case 'purity':
        this.purityValue = Math.max(this.purityValue - decrement, 0);
        break;
      case 'attention':
        this.attentionValue = Math.max(this.attentionValue - decrement, 0);
        break;
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

  bath() {
    this.increaseStat('purity', 20);
    this.addPoint();
  }

  sleep() {
    this.increaseStat('fatigue', 30);
    this.addPoint();
  }

  care() {
    this.increaseStat('attention', 20);
    this.addPoint();
  }

  feed() {
    this.increaseStat('hunger', 15);
    this.addPoint();
  }

  // Method to increase the status by a fixed amount
  increaseStat(stat: string, increment: number) {
    switch(stat) {
      case 'hunger':
        this.hungerValue = Math.min(this.hungerValue + increment, 100);
        break;
      case 'fatigue':
        this.fatigueValue = Math.min(this.fatigueValue + increment, 100);
        break;
      case 'purity':
        this.purityValue = Math.min(this.purityValue + increment, 100);
        break;
      case 'attention':
        this.attentionValue = Math.min(this.attentionValue + increment, 100);
        break;
    }
  }

  // Method to add points for leveling
  addPoint() {
    this.points += 1;

    this.progressBarWidth = (this.points / this.pointsNeeded) * 100;

    if (this.points >= this.pointsNeeded) {
      this.levelUp();
    }
  }

  // Method to handle leveling up
  levelUp() {
    this.level += 1;        
    this.points = 0;      
    this.pointsNeeded = Math.ceil(this.pointsNeeded * 1.1); 
    this.progressBarWidth = 0;
  }
}

