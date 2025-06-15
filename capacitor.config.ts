
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.190d3516d6ba4e5c8b64dfe814588b81',
  appName: 'Daily Focus',
  webDir: 'dist',
  server: {
    url: 'https://190d3516-d6ba-4e5c-8b64-dfe814588b81.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;
