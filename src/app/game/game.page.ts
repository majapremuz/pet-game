import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';

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
    this.startStatusDecreasing();
    this.updateColorGradually();
  }

  startStatusDecreasing() {
    setInterval(() => this.decreaseStat('hunger', 10), 6 * 60 * 60 * 1000); // svaki 6 sati
    setInterval(() => this.decreaseStat('fatigue', 15), 24 * 60 * 60 * 1000); // svaka 24 sata
    setInterval(() => this.decreaseStat('purity', 20), 18 * 60 * 60 * 1000); // svaki 18 sati
    setInterval(() => this.decreaseStat('attention', 5), 8 * 60 * 60 * 1000); // svaki 8 sati
  }

  decreaseStat(stat: string, decrement: number) {
    switch (stat) {
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
    this.cdRef.detectChanges();
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

  updateColorGradually() {
    setInterval(() => {
      const currentHour = new Date().getHours();
      // Map the hour (0-23) to a color value (from morning to night)
      const colorValue = 255 - Math.floor((currentHour / 23) * 255); // Adjust as needed
      this.currentColor = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
      this.cdRef.detectChanges();
    }, 3600000); // Update every hour
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
    this.increaseStat('attention', 25);
    this.addPoint();
  }

  feed() {
    this.increaseStat('hunger', 20);
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

