// Asset exports for easy importing throughout the app
// Usage: import { BeeIcon, NibJobsIcon } from '../assets';

// App Icons & Logos - Use the actual nibjobs-icon.png
export const AppIcon = require('../../assets/nibjobs-icon.png');     // Use actual NibJobs icon
export const NibJobsIcon = require('../../assets/nibjobs-icon.png'); // Main brand icon
export const BeeIcon = require('../../assets/nibjobs-icon.png');     // Bee icon reference
export const Favicon = require('../../assets/favicon.png');          // Web favicon
export const SplashImage = require('../../assets/splash.png');       // Splash screen

// Legacy references (fallbacks)
export const MainIcon = require('../../assets/icon.png');            // Legacy main icon
export const AdaptiveIcon = require('../../assets/adaptive-icon.png'); // Android adaptive

// Default export for convenience
export default {
  AppIcon,
  NibJobsIcon,
  BeeIcon,
  Favicon,
  SplashImage,
  MainIcon,
  AdaptiveIcon,
};