import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'angular-test',
  webDir: 'dist/angular-test/browser/',
  server: {
    allowNavigation: [
      'http://192.168.1.192:8000',
      'http://localhost:8000'
    ],
    androidScheme: 'http',
    cleartext: true
  }
};

export default config;
