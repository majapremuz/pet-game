import { Component, ChangeDetectorRef, ViewChild, Injector, OnDestroy, NgZone} from '@angular/core';
import { IonicModule, IonModal, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { UserService, GameState } from 'src/app/services/user.service';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { state } from '@angular/animations';

type StatName = 'hunger' | 'fatigue' | 'purity' | 'attention';
type StatColorName = 'hungerColor' | 'fatigueColor' | 'purityColor' | 'attentionColor';

@Component({
    selector: 'app-game',
    templateUrl: 'game.page.html',
    styleUrls: ['game.page.scss'],
    imports: [IonicModule, CommonModule, FormsModule]
})
export class GamePage implements OnDestroy{
  @ViewChild('levelUpModal', { static: false }) levelUpModal!: IonModal;
  @ViewChild('actionModal', { static: false }) actionModal!: IonModal; 

  value: number = 100;
  level: number = 0;
  decreaseInterval: any;
  pointsNeeded: number = 10; 
  maxPoints: number = 100; 
  currentColor: string = '#d3ba77';
  isJumping: boolean = false;
  audio: HTMLAudioElement;
  username: string = '';
  petName: string = '';
  petSmart: number = 0;
  petSpeed: number = 0;
  petStrength: number = 0;
  petImage: string = '';
  dogStats: any = {};
  showHeart: boolean = false;
  nextFeedTime: Date | undefined;
  gameState: GameState;
  currentStatValue!: number; 
  currentStatColor!: string;
  isLevelUpModalVisible: boolean = false;
  isActionModalVisible: boolean = false;
  nextActionMessage: string | undefined; 

  intervals: Record<StatName, any> = {
    hunger: null,
    fatigue: null,
    purity: null,
    attention: null
  };
  

   // New properties for intervals and next action times
   hungerNextAction: Date | undefined;
   fatigueNextAction: Date | undefined;
   purityNextAction: Date | undefined;
   attentionNextAction: Date | undefined;
   
  constructor(
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private injector: Injector,
    private ngZone: NgZone,
    private alertController: AlertController
  ) {
    const navigation = this.router.getCurrentNavigation();
  if (navigation?.extras.state) {
    this.petImage = navigation.extras.state['selectedDogImage'];
    this.petName = navigation.extras.state['petName'];
  }
  this.audio = new Audio('assets/bark.wav');
  this.gameState = this.userService.getGameState();
  }

  private get userService(): UserService {
    return this.injector.get(UserService);
  }

  ngOnInit() {
    this.userService.initializeGameState();
    this.gameState = this.userService.getGameState();
    //console.log("Game State: ", this.gameState);
    this.currentStatValue = this.gameState.hungerValue;
    this.currentStatColor = this.getStatusColor(this.gameState.hungerValue);
  
    // Request notification permission
    this.requestNotificationPermission();
  
    // Retrieve pet stats from localStorage
    const storedPetData = localStorage.getItem('selectedDog');
    //console.log("", localStorage.getItem('selectedDog'));
    if (storedPetData) {
      const selectedDog = JSON.parse(storedPetData);
      this.petImage = selectedDog.image;
      this.petName = selectedDog.name;
      this.petSmart = selectedDog.smart;
      this.petSpeed = selectedDog.speed;
      this.petStrength = selectedDog.strength;
      //console.log('Loaded pet stats from localStorage:', selectedDog);
    } else {
      console.warn('No pet data found. Redirecting to pet selection page.');
      this.router.navigate(['/home']);
    }
  
     // Check if the user leveled up (persist state using a service or local variable)
  if (this.userService.getLevelUpState()) {
    this.openLevelUpModal();
    this.userService.resetLevelUpState();
  }
  
    //console.log("LEVEL UP: ", this.level)
    // Initialize action times and start updates
    this.setInitialActionTimes();
    this.updateColorGradually();
    this.startStatusDecreasing();
    this.level = this.userService.getGameState().level;
  }

  ngOnDestroy() {
    Object.entries(this.intervals).forEach(([stat, intervalId]) => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    });
  }



  get hungerValue(): number {
    return this.userService.gethungerValue();
  }

  get attentionValue(): number {
    return this.userService.getattentionValue();
  }

  get fatigueValue(): number {
    return this.userService.getfatigueValue();
  }     

  get purityValue(): number {   
    return this.userService.getpurityValue();
  }
    saveGame(): void {
      this.userService.saveGameState(this.gameState);
    }
  

   setInitialActionTimes() {
    const now = new Date();
    this.hungerNextAction = new Date(now.getTime() + this.getRandomInterval(6, 12)); // 6-12 hours
    this.fatigueNextAction = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    this.purityNextAction = new Date(now.getTime() + 18 * 60 * 60 * 1000); // 18 hours
    this.attentionNextAction = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8 hours
  }

    /*setInitialActionTimes() {
      const now = new Date();
      this.gameState.hungerNextAction = new Date(now.getTime() + this.getRandomInterval(1, 2)); // 1-2 minutes
      this.gameState.fatigueNextAction = new Date(now.getTime() + 3 * 60 * 1000); // 3 minutes
      this.gameState.purityNextAction = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes
      this.gameState.attentionNextAction = new Date(now.getTime() + 1 * 60 * 1000); // 1 minute
    }*/

  // Returns a random interval within the given hour range
  getRandomInterval(minHours: number, maxHours: number): number {
    const randomHours = Math.floor(Math.random() * (maxHours - minHours + 1) + minHours);
    return randomHours * 60 * 60 * 1000;
  }

/*getRandomInterval(minMinutes: number, maxMinutes: number): number {
  const randomMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1) + minMinutes);
  return randomMinutes * 60 * 1000; // Convert minutes to milliseconds
}*/

    decrementIntervals: Record<StatName, number> = {
      hunger: 6 * 60 * 60 * 1000, // 6 hours
      fatigue: 24 * 60 * 60 * 1000, // 24 hours
      purity: 18 * 60 * 60 * 1000, // 18 hours
      attention: 8 * 60 * 60 * 1000, // 8 hours
    }

    /*decrementIntervals: Record<StatName, number> = {
      hunger: 2000, // 1 minute
      fatigue: 5000, // 2 minutes
      purity: 6000, // 3 minutes
      attention: 4000, // 4 minutes
    };*/


        startStatusDecreasing() {
          Object.entries(this.decrementIntervals).forEach(([stat, interval]) => {
            // If there's already an interval running for this stat, clear it
            if (this.intervals[stat as StatName]) {
              clearInterval(this.intervals[stat as StatName]);
            }
        
            // Set the new interval and store its ID
            this.intervals[stat as StatName] = setInterval(() => {
              this.decreaseStat(stat as StatName, 1); 
            }, interval);
          });
        }

  // Update the next action time based on the stat
  private updateNextActionTime(stat: StatName, adjustByHours: number = 0) {
    const baseInterval = this.getRandomInterval(6, 12) * 60 * 60 * 1000; // Convert to ms
    const adjustedInterval = baseInterval + adjustByHours * 60 * 60 * 1000;
    const now = Date.now();
    
    let newActionTime = new Date(now + adjustedInterval);

    console.log("updateNextActionTime", newActionTime);

    switch(stat) {
      case 'hunger':
        newActionTime = new Date(now + 24 * 60 * 60 * 1000);
        break;
      case 'fatigue':
        newActionTime = new Date(now + 24 * 60 * 60 * 1000);
        break;
      case 'purity':
        newActionTime = new Date(now + 18 * 60 * 60 * 1000);
        break;
      case 'attention':
        newActionTime = new Date(now + 8 * 60 * 60 * 1000);
        break;
    }

    this[`${stat}NextAction`] = newActionTime;
    this.gameState[`${stat}NextAction`] = newActionTime;

    console.log(`Updated ${stat} next action time:`, newActionTime);
}

/*private updateNextActionTime(stat: StatName, adjustBySeconds: number = 0) {
  const baseInterval = this.getRandomInterval(10, 20); // 10-20 seconds
  const adjustedInterval = baseInterval + adjustBySeconds * 1000; // Convert to ms
  const now = Date.now();
  
  let newActionTime = new Date(now + adjustedInterval);

  //console.log("updateNextActionTime", newActionTime);

  switch(stat) {
    case 'hunger':
      newActionTime = new Date(now + 10 * 1000); // 10 seconds
      break;
    case 'fatigue':
      newActionTime = new Date(now + 20 * 1000); // 20 seconds
      break;
    case 'purity':
      newActionTime = new Date(now + 30 * 1000); // 30 seconds
      break;
    case 'attention':
      newActionTime = new Date(now + 40 * 1000); // 40 seconds
      break;
  }

  this[`${stat}NextAction`] = newActionTime;
  this.gameState[`${stat}NextAction`] = newActionTime;

  //console.log(`Updated ${stat} next action time:`, newActionTime);
}
*/

  async requestNotificationPermission() {
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive === 'granted') {
      console.log('Notification permission granted');
      // Initialize FCM and get the token if needed
    } else {
      console.log('Notification permission denied');
    }
  }

  async scheduleNotification(action: StatName, nextActionTime: Date) {
    const userSleepTimeString = this.userService.getSleepTime();
    const userSleepTime = userSleepTimeString ? new Date(userSleepTimeString) : null;
    const titles: Record<StatName, string> = {
      hunger: 'Time to Feed!',
      fatigue: 'Time to Rest!',
      purity: 'Time for a Bath!',
      attention: 'Time for Attention!',
    };
  
    const bodies: Record<StatName, string> = {
      hunger: `Your pet is getting hungry. Make sure to feed ${this.petName}!`,
      fatigue: `Your pet is getting tired. It's time for some rest!`,
      purity: `Your pet needs a bath to stay clean!`,
      attention: `Your pet is feeling lonely. Give it some attention!`,
    };

    if (userSleepTime && nextActionTime > userSleepTime) {
      console.log('Skipping notification as it is after sleep time.');
      return;
    }
  
    await LocalNotifications.schedule({
      notifications: [
        {
          id: this.getNotificationId(action),
          title: titles[action],
          body: bodies[action],
          schedule: { at: nextActionTime },
          actionTypeId: '',
          extra: { action },
        },
      ],
    }).then(() => {
      console.log('Notification scheduled:', action, nextActionTime);
    }).catch((err) => {
      console.error('Error scheduling notification:', err);
    });
  }

  getNotificationId(action: StatName): number {
    const ids: Record<StatName, number> = {
      hunger: 1,
      fatigue: 2,
      purity: 3,
      attention: 4,
    };
    return ids[action];
  }
  

  handleAction(action: StatName) {
    const now = new Date();
    let incrementValue: number = 0;
  
    switch (action) {
      case 'hunger':
        incrementValue = 20;
        break;
      case 'fatigue':
        incrementValue = 25;
        break;
      case 'purity':
        incrementValue = 30;
        break;
      case 'attention':
        incrementValue = 35;
        break;
    }

    const valueKey = `${action}Value` as keyof GameState;

    if (this.gameState[valueKey] === 100) {
        console.log(`${action} is already full. No points awarded.`);
        return;
    }

    // Ensure the next action time is properly updated
    this.updateNextActionTime(action);
    const nextActionTime = new Date(this[`${action}NextAction`] ?? Date.now());


    const timeDifference = Math.abs(now.getTime() - nextActionTime.getTime()) / (60 * 1000); // time diff in minutes

    if (timeDifference <= 10) {
        this.addPoint(1);
    } else if (now < nextActionTime) {
        this.addPoint(0.5);
        this.showAlert("Early Action!", "You acted early and earned 0.5 points!");
    } else {
        this.addPoint(0);
        this.showAlert("Late Action!", "You acted late. No points awarded.");
    }

    if (timeDifference > 10) {
        this.updateNextActionTime(action, -1); // Shorten by 1 hour if late
    } else if (timeDifference < -10) {
        this.updateNextActionTime(action, 2); // Extend by 2 hours if too early
    }

    if (now.getTime() - nextActionTime.getTime() > 12 * 60 * 60 * 1000) {
        console.log("Feeding missed. Severe penalty applied.");
        if (this.gameState[valueKey] != null) {
            this.gameState[valueKey] -= 20;
        }
    }

    this.ngZone.run(() => {
        this.increaseStat(action, incrementValue);
        this.updateStatColorsAndHeight(action);
    });
}

  
  async showAlert(title: string, message: string) {
    const alert = await this.alertController.create({
        header: title,
        message: message,
        buttons: ['OK']
    });

    await alert.present();
}

