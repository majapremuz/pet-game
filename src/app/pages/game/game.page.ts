import { Component, ChangeDetectorRef, ViewChild, Injector, OnDestroy, NgZone} from '@angular/core';
import { IonicModule, IonModal, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { UserService, GameState } from 'src/app/services/user.service';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

export type StatName = 'hunger' | 'fatigue' | 'purity' | 'attention';
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
  statusInterval: any = null;
  decreaseInterval: any;
  pointsNeeded: number = 10; 
  maxPoints: number = 100; 
  currentColor: string = '#d3ba77';
  isJumping: boolean = false;
  isFeed: boolean = false;
  isWash: boolean = false;
  isSleep: boolean = false;
  isCare: boolean = false;
  audio: HTMLAudioElement;
  username: string = '';
  petName: string = '';
  petSmart: number = 0;
  petSpeed: number = 0;
  petStrength: number = 0;
  petImage: string = '';
  dogStats: any = {};
  showHeart: boolean = false;
  showFood: boolean = false;
  showBath: boolean = false;
  showSleep: boolean = false;
  showCare: boolean = false;
  nextFeedTime: Date | undefined;
  gameState: GameState;
  currentStatValue!: number; 
  currentStatColor!: string;
  isLevelUpModalVisible: boolean = false;
  isActionModalVisible: boolean = false;
  nextActionMessage: string | undefined;
  
  /*private _hungerValue: number = 0;
  private _fatigueValue: number = 0;
  private _purityValue: number = 0;
  private _attentionValue: number = 0;*/

  intervals: Record<StatName, any> = {
    hunger: null,
    fatigue: null,
    purity: null,
    attention: null
  };
  

   // New properties for intervals and next action times
   hungerNextAction: Date = new Date();
   fatigueNextAction: Date = new Date();
   purityNextAction: Date = new Date();
   attentionNextAction: Date = new Date();
   
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
    this.loadGameTimers();
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

  ionViewDidEnter() {
  this.processMissedDecrements();
}

  get hungerValue(): number {
    return this.gameState.hungerValue;
  }

  get attentionValue(): number {
    return this.gameState.attentionValue;
  }

  get fatigueValue(): number {
    return this.gameState.fatigueValue;
  }
  
  get purityValue(): number {
    return this.gameState.purityValue;
  }

    saveGame(): void {
      this.userService.saveGameState(this.gameState);
    }

  loadGameTimers() {
  const stored = localStorage.getItem('gameState');
  const nowMs = Date.now();

  // handy map of your intervals
  const intervalsMs: Record<StatName, number> = {
    hunger: 6  * 60 * 60 * 1000,  // 6h
    fatigue: 24 * 60 * 60 * 1000, // 24h
    purity: 18 * 60 * 60 * 1000,  // 18h
    attention: 8  * 60 * 60 * 1000, // 8h
  };

  if (stored) {
    const state = JSON.parse(stored);

    (['hunger','fatigue','purity','attention'] as StatName[]).forEach(stat => {
      // parse the saved date (or get null)
      let dt = state[`${stat}NextAction`]
        ? new Date(state[`${stat}NextAction`])
        : null;

      // if missing or in the past, reset to now+interval
      if (!dt || dt.getTime() <= nowMs) {
        dt = new Date(nowMs + intervalsMs[stat]);
        console.warn(`⏱ ${stat}NextAction was past or missing—reset to ${dt.toISOString()}`);
      }

      // assign both your component var and the gameState
      (this as any)[`${stat}NextAction`] = dt;
      this.gameState[`${stat}NextAction`] = dt;
    });

  } else {
    // no saved state at all? give everyone a fresh timer
    console.warn('⚠️ no gameState in storage; initializing all default timers');
    this.setInitialActionTimes();
  }

  // persist any fixes back to storage
  localStorage.setItem('gameState', JSON.stringify(this.gameState));

  console.log('✅ timers loaded (and fixed if needed):', {
    hunger: this.hungerNextAction.toISOString(),
    fatigue: this.fatigueNextAction.toISOString(),
    purity: this.purityNextAction.toISOString(),
    attention: this.attentionNextAction.toISOString(),
  });
}



processMissedDecrements() {
  const now = Date.now();
  console.log('processMissedDecrements - now:', new Date(now).toISOString());

  Object.entries(this.decrementIntervals).forEach(([stat, interval]) => {
    const last = this.userService.getLastDecrementTime(stat as StatName) || now;
    console.log(`Stat: ${stat}, lastDecrementTime: ${new Date(last).toISOString()}, interval(ms): ${interval}`);

    const elapsed = now - last;
    console.log(`Elapsed ms for ${stat}:`, elapsed);

    if (elapsed >= interval) {
  const missed = Math.floor(elapsed / interval);
  console.log(`Missed decrements for ${stat}:`, missed);

  this.decreaseStat(stat as StatName, missed);

  const newNextAction = new Date(now + interval);
  (this as any)[`${stat}NextAction`] = newNextAction;
  this.gameState[`${stat}NextAction`] = newNextAction;

  this.userService.setLastDecrementTime(stat as StatName, now);
}
  });
}


private getRandomIntervalHours(minHours: number, maxHours: number): number {
  return Math.floor(Math.random() * (maxHours - minHours + 1)) + minHours;
}

   setInitialActionTimes() {
  const now = new Date();

  this.hungerNextAction = new Date(now.getTime() + this.getRandomIntervalHours(6, 12) * 60 * 60 * 1000);
  this.fatigueNextAction = new Date(now.getTime() + 24 * 60 * 60 * 1000); // jednom dnevno
  this.purityNextAction = new Date(now.getTime() + 18 * 60 * 60 * 1000);  // jednom dnevno
  this.attentionNextAction = new Date(now.getTime() + this.getRandomIntervalHours(4, 12) * 60 * 60 * 1000);

  this.gameState.hungerNextAction = this.hungerNextAction;
  this.gameState.fatigueNextAction = this.fatigueNextAction;
  this.gameState.purityNextAction = this.purityNextAction;
  this.gameState.attentionNextAction = this.attentionNextAction;
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

/*lastDecrementTime: Record<StatName, number> = {
  hunger: Date.now(),
  fatigue: Date.now(),
  purity: Date.now(),
  attention: Date.now(),
};*/


    /*decrementIntervals: Record<StatName, number> = {
      hunger: 6 * 60 * 60 * 1000, // 6 hours
      fatigue: 24 * 60 * 60 * 1000, // 24 hours
      purity: 18 * 60 * 60 * 1000, // 18 hours
      attention: 8 * 60 * 60 * 1000, // 8 hours
    }*/

      // koliko traje cijeli ciklus
intervalsMs: Record<StatName, number> = {
  hunger: 6  * 60 * 60 * 1000,  // 6h
  fatigue: 24 * 60 * 60 * 1000, // 24h
  purity: 18 * 60 * 60 * 1000,  // 18h
  attention: 8  * 60 * 60 * 1000, // 8h
};

  // izračunaj koliko često treba padati 1%
  decrementIntervals: Record<StatName, number> = {
    hunger: this.intervalsMs.hunger / 10,
    fatigue: this.intervalsMs.fatigue / 10,
    purity: this.intervalsMs.purity / 10,
    attention: this.intervalsMs.attention / 10,
  };

startStatusDecreasing() {
  console.log('✅ startStatusDecreasing() called');
  if (this.statusInterval) clearInterval(this.statusInterval);

  this.statusInterval = setInterval(() => {
    const now = Date.now();

    (Object.keys(this.decrementIntervals) as StatName[]).forEach(statKey => {
      const decrementInterval = this.decrementIntervals[statKey]; 
      const fullActionInterval = this.getFullIntervalForStat(statKey);

      let last = this.userService.getLastDecrementTime(statKey); 

      if (!last) {
        last = now - decrementInterval;
        this.userService.setLastDecrementTime(statKey, last);
      }

      if (last > now) {
        last = now - decrementInterval;
        this.userService.setLastDecrementTime(statKey, last);
      }

      while (now - last >= decrementInterval) {
        console.log(`⏬ Decreasing ${statKey} (interval met)`);
        const decreaseAmount = ({ hunger: 3, fatigue: 5, purity: 2, attention: 4 } as Record<StatName, number>)[statKey];
        this.decreaseStat(statKey, decreaseAmount);

        last += decrementInterval;
        this.userService.setLastDecrementTime(statKey, last);
      }

      const nextActionMs = last + fullActionInterval;
      const nextAction = new Date(nextActionMs);
      this[`${statKey}NextAction`] = nextAction;
      this.gameState[`${statKey}NextAction`] = nextAction;
    });

    this.saveGame();
  }, 60 * 1000); // svake 1 minute
}


private getFullIntervalForStat(stat: StatName): number {
  switch(stat) {
    case 'hunger':

      return this.getRandomIntervalHours(6, 12) * 60 * 60 * 1000;
    case 'attention':
      return this.getRandomIntervalHours(4, 12) * 60 * 60 * 1000;
    case 'fatigue': return 24 * 60 * 60 * 1000;
    case 'purity': return 18 * 60 * 60 * 1000;
    default: return 6 * 60 * 60 * 1000;
  }
}

private updateNextActionTime(stat: StatName, adjust: number = 0) {
  const now = Date.now();
  let nextHours: number;

  switch (stat) {
    case 'hunger':
      nextHours = this.getRandomIntervalHours(6, 12);
      break;
    case 'fatigue':
      nextHours = 24;
      break;
    case 'purity':
      nextHours = 18;
      break;
    case 'attention':
      nextHours = this.getRandomIntervalHours(4, 12);
      break;
    default:
      nextHours = 6;
  }

  // Ako igrač prerano → produži interval
  // Ako igrač prekasno → skrati interval
  nextHours = Math.max(1, nextHours + adjust);

  let newActionTime = new Date(now + nextHours * 60 * 60 * 1000);

  this[`${stat}NextAction`] = newActionTime;
  this.gameState[`${stat}NextAction`] = newActionTime;

  // Reset early flag za novi ciklus
  const earlyKey = `${stat}EarlyGiven` as keyof GameState;
  this.gameState[earlyKey] = false;

  console.log(`✅ Next ${stat}:`, newActionTime);
  this.scheduleNotification(stat, newActionTime);
}

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
  

  /*handleAction(action: StatName) {
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

  const nextActionTime = new Date(this[`${action}NextAction`] ?? Date.now());
  const timeDifference = (now.getTime() - nextActionTime.getTime()) / (60 * 1000); // in minutes

  // Handle points and show alert, but only apply effect if within valid time
  let isActionAllowed = false;

  if (Math.abs(timeDifference) <= 10) {
    this.addPoint(1);
    isActionAllowed = true;
  } else if (timeDifference < -10) {
    this.addPoint(0.5);
    this.showAlert("Too Early!", this.getEarlyMessage(action));
  } else {
    this.addPoint(0);
    this.showAlert("Too Late!", this.getLateMessage(action));
  }

  if (timeDifference > 10) {
    this.updateNextActionTime(action, -1); // Late: shorten
  } else if (timeDifference < -10) {
    this.updateNextActionTime(action, 2); // Early: extend
  } else {
    this.updateNextActionTime(action); // On time
  }

  if (timeDifference > 720) { // More than 12 hours late
    console.log("Feeding missed. Severe penalty applied.");
    if (this.gameState[valueKey] != null) {
      this.gameState[valueKey] -= 20;
    }
  }

  // Only apply stat increase if on-time
  if (isActionAllowed) {
    this.ngZone.run(() => {
      this.increaseStat(action, incrementValue);
      this.updateStatColorsAndHeight(action);
      this.cdRef.detectChanges();
    });
  } else {
    console.log(`${action} action blocked due to invalid timing.`);
  }
}*/

handleAction(action: StatName): boolean {
  const now = new Date();
  const valueKey = `${action}Value` as keyof GameState;

  if (this.gameState[valueKey] === 100) {
    console.log(`${action} is already full.`);
    return false;
  }

  const nextActionTime = new Date(this[`${action}NextAction`] ?? Date.now());
  const timeDiffMs = now.getTime() - nextActionTime.getTime();
  const timeDiffMins = timeDiffMs / (60 * 1000);

  const EARLY_BOUND = -10;
  const LATE_BOUND = 10;
  const MISSED_BOUND = 720;

  const earlyKey = `${action}EarlyGiven` as keyof GameState;

  if (timeDiffMins > MISSED_BOUND) {
    this.gameState[valueKey] = Math.max((this.gameState[valueKey] || 0) - 20, 0);
    this.saveGame();
    this.showAlert("Missed!", `${action} was missed by over 12 hours.`);
    this.gameState[earlyKey] = false;
    return false;
  }

  if (timeDiffMins < EARLY_BOUND) {
    if (!this.gameState[earlyKey]) {
      this.addPoint(0.5);
      this.gameState[earlyKey] = true;
      this.showAlert("Too Early!", this.getEarlyMessage(action));
      this.saveGame();
    } else {
      this.showAlert("Too Early!", "You've already gained early points for this cycle.");
    }
    return false;
  }

  if (timeDiffMins > LATE_BOUND) {
    this.addPoint(0);
    this.showAlert("Too Late!", this.getLateMessage(action));
    this.updateNextActionTime(action, -1);
    return false;
  }

  this.gameState[earlyKey] = false;
  this.addPoint(1);
  this.updateNextActionTime(action);

  this.ngZone.run(() => {
    const increment = this.getIncrementForAction(action);
    this.increaseStat(action, increment);
    this.updateStatColorsAndHeight(action);
    this.cdRef.detectChanges();
  });
  this.saveGame();

  return true;
}


private getIncrementForAction(action: StatName): number {
  switch (action) {
    case 'hunger': return 20;
    case 'fatigue': return 25;
    case 'purity': return 30;
    case 'attention': return 35;
    default: return 0;
  }
}

getEarlyMessage(action: StatName): string {
  const messages: Record<StatName, string> = {
    hunger: "You fed the dog too early. Only 0.5 points awarded!",
    fatigue: "You tried to put the dog to sleep too early. Only 0.5 points awarded!",
    purity: "You tried to clean the dog too early. Only 0.5 points awarded!",
    attention: "You tried to play with the dog too early. Only 0.5 points awarded!",
  };
  return messages[action];
}

getLateMessage(action: StatName): string {
  const messages: Record<StatName, string> = {
    hunger: "You fed the dog too late. No points awarded.",
    fatigue: "You let the dog stay up too late. No points awarded.",
    purity: "You cleaned the dog too late. No points awarded.",
    attention: "You gave attention too late. No points awarded.",
  };
  return messages[action];
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
    this.cdRef.detectChanges();
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
  console.log(`Decreasing ${stat} by ${decrement}. Current value:`, this.gameState[valueKey]);
  if (this.gameState[valueKey] !== undefined) {
    // Decrease the stat
    this.gameState[valueKey] = Math.max((this.gameState[valueKey] as number) - decrement, 0);

    // If hunger or fatigue reaches 0, give the player a chance to solve it
    if ((stat === 'hunger' || stat === 'fatigue') && this.gameState[valueKey] === 0) {
      if (!this.alertShown[stat]) {
        this.showLowStatAlert(stat);
        this.alertShown[stat] = true;
        this.offerChanceToFixStat(stat);
      }
      this.userService.saveGameState(this.gameState);
    }

    // If purity or attention reaches 0, give the player a chance to solve it
    if ((stat === 'purity' || stat === 'attention') && this.gameState[valueKey] === 0) {
      if (!this.alertShown[stat]) {
        this.showLowStatAlert(stat);
        this.alertShown[stat] = true;
        this.offerChanceToFixStat(stat);
      }
    }

    // If purity or attention are at 0, accelerate hunger and fatigue depletion
    if (this.gameState.purityValue === 0 || this.gameState.attentionValue === 0) {
      this.accelerateHungerFatigueDepletion();
    }

    this.updateStatColorsAndHeight(stat);
    this.userService.updateGameState(this.gameState);
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
  this.startStatusDecreasing(); 
}

losePet() {
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
  const colorKey = `${stat}Color` as keyof GameState;

  this.ngZone.run(() => {
    this.currentStatValue = this.gameState[valueKey];
    this.currentStatColor = this.gameState[colorKey];

    console.log('Updated currentStatValue:', this.currentStatValue);
    console.log('Updated currentStatColor:', this.currentStatColor);

    this.cdRef.detectChanges();
  });
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
    const allowed = this.handleAction('purity');
    if (!allowed) return;

    this.updateCurrentStat('purity');
    this.openActionModal('purity');
    this.washDog();
    this.cdRef.detectChanges();
  }

  sleep() {
    const allowed = this.handleAction('fatigue');
    if (!allowed) return;

    this.updateCurrentStat('fatigue');
    this.openActionModal('fatigue');
    this.sleepDog();
    this.cdRef.detectChanges();
  }

  care() {
    const allowed = this.handleAction('attention');
    if (!allowed) return;

    this.updateCurrentStat('attention');
    this.openActionModal('attention');
    this.petDog();
    this.cdRef.detectChanges();
  }

  feed() {
    const allowed = this.handleAction('hunger');
    if (!allowed) return;
    
    this.updateCurrentStat('hunger');
    this.feedDog();
    this.openActionModal('hunger');
    this.cdRef.detectChanges();
    console.log('Updated hungerValue:', this.gameState.hungerValue);
  }

  /*setNextFeedTime() {
    const now = new Date();
    const randomHours = Math.floor(Math.random() * 6) + 6; // 6 do 12 sati
    this.nextFeedTime = new Date(now.getTime() + randomHours * 60 * 60 * 1000);
  }*/

  checkLevelUp() {
    if (this.gameState.points >= this.pointsNeeded) {
      this.gameState.level += 1;
      this.gameState.points = 0;
      this.pointsNeeded = Math.floor(this.pointsNeeded * 1.1);
      console.log('Navigating with levelUp:', this.gameState.level);
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

  let rawTime = this[`${action}NextAction`];
  console.log(`Opening action modal for ${action}. Raw time:`, rawTime);
  let nextActionTime: Date;


  if (typeof rawTime === 'string') {
    nextActionTime = new Date(rawTime);

  } else if (rawTime instanceof Date) {
    nextActionTime = rawTime;
  } else {
    nextActionTime = new Date(now.getTime() + this.decrementIntervals[action]);
  }

  if (isNaN(nextActionTime.getTime())) {
    nextActionTime = new Date(now.getTime() + this.decrementIntervals[action]);
  }

  console.log('now:', now.toISOString());
  console.log('nextActionTime:', nextActionTime.toISOString());


  const diffInMs = nextActionTime.getTime() - now.getTime();

  console.log('diffInMs:', diffInMs);

  const THRESHOLD_MS = 60000; // 1 minute threshold

  if (diffInMs > THRESHOLD_MS) {
    this.nextActionMessage = this.getActionMessage(action, this.calculateTimeDifference(nextActionTime, now));
    this.isActionModalVisible = true;
  } else if (diffInMs >= -THRESHOLD_MS) {
    // within 1 min early or late, treat as now
    console.log("Action time is now, performing action immediately.");
    this.handleAction(action);
    this.isActionModalVisible = false;
  } else {
    // action time in the past beyond threshold, maybe late - handle accordingly
    console.log("Action time is past due, performing action immediately with late penalty.");
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
  let days = Math.floor(totalMinutes / (60 * 24));
  let hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  let minutes = totalMinutes % 60;

  const parts = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);

  return parts.join(' and ');
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

  feedDog() {
    this.showFood = true;
    this.isFeed = false;

    setTimeout(() => {
    this.isFeed = true;

    setTimeout(() => {
      this.isFeed = false;
      this.showFood = false;  
    }, 2000);
  });
  }

  washDog() {
  this.showBath = true;
  this.isWash = false;

  setTimeout(() => {
    this.isWash = true;

    setTimeout(() => {
      this.isWash = false;
      this.showBath = false;  
    }, 2000);
  });
}

  sleepDog() {
    this.showSleep = true;
    this.isSleep = false;

    setTimeout(() => {
    this.isSleep = true;

    setTimeout(() => {
      this.isSleep = false;
      this.showSleep = false;  
    }, 1000);
  });
  }

  petDog() {
    this.showCare = true;
    this.isCare = false;

    setTimeout(() => {
    this.isCare = true;

    setTimeout(() => {
      this.isCare = false;
      this.showCare = false;  
    }, 1000);
  });
  }


  profile() {
    this.router.navigate(['/profile']);
  };

}
