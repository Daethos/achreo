import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ascean.app',
  appName: 'ascean',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