async showLowStatAlert(stat: StatName) {
  const alert = await this.alertController.create({
    message: `Your pet's ${stat} is dangerously low!`,
    buttons: ['OK']
  });

  await alert.present();
}



increaseStat(stat: StatName, increment: number) {
  const valueKey = `${stat}Value` as keyof GameState;
  
  this.ngZone.run(() => {
    this.gameState[valueKey] = Math.min(this.gameState[valueKey] + increment, 100);
    this.saveGame();
    this.checkLevelUp();
    this.cdRef.detectChanges(); // Ensure UI reflects changes
  });
}



alertShown: Record<StatName, boolean> = {
  hunger: false,
  fatigue: false,
  purity: false,
  attention: false
};


decreaseStat(stat: StatName, decrement: number) {
  const valueKey = `${stat}Value` as keyof GameState;
  if (this.gameState[valueKey] !== undefined) {
    // Decrease the stat
    this.gameState[valueKey] = Math.max((this.gameState[valueKey] as number) - decrement, 0);

    // If hunger or fatigue reaches 0, give the player a chance to solve it
    if ((stat === 'hunger' || stat === 'fatigue') && this.gameState[valueKey] === 0) {
      if (!this.alertShown[stat]) {
        this.showLowStatAlert(stat); // Show the alert only if it hasn't been shown already
        this.alertShown[stat] = true; // Mark as shown
        // Provide a chance to solve it
        this.offerChanceToFixStat(stat);
      }
    }
    
    // If purity or attention reaches 0, give the player a chance to solve it
    if ((stat === 'purity' || stat === 'attention') && this.gameState[valueKey] === 0) {
      if (!this.alertShown[stat]) {
        this.showLowStatAlert(stat); // Show the alert only if it hasn't been shown already
        this.alertShown[stat] = true; // Mark as shown
        // Provide a chance to solve it
        this.offerChanceToFixStat(stat);
      }
    }

    // If purity or attention are at 0, accelerate hunger and fatigue depletion
    if (this.gameState.purityValue === 0 || this.gameState.attentionValue === 0) {
      this.accelerateHungerFatigueDepletion();
    }

    this.updateStatColorsAndHeight(stat);
    this.userService.updateGameState(this.gameState);

    // Trigger immediate UI update
    this.cdRef.detectChanges();
  }
}


