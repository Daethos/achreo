import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.vercel.achreo',
  appName: 'the-ascean',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
