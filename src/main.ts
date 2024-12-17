import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { PushNotifications } from '@capacitor/push-notifications';


import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient()
  ],
});

// Request permission to use push notifications
const registerPushNotifications = async () => {
  let permStatus = await PushNotifications.requestPermissions();

  if (permStatus.receive === 'granted') {
    console.log('Push Notification permission granted');
    await PushNotifications.register();
  } else {
    console.log('Push Notification permission denied');
  }
};

// Listen for notifications
PushNotifications.addListener('registration', token => {
  console.log('Push registration success:', token.value);
});

PushNotifications.addListener('pushNotificationReceived', notification => {
  console.log('Push notification received:', notification);
});

PushNotifications.addListener('pushNotificationActionPerformed', action => {
  console.log('Push notification action:', action);
});

// Call the function
registerPushNotifications();