// Provide a chance for the player to solve the issue (e.g., feed the pet)
async offerChanceToFixStat(stat: StatName) {
  const alert = await this.alertController.create({
    message: `Your pet's ${stat} is critically low! Do you want to take action?`,
    buttons: [
      {
        text: 'Yes',
        handler: () => {
          // Call a function to allow the player to fix the issue
          this.handleAction(stat);
        }
      },
      {
        text: 'No',
        handler: () => {
          // Handle failure to act (e.g., lose the pet if no action is taken)
          if (stat === 'hunger' || stat === 'fatigue') {
            this.losePet();
          }
        }
      }
    ]
  });
  await alert.present();
}

// Accelerate hunger and fatigue depletion if purity or attention is at 0
accelerateHungerFatigueDepletion() {
  // Speed up the depletion intervals for hunger and fatigue
  this.decrementIntervals.hunger = 500; // 0.5 seconds
  this.decrementIntervals.fatigue = 1000; // 1 second
  this.startStatusDecreasing(); // Restart the status decreasing with faster intervals
}

losePet() {
  console.log("The pet has been lost!");
  this.router.navigate(['/game-over']);
}


updateStatColorsAndHeight(stat: StatName) {
  const valueKey = `${stat}Value` as keyof GameState;
  const value = this.gameState[valueKey];
  const colorKey = `${stat}Color` as StatColorName;
  const newColor = this.getStatusColor(value);

  if (this.gameState[colorKey] !== newColor || this.gameState[valueKey] !== value) {
    this.gameState[colorKey] = newColor;
    this.ngZone.run(() => {
      this.cdRef.detectChanges();
    });
  }
}

