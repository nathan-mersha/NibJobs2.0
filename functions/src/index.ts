import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export AI-powered scraping functions (1st and 2nd gen)
export { scheduledTelegramScraping, runTelegramScrapingNow, scheduledTelegramScrapingV2, runTelegramScrapingNowV2 } from './telegramJobScraper';

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

// Export email notification functions
import * as functions from 'firebase-functions';
import { sendRoleChangeEmail, sendSubscriptionChangeEmail } from './emailService';

export const notifyRoleChange = functions.https.onCall(async (data, context) => {
  // Verify the caller is authenticated and is an admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userEmail, userName, oldRole, newRole } = data;

  if (!userEmail || !userName || !oldRole || !newRole) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
  }

  try {
    await sendRoleChangeEmail(userEmail, userName, oldRole, newRole);
    return { success: true, message: 'Role change email sent successfully' };
  } catch (error) {
    functions.logger.error('Error sending role change email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send email');
  }
});

export const notifySubscriptionChange = functions.https.onCall(async (data, context) => {
  // Verify the caller is authenticated and is an admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userEmail, userName, oldPlan, newPlan } = data;

  if (!userEmail || !userName || !oldPlan || !newPlan) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
  }

  try {
    await sendSubscriptionChangeEmail(userEmail, userName, oldPlan, newPlan);
    return { success: true, message: 'Subscription change email sent successfully' };
  } catch (error) {
    functions.logger.error('Error sending subscription change email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send email');
  }
});



