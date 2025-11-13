import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Simple test function to debug environment and setup
 */
export const debugTelegramSetup = functions
  .runWith({
    timeoutSeconds: 60,
    memory: '512MB',
  })
  .https.onCall(async (data, context) => {
    const result = {
      success: false,
      environment: {} as any,
      firestore: false,
      telegram: false,
      openai: false,
      channels: 0,
      errors: [] as string[]
    };

    try {
      functions.logger.info('🔍 Starting environment debug check');
      
      // Check environment variables
      result.environment = {
        TELEGRAM_API_ID: process.env.TELEGRAM_API_ID ? '✅ Set' : '❌ Missing',
        TELEGRAM_API_HASH: process.env.TELEGRAM_API_HASH ? '✅ Set' : '❌ Missing',
        TELEGRAM_SESSION_STRING: process.env.TELEGRAM_SESSION_STRING ? '✅ Set' : '❌ Missing',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'
      };
      
      functions.logger.info('Environment variables:', result.environment);

      // Test Firestore connection
      try {
        const db = admin.firestore();
        const channelsSnapshot = await db
          .collection('telegramChannels')
          .limit(1)
          .get();
          
        result.firestore = true;
        result.channels = channelsSnapshot.size;
        functions.logger.info('✅ Firestore connection successful');
        
      } catch (error) {
        result.errors.push(`Firestore error: ${error}`);
        functions.logger.error('❌ Firestore connection failed:', error);
      }

      // Test Telegram setup (basic check)
      if (process.env.TELEGRAM_API_ID && process.env.TELEGRAM_API_HASH) {
        result.telegram = true;
        functions.logger.info('✅ Telegram credentials available');
      } else {
        result.errors.push('Missing Telegram credentials');
        functions.logger.error('❌ Missing Telegram credentials');
      }

      // Test OpenAI setup
      if (process.env.OPENAI_API_KEY) {
        result.openai = true;
        functions.logger.info('✅ OpenAI credentials available');
      } else {
        result.errors.push('Missing OpenAI API key');
        functions.logger.error('❌ Missing OpenAI API key');
      }

      result.success = result.firestore && result.telegram && result.openai;
      
      functions.logger.info('🎯 Debug check completed:', {
        success: result.success,
        errors: result.errors.length
      });

      return result;
      
    } catch (error) {
      functions.logger.error('❌ Debug check failed:', error);
      result.errors.push(`Debug failed: ${error}`);
      return result;
    }
  });