updateCurrentStat(stat: StatName) {
  const valueKey = `${stat}Value` as keyof GameState;
  const colorKey = `${stat}Color` as StatColorName;
  //console.log("gameState before update", this.gameState);
  this.currentStatValue = this.gameState[valueKey];
  //console.log("VALUE", this.currentStatValue);
  this.currentStatColor = this.gameState[colorKey];
  //console.log("COLOR", this.currentStatColor);
}

/*checkAlert(stat: StatName) {
  const valueKey = `${stat}Value` as keyof StatProperties;
  if (this[valueKey] < 10) {
    // Alert the user with a push notification
    PushNotifications.requestPermissions().then((permission) => {
      if (permission.receive === 'granted') {
        PushNotifications.createChannel({
          id: 'pet-care',
          name: 'Pet Care Notifications',
          description: 'Notifications for your pet\'s health',
          importance: 5,
        });

        // Schedule the notification after a slight delay (e.g., 5 seconds)
        const delayInMilliseconds = 5000; // Delay of 5 seconds

        (PushNotifications as any).schedule({
          notifications: [
            {
              title: `Your pet's ${stat} is low!`,
              body: `Please take care of your pet's ${stat} by feeding, playing, or resting it.`,
              id: new Date().getTime(),
              schedule: { at: new Date(Date.now() + delayInMilliseconds) }, // Schedule with delay
              sound: 'default',
              channelId: 'pet-care',
            }
          ]
        });
      }
    });

    // Optionally alert the user immediately
    alert(`Your pet's ${stat} is critically low!`);
  }
}*/


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
  const valueKey = `${stat}Value` as keyof GameState;
  const statElement = document.getElementById(`${stat}-container`);
  if (statElement) {
    const statValue = this.gameState[valueKey] as number;
    statElement.style.height = this.getContainerHeight(statValue);
  }
}


  getContainerHeight(value: number): string {
    return `${value}%`; 
}

    updateColorGradually(stat?: keyof GameState) {
      if (stat) {
        const valueKey = `${stat}Value` as keyof GameState;
        const colorKey = `${stat}Color` as keyof GameState;
    
        const currentValue = this.gameState[valueKey];
    
        // Ensure currentValue is a number before passing it to getStatusColor
        const newColor = this.getStatusColor(typeof currentValue === 'number' ? currentValue : 0);
    
        this.gameState[colorKey] = newColor;
    
        console.log(`Updated color for ${stat}: ${newColor}`);
      } else {
        this.gameState.hungerColor = this.getStatusColor(this.gameState.hungerValue);
        this.gameState.fatigueColor = this.getStatusColor(this.gameState.fatigueValue);
        this.gameState.purityColor = this.getStatusColor(this.gameState.purityValue);
        this.gameState.attentionColor = this.getStatusColor(this.gameState.attentionValue);
    
        console.log('Updated all colors');
      }
    }
    
    syncCurrentStat(stat: StatName) {
      const valueKey = `${stat}Value` as keyof GameState;
      this.currentStatValue = this.userService.getStatValue(valueKey);
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

savePetStats() {
  const user = JSON.parse(localStorage.getItem('authUser') || '{}');
  
  if (user) {
    // Update the pet stats in the localStorage
    user.petStats = {
      name: this.petName,
      smart: this.petSmart,
      speed: this.petSpeed,
      strength: this.petStrength,
    };

    // Save the updated user object back to localStorage
    localStorage.setItem('authUser', JSON.stringify(user));

    console.log('Pet stats updated successfully:', user.petStats);
  } else {
    console.error('No user data found in local storage to update pet stats.');
  }
}

  
  bath() {
    this.handleAction('purity');
    this.updateCurrentStat('purity');
    this.openActionModal('purity');
  }

  sleep() {
    this.handleAction('fatigue');
    this.updateCurrentStat('fatigue');
    this.openActionModal('fatigue');
  }

  care() {
    this.handleAction('attention');
    this.updateCurrentStat('attention');
    this.openActionModal('attention');
  }

  feed() {
    this.handleAction('hunger');
    this.updateCurrentStat('hunger');
    this.openActionModal('hunger');
  }

  setNextFeedTime() {
    const now = new Date();
    const randomHours = Math.floor(Math.random() * 6) + 6; // 6 do 12 sati
    this.nextFeedTime = new Date(now.getTime() + randomHours * 60 * 60 * 1000);
  }

  checkLevelUp() {
    if (this.gameState.points >= this.pointsNeeded) {
      this.gameState.level += 1;
      this.gameState.points = 0;
      this.pointsNeeded = Math.floor(this.pointsNeeded * 1.1);
      console.log('Navigating with levelUp:', this.gameState.level);
      // Set level-up state and open the modal
      this.userService.setLevelUpState(true);
      console.log('Opening level-up modal');
      this.openLevelUpModal();
    }
    if (this.gameState.level >= 50) {
      this.showMaxLevelAlert();
    }
  }
  

  // Adds points based on user timing
  addPoint(points: number) {
    this.gameState.points += points;
    console.log("Points added: ", points);
    this.checkLevelUp();
    this.gameState.progressBarWidth = (this.gameState.points / this.pointsNeeded)  * 100;
    console.log("Points: ", this.gameState.points, this.pointsNeeded, this.gameState.progressBarWidth);
    if (this.gameState.points >= this.pointsNeeded) {
      this.levelUp();
    }
  }

  // Method to handle leveling up
  levelUp() {
    if (this.gameState.level < 50) { 
      this.gameState.level += 1;        
      this.gameState.points = 0;
      this.pointsNeeded = Math.ceil(this.pointsNeeded * 1.1); 
      this.openLevelUpModal();
    } else {
      this.gameState.points = this.pointsNeeded;
      this.gameState.progressBarWidth = 100;
      console.log("Maximum level reached.");
    }
  }

  upgradeStat(stat: string) {
    switch (stat) {
      case 'smart':
        this.petSmart = (this.petSmart || 0) + 1;
        break;
      case 'speed':
        this.petSpeed = (this.petSpeed || 0) + 1;
        break;
      case 'strength':
        this.petStrength = (this.petStrength || 0) + 1;
        break;
      default:
        console.warn('Stat not found:', stat);
        return;
    }
  
    this.userService.updatePetStats({
      name: this.petName,
      image: this.petImage,
      smart: this.petSmart,
      speed: this.petSpeed,
      strength: this.petStrength,
    });
    console.log(`${stat} upgraded successfully.`);

  this.closeLevelUpModal();
}

  async showMaxLevelAlert() {
    const alert = await this.alertController.create({
      message: 'Your dog has reached its full potential and can no longer level up.',
      buttons: ['OK']
    });
    await alert.present();
  }

  openActionModal(action: StatName) {
    const now = new Date();
    let nextActionTime: Date | undefined = new Date(this[`${action}NextAction`] ?? Date.now());
    console.log(`Retrieved ${action} next action time:`, nextActionTime);

    console.log(`Modal - Retrieved ${action} next action time:`, nextActionTime);

    // If invalid, use fallback
    if (isNaN(nextActionTime.getTime())) {
        nextActionTime = new Date(now.getTime() + this.decrementIntervals[action]);
    }

    // Calculate time difference
    const diffInMs = nextActionTime.getTime() - now.getTime();

    console.log("minutes", diffInMs);
    const timeDiff = this.calculateTimeDifference(nextActionTime, now);
    
    console.log("Modal - Time difference:", timeDiff);

    if (diffInMs > 60000) {
      this.nextActionMessage = this.getActionMessage(action, timeDiff);
      this.isActionModalVisible = true;
  } else {
      console.log("Action time is now, performing action immediately.");
      this.handleAction(action);
      this.isActionModalVisible = false;
  }
}


  getActionMessage(action: StatName, timeDiff: string): string {
    const messages = {
      hunger: `${this.petName} isn't hungry now. You can feed it in ${timeDiff}`,
      fatigue: `${this.petName} isn't tired now. You can put it to sleep in ${timeDiff}`,
      purity: `${this.petName} isn't dirty now. You can clean it in ${timeDiff}`,
      attention: `${this.petName} doesn't require your attention now. You can take care of it in ${timeDiff}`,
    };

    return messages[action] || 'Unknown action';
  }


  calculateTimeDifference(nextActionTime: Date, now: Date): string {
    let diffInMs = Math.max(0, nextActionTime.getTime() - now.getTime());
    if (diffInMs === 0) return "now";
    let totalMinutes = Math.floor(diffInMs / (1000 * 60)); 
    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;

    return `${hours} hours and ${minutes} minutes`;
}


  openLevelUpModal() {
    this.isLevelUpModalVisible = true;
    this.levelUpModal.present();
    console.log("Level Up Modal opened");
}

closeLevelUpModal() {
    this.isLevelUpModalVisible = false;
    this.levelUpModal.dismiss();
}

closeActionModal() {
  this.isActionModalVisible = false;
  this.actionModal.dismiss();
}

  onLevelUpModalDismiss() {
    this.isLevelUpModalVisible = false;
  }

  onActionModalDismiss() {
    this.isActionModalVisible = false;
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
  };

}
