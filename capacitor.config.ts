import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dog.game',
  appName: 'Fetch the bone',
  webDir: 'www',
  bundledWebRuntime: false,

  plugins: {
    LocalNotifications: {
      iconColor: "#488AFF"
    },
  },

};


export default config;
