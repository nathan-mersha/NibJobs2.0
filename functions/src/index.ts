import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export AI-powered scraping functions
export { scheduledTelegramScraping, runTelegramScrapingNow } from './telegramJobScraper';

// Export debug function
export { debugTelegramSetup } from './debugTelegram';

// Export category management function
export { populateJobCategories } from './populateCategories';

// Export channel management functions
export { 
  createTelegramChannel,
  updateTelegramChannel,
  deleteTelegramChannel,
  getTelegramChannels,
  testTelegramChannel,
  triggerChannelScraping
} from './channelManagement';


