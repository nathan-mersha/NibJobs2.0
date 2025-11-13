import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Interface for TelegramChannel (matching frontend)
interface TelegramChannelData {
  username: string;
  name: string;
  imageUrl?: string;
  category: string;
  isActive: boolean;
  scrapingEnabled: boolean;
  totalJobsScraped?: number;
  lastScraped?: admin.firestore.Timestamp | null;
}

/**
 * Create a new Telegram channel
 */
export const createTelegramChannel = functions
  .region('us-central1')
  .https.onCall(async (data: TelegramChannelData, context) => {
    try {
      // Validate authentication (optional - remove if you want public access)
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'Authentication required to create channels'
        );
      }

      // Validate input data
      if (!data.username || !data.name) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Username and name are required'
        );
      }

      // Clean username (remove @ if present)
      const cleanUsername = data.username.replace('@', '').trim();

      // Check if channel already exists
      const existingChannel = await db.collection('telegramChannels')
        .where('username', '==', cleanUsername)
        .get();

      if (!existingChannel.empty) {
        throw new functions.https.HttpsError(
          'already-exists',
          `Channel @${cleanUsername} already exists`
        );
      }

      // Create new channel document
      const newChannelData = {
        username: cleanUsername,
        name: data.name.trim(),
        imageUrl: data.imageUrl || null,
        category: data.category || 'general',
        isActive: data.isActive !== undefined ? data.isActive : true,
        scrapingEnabled: data.scrapingEnabled !== undefined ? data.scrapingEnabled : true,
        totalJobsScraped: 0,
        lastScraped: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Add to Firestore
      const docRef = await db.collection('telegramChannels').add(newChannelData);

      functions.logger.info(`Created new Telegram channel: @${cleanUsername}`, {
        channelId: docRef.id,
        username: cleanUsername,
        name: data.name
      });

      return {
        success: true,
        channelId: docRef.id,
        message: `Channel @${cleanUsername} created successfully`
      };

    } catch (error) {
      functions.logger.error('Error creating Telegram channel:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        'internal',
        'Failed to create channel'
      );
    }
  });

/**
 * Update an existing Telegram channel
 */
export const updateTelegramChannel = functions
  .region('us-central1')
  .https.onCall(async (data: { channelId: string; updates: Partial<TelegramChannelData> }, context) => {
    try {
      // Validate authentication (optional)
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'Authentication required to update channels'
        );
      }

      if (!data.channelId) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Channel ID is required'
        );
      }

      // Get channel reference
      const channelRef = db.collection('telegramChannels').doc(data.channelId);
      const channelDoc = await channelRef.get();

      if (!channelDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Channel not found'
        );
      }

      // Prepare update data
      const updateData: any = {
        ...data.updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Clean username if being updated
      if (updateData.username) {
        updateData.username = updateData.username.replace('@', '').trim();
      }

      // Update channel
      await channelRef.update(updateData);

      functions.logger.info(`Updated Telegram channel: ${data.channelId}`, {
        channelId: data.channelId,
        updates: data.updates
      });

      return {
        success: true,
        message: 'Channel updated successfully'
      };

    } catch (error) {
      functions.logger.error('Error updating Telegram channel:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        'internal',
        'Failed to update channel'
      );
    }
  });

/**
 * Delete a Telegram channel
 */
export const deleteTelegramChannel = functions
  .region('us-central1')
  .https.onCall(async (data: { channelId: string }, context) => {
    try {
      // Validate authentication (optional)
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'Authentication required to delete channels'
        );
      }

      if (!data.channelId) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Channel ID is required'
        );
      }

      // Get channel reference
      const channelRef = db.collection('telegramChannels').doc(data.channelId);
      const channelDoc = await channelRef.get();

      if (!channelDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Channel not found'
        );
      }

      const channelData = channelDoc.data();

      // Delete channel document
      await channelRef.delete();

      functions.logger.info(`Deleted Telegram channel: ${data.channelId}`, {
        channelId: data.channelId,
        username: channelData?.username,
        name: channelData?.name
      });

      return {
        success: true,
        message: 'Channel deleted successfully'
      };

    } catch (error) {
      functions.logger.error('Error deleting Telegram channel:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        'internal',
        'Failed to delete channel'
      );
    }
  });

/**
 * Get all Telegram channels with optional filtering
 */
export const getTelegramChannels = functions
  .region('us-central1')
  .https.onCall(async (data: { activeOnly?: boolean; category?: string } = {}, context) => {
    try {
      let query = db.collection('telegramChannels').orderBy('createdAt', 'desc');

      // Apply filters
      if (data.activeOnly) {
        query = query.where('isActive', '==', true);
      }

      if (data.category) {
        query = query.where('category', '==', data.category);
      }

      const snapshot = await query.get();
      const channels = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        success: true,
        channels,
        total: channels.length
      };

    } catch (error) {
      functions.logger.error('Error fetching Telegram channels:', error);
      
      throw new functions.https.HttpsError(
        'internal',
        'Failed to fetch channels'
      );
    }
  });

/**
 * Test Telegram channel connectivity
 */
export const testTelegramChannel = functions
  .region('us-central1')
  .https.onCall(async (data: { username: string }, context) => {
    try {
      if (!data.username) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Channel username is required'
        );
      }

      const cleanUsername = data.username.replace('@', '').trim();

      // TODO: Implement actual Telegram connectivity test
      // This would require the TelegramClient setup from telegramJobScraper
      
      functions.logger.info(`Testing channel connectivity: @${cleanUsername}`);

      // For now, return a mock successful response
      // In a real implementation, you'd test the actual Telegram connection
      return {
        success: true,
        channelUsername: cleanUsername,
        accessible: true,
        messageCount: 0, // Would be actual message count from test
        message: `Channel @${cleanUsername} is accessible`
      };

    } catch (error) {
      functions.logger.error('Error testing Telegram channel:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        'internal',
        'Failed to test channel connectivity'
      );
    }
  });

/**
 * Trigger manual scraping for a specific channel
 */
export const triggerChannelScraping = functions
  .region('us-central1')
  .https.onCall(async (data: { channelId?: string; username?: string }, context) => {
    try {
      // Validate authentication (optional)
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'Authentication required to trigger scraping'
        );
      }

      let channelDoc;

      if (data.channelId) {
        // Find by ID
        const channelRef = db.collection('telegramChannels').doc(data.channelId);
        channelDoc = await channelRef.get();
      } else if (data.username) {
        // Find by username
        const cleanUsername = data.username.replace('@', '').trim();
        const channelQuery = await db.collection('telegramChannels')
          .where('username', '==', cleanUsername)
          .limit(1)
          .get();
        
        if (!channelQuery.empty) {
          channelDoc = channelQuery.docs[0];
        }
      } else {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Channel ID or username is required'
        );
      }

      if (!channelDoc || !channelDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Channel not found'
        );
      }

      const channelData = channelDoc.data();

      if (!channelData?.isActive || !channelData?.scrapingEnabled) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Channel is not active or scraping is disabled'
        );
      }

      // TODO: Implement actual scraping trigger
      // This would call the scraping logic from telegramJobScraper
      
      functions.logger.info(`Manual scraping triggered for channel: @${channelData.username}`, {
        channelId: channelDoc.id,
        username: channelData.username
      });

      return {
        success: true,
        channelId: channelDoc.id,
        username: channelData.username,
        message: `Manual scraping triggered for @${channelData.username}`
      };

    } catch (error) {
      functions.logger.error('Error triggering channel scraping:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        'internal',
        'Failed to trigger scraping'
      );
    }
  });