import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zita.fetchthebone',
  appName: 'Fetch the bone',
  webDir: 'www',

  plugins: {
    LocalNotifications: {
      iconColor: "#488AFF"
    },
  },

};


export default config;
