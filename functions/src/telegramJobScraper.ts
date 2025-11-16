import * as functions from 'firebase-functions';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { sendScrapingReport } from './emailService';

interface TelegramMessage {
  messageId: number;
  text: string;
  date: number;
  chatId: number;
  messageUrl: string;
}

interface TelegramChannel {
  id: string;
  username: string;
  name: string;
  imageUrl?: string;
  category: string;
  isActive: boolean;
  scrapingEnabled: boolean;
  totalJobsScraped: number;
  lastScraped: admin.firestore.FieldValue | Date | null;
}

interface JobExtractionResult {
  title: string;
  company?: string;
  location?: string;
  salary?: string;
  contractType: string;
  experienceLevel?: string;
  description: string;
  tags: string[];
  isRemote: boolean;
  category: string;
  applyLink?: string;
  currency?: string;
  categoryConfidence?: number;
  alternativeCategories?: string[];
  skillsRequired?: string[];
  searchKeywords?: string[];
  expirationDate?: string;
  relatedUrls?: string[];
}

class TelegramJobScraper {
  private db: admin.firestore.Firestore;
  private openai: OpenAI;
  private client: TelegramClient | null = null;
  private progressDocRef: admin.firestore.DocumentReference | null = null;

  constructor() {
    this.db = admin.firestore();
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  /**
   * Initialize progress tracking document
   */
  async initializeProgress(totalChannels: number, sessionId: string): Promise<void> {
    try {
      this.progressDocRef = this.db.collection('scrapingProgress').doc(sessionId);
      await this.progressDocRef.set({
        totalChannels,
        processedChannels: 0,
        currentChannel: null,
        currentChannelIndex: 0,
        totalJobsExtracted: 0,
        totalMessagesProcessed: 0,
        status: 'running',
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        errors: []
      });
      functions.logger.info(`📊 Progress tracking initialized: ${sessionId}`);
    } catch (error) {
      functions.logger.error('Failed to initialize progress tracking:', error);
    }
  }

  /**
   * Update progress in real-time
   */
  async updateProgress(update: {
    processedChannels?: number;
    currentChannel?: string | null;
    currentChannelIndex?: number;
    totalJobsExtracted?: number;
    totalMessagesProcessed?: number;
    status?: string;
    errors?: string[];
  }): Promise<void> {
    if (!this.progressDocRef) return;
    
    try {
      await this.progressDocRef.update({
        ...update,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      functions.logger.warn('Failed to update progress:', error);
    }
  }

  /**
   * Complete progress tracking
   */
  async completeProgress(success: boolean, finalStats: any, scrapingType: 'manual' | 'scheduled' = 'manual'): Promise<void> {
    if (!this.progressDocRef) return;
    
    try {
      const completedAt = new Date();
      
      await this.progressDocRef.update({
        status: success ? 'completed' : 'failed',
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        ...finalStats
      });
      functions.logger.info('✅ Progress tracking completed');

      // Get the progress document to retrieve startedAt
      const progressDoc = await this.progressDocRef.get();
      const progressData = progressDoc.data();

      if (progressData) {
        const startedAt = progressData.startedAt?.toDate() || new Date();
        
        // Send email report to superadmins
        await sendScrapingReport({
          type: scrapingType,
          success,
          totalChannels: progressData.totalChannels || 0,
          totalJobsExtracted: finalStats.totalJobsExtracted || 0,
          totalMessagesProcessed: finalStats.totalMessagesProcessed || 0,
          errors: finalStats.errors || [],
          startedAt,
          completedAt,
          sessionId: this.progressDocRef.id,
        });
      }
    } catch (error) {
      functions.logger.error('Failed to complete progress tracking:', error);
    }
  }

  async initializeTelegramClient(): Promise<boolean> {
    try {
      if (this.client) {
        return true;
      }
      
      const apiId = parseInt(process.env.TELEGRAM_API_ID!);
      const apiHash = process.env.TELEGRAM_API_HASH!;
      const sessionString = process.env.TELEGRAM_SESSION_STRING!;

      const session = new StringSession(sessionString);
      this.client = new TelegramClient(session, apiId, apiHash, {
        connectionRetries: 5,
      });

      await this.client.start({
        phoneNumber: async () => '',
        password: async () => '',
        phoneCode: async () => '',
        onError: (err) => console.log(err),
      });
      
      functions.logger.info('✅ Telegram client connected successfully');
      return true;
      
    } catch (error) {
      functions.logger.error('❌ Failed to connect Telegram client:', error);
      this.client = null;
      return false;
    }
  }

  async getLatestChannelMessages(channelUsername: string, limit: number = 100): Promise<TelegramMessage[]> {
    try {
      if (!this.client) {
        throw new Error('Telegram client not initialized');
      }

      functions.logger.info(`📱 Fetching messages from last 24 hours from @${channelUsername}`);

      const entity = await this.client.getEntity(`@${channelUsername}`);
      
      // Calculate timestamp for 24 hours ago
      const twentyFourHoursAgo = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
      
      // Fetch messages with a higher limit to ensure we get all from last 24 hours
      const messages = await this.client.getMessages(entity, { limit });

      const telegramMessages: TelegramMessage[] = messages
        .filter(msg => {
          if (!msg.message || msg.message.trim().length === 0) return false;
          
          // Filter by date - only include messages from last 24 hours
          const messageDate = msg.date || Math.floor(Date.now() / 1000);
          return messageDate >= twentyFourHoursAgo;
        })
        .map(msg => ({
          messageId: msg.id,
          text: msg.message || '',
          date: msg.date || Math.floor(Date.now() / 1000),
          chatId: msg.chatId?.toJSNumber() || 0,
          messageUrl: `https://t.me/${channelUsername}/${msg.id}`
        }));

      functions.logger.info(`📨 Retrieved ${telegramMessages.length} messages from last 24 hours from @${channelUsername}`);
      return telegramMessages;

    } catch (error) {
      functions.logger.error(`❌ Failed to get messages from @${channelUsername}:`, error);
      return [];
    }
  }

  async extractJobWithOpenAI(messageText: string, channelCategory: string): Promise<JobExtractionResult | null> {
    try {
      functions.logger.info(`🤖 Processing message with OpenAI`);
      
      // Get available categories for better AI categorization
      const categoriesSnapshot = await this.db.collection('categories').get();
      const availableCategories: string[] = [];
      
      categoriesSnapshot.forEach(doc => {
        const data = doc.data();
        availableCategories.push(data.name);
      });

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a job posting analyzer. Extract job details in JSON format with enhanced categorization.

Available categories: ${availableCategories.join(', ')}

Return JSON:
{
  "isJob": true/false,
  "title": "job title",
  "company": "company name",
  "location": "job location", 
  "contractType": "Full-time/Part-time/Contract/Freelance/Internship",
  "category": "best matching category from available list",
  "categoryConfidence": 0.8,
  "alternativeCategories": ["other possible categories"],
  "description": "job description",
  "tags": ["skill1", "skill2"],
  "skillsRequired": ["technical skills extracted"],
  "searchKeywords": ["keywords for search"],
  "salary": "salary range or null",
  "applyLink": "contact info",
  "isRemote": true/false,
  "currency": "USD/EUR/ETB etc",
  "expirationDate": "YYYY-MM-DD or null if not mentioned",
  "relatedUrls": ["array of any URLs found in description"]
}

Instructions:
1. Choose the MOST SPECIFIC category that matches (prefer subcategories)
2. Set categoryConfidence between 0-1 based on certainty
3. List up to 3 alternative categories if applicable
4. Extract specific technical skills separately from general tags
5. Generate search-friendly keywords
6. Extract expiration/deadline date if mentioned (e.g., "deadline: Jan 15", "expires on 2025-01-20")
7. Extract all URLs found in the job description (application links, company websites, etc.)
8. Only return valid job postings.`
          },
          {
            role: 'user',
            content: `Channel: ${channelCategory}\n\nMessage: ${messageText}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const responseContent = completion.choices[0]?.message?.content?.trim();
      if (!responseContent) {
        return null;
      }

      // Remove markdown code blocks if present (```json ... ``` or ``` ... ```)
      let cleanedResponse = responseContent;
      if (cleanedResponse.startsWith('```')) {
        // Remove opening ```json or ```
        cleanedResponse = cleanedResponse.replace(/^```(?:json)?\s*\n?/, '');
        // Remove closing ```
        cleanedResponse = cleanedResponse.replace(/\n?```\s*$/, '');
      }

      const extractedData = JSON.parse(cleanedResponse);
      
      if (!extractedData || !extractedData.isJob) {
        return null;
      }

      return {
        title: extractedData.title,
        company: extractedData.company,
        location: extractedData.location,
        salary: extractedData.salary,
        contractType: extractedData.contractType || 'Full-time',
        category: extractedData.category || channelCategory,
        categoryConfidence: extractedData.categoryConfidence || 0.5,
        alternativeCategories: extractedData.alternativeCategories || [],
        description: extractedData.description,
        tags: Array.isArray(extractedData.tags) ? extractedData.tags : [],
        skillsRequired: Array.isArray(extractedData.skillsRequired) ? extractedData.skillsRequired : [],
        searchKeywords: Array.isArray(extractedData.searchKeywords) ? extractedData.searchKeywords : [],
        isRemote: extractedData.isRemote || false,
        applyLink: extractedData.applyLink,
        currency: extractedData.currency
      };
      
    } catch (error) {
      functions.logger.error('OpenAI extraction failed:', error);
      return null;
    }
  }

  async jobExists(title: string, company: string, messageId: string): Promise<boolean> {
    try {
      const querySnapshot = await this.db.collection('jobs')
        .where('title', '==', title)
        .where('company', '==', company)
        .where('telegramMessageId', '==', messageId)
        .get();

      return !querySnapshot.empty;
    } catch (error) {
      return false;
    }
  }

  async saveJob(
    jobData: JobExtractionResult, 
    telegramMessage: TelegramMessage,
    channel: TelegramChannel
  ): Promise<string | null> {
    try {
      const exists = await this.jobExists(
        jobData.title, 
        jobData.company || '', 
        telegramMessage.messageId.toString()
      );

      if (exists) {
        functions.logger.info(`Job already exists: ${jobData.title}`);
        return null;
      }

      // Get category hierarchy information
      const categoryData = await this.getCategoryHierarchy(jobData.category);
      
      // Generate search keywords
      const searchKeywords = this.generateSearchKeywords(jobData, categoryData);

      // Create enhanced job document
      const jobDoc = {
        title: jobData.title,
        
        // Enhanced Category System
        category: jobData.category,                              // Subcategory name
        categoryId: categoryData.categoryId,                     // Subcategory ID
        categoryPath: categoryData.categoryPath,                 // Full path
        mainCategory: categoryData.mainCategory,                 // Main category name
        mainCategoryId: categoryData.mainCategoryId,             // Main category ID
        categoryHierarchy: categoryData.categoryHierarchy,       // Breadcrumb array
        
        // Job Details
        contractType: jobData.contractType,
        salary: jobData.salary || null,
        tags: jobData.tags || [],                               // Job-specific tags from AI
        description: jobData.description,
        applyLink: jobData.applyLink || null,
        jobSource: `Telegram: @${channel.username}`,
        sourceImageUrl: channel.imageUrl || null,               // Telegram channel image
        rawPost: telegramMessage.text,
        location: jobData.location || null,
        company: jobData.company || null,
        experienceLevel: jobData.experienceLevel || null,
        isRemote: jobData.isRemote,
        currency: jobData.currency || null,
        
        // AI Classification
        categoryConfidence: jobData.categoryConfidence || 0.5,
        alternativeCategories: jobData.alternativeCategories || [],
        
        // Enhanced Searchability
        searchKeywords: searchKeywords,
        skillsRequired: jobData.skillsRequired || [],
        
        // Additional Job Information
        expirationDate: jobData.expirationDate ? this.parseExpirationDate(jobData.expirationDate) : null,
        relatedUrls: jobData.relatedUrls || [],
        
        // Timestamps
        postedDate: admin.firestore.Timestamp.fromMillis(telegramMessage.date * 1000),
        extractedAt: admin.firestore.Timestamp.now(),
        createdAt: admin.firestore.Timestamp.now(),
        
        // Telegram Source
        telegramMessageId: telegramMessage.messageId.toString(),
        telegramMessageUrl: telegramMessage.messageUrl,
        telegramChannelId: channel.username,
        telegramChannelName: channel.username,
        
        // Engagement & Status
        notificationSent: false,
        viewCount: 0,
        applicationCount: 0,
        isActive: true,
        expiryDate: null
      };

      const docRef = await this.db.collection('jobs').add(jobDoc);
      
      // Update category job count
      await this.updateCategoryJobCount(categoryData.categoryId);
      if (categoryData.mainCategoryId !== categoryData.categoryId) {
        await this.updateCategoryJobCount(categoryData.mainCategoryId);
      }
      
      functions.logger.info(`✅ Enhanced job saved: ${jobData.title} -> ${categoryData.categoryPath} (ID: ${docRef.id})`);
      return docRef.id;
      
    } catch (error) {
      functions.logger.error('Error saving enhanced job:', error);
      throw error;
    }
  }

  /**
   * Get category hierarchy information for a category name
   */
  private async getCategoryHierarchy(categoryName: string) {
    try {
      // Find the category document
      const categorySnapshot = await this.db.collection('categories')
        .where('name', '==', categoryName)
        .limit(1)
        .get();

      if (!categorySnapshot.empty) {
        const categoryDoc = categorySnapshot.docs[0];
        const categoryData = categoryDoc.data();
        
        if (categoryData.level === 0) {
          // It's a main category
          return {
            categoryId: categoryData.id,
            categoryPath: categoryData.path,
            mainCategory: categoryData.name,
            mainCategoryId: categoryData.id,
            categoryHierarchy: [categoryData.name]
          };
        } else {
          // It's a subcategory, get parent info
          const parentSnapshot = await this.db.collection('categories')
            .where('path', '==', categoryData.parentPath)
            .limit(1)
            .get();

          if (!parentSnapshot.empty) {
            const parentData = parentSnapshot.docs[0].data();
            return {
              categoryId: categoryData.id,
              categoryPath: categoryData.path,
              mainCategory: parentData.name,
              mainCategoryId: parentData.id,
              categoryHierarchy: [parentData.name, categoryData.name]
            };
          }
        }
      }
      
      // Fallback to "Other" category
      return {
        categoryId: 'other',
        categoryPath: 'other',
        mainCategory: 'Other',
        mainCategoryId: 'other',
        categoryHierarchy: ['Other']
      };
      
    } catch (error) {
      functions.logger.warn('Failed to get category hierarchy:', error);
      return {
        categoryId: 'other',
        categoryPath: 'other', 
        mainCategory: 'Other',
        mainCategoryId: 'other',
        categoryHierarchy: ['Other']
      };
    }
  }

  /**
   * Parse expiration date string to Firestore Timestamp
   */
  private parseExpirationDate(dateString: string): admin.firestore.Timestamp | null {
    try {
      // Try parsing as ISO date format (YYYY-MM-DD)
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return admin.firestore.Timestamp.fromDate(date);
      }
      return null;
    } catch (error) {
      functions.logger.warn(`Failed to parse expiration date: ${dateString}`, error);
      return null;
    }
  }

  /**
   * Generate search keywords from job data
   */
  private generateSearchKeywords(jobData: JobExtractionResult, categoryData: any): string[] {
    const keywords = new Set<string>();
    
    // Add from title
    jobData.title.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 2) keywords.add(word);
    });
    
    // Add from company
    if (jobData.company) {
      jobData.company.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 2) keywords.add(word);
      });
    }
    
    // Add from job tags
    jobData.tags?.forEach(tag => keywords.add(tag.toLowerCase()));
    
    // Add from skills
    jobData.skillsRequired?.forEach(skill => keywords.add(skill.toLowerCase()));
    
    // Add from search keywords if provided
    jobData.searchKeywords?.forEach(keyword => keywords.add(keyword.toLowerCase()));
    
    // Add category names
    categoryData.categoryHierarchy.forEach((cat: string) => {
      cat.toLowerCase().split(/\s+/).forEach((word: string) => {
        if (word.length > 2) keywords.add(word);
      });
    });
    
    return Array.from(keywords).slice(0, 20); // Limit to 20 keywords
  }

  /**
   * Update job count for a category
   */
  private async updateCategoryJobCount(categoryId: string) {
    try {
      const categoryRef = this.db.collection('categories').doc(categoryId);
      await categoryRef.update({
        jobCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      functions.logger.warn(`Failed to update job count for category ${categoryId}:`, error);
    }
  }

  async processChannel(channel: TelegramChannel): Promise<{ processed: number; extracted: number; errors: string[] }> {
    const result = { processed: 0, extracted: 0, errors: [] as string[] };
    
    try {
      functions.logger.info(`🔍 Processing channel: @${channel.username}`);
      
      const messages = await this.getLatestChannelMessages(channel.username);
      
      if (messages.length === 0) {
        const infoMsg = `ℹ️ Channel @${channel.username} had no new messages in the last 24 hours`;
        functions.logger.info(infoMsg);
        // Not an error - channels can legitimately have no new messages
        return result;
      }
      
      for (const message of messages) {
        try {
          result.processed++;
          
          const jobData = await this.extractJobWithOpenAI(message.text, channel.category);
          
          if (!jobData) {
            continue;
          }

          const jobId = await this.saveJob(jobData, message, channel);
          
          if (jobId) {
            result.extracted++;
          }

        } catch (error) {
          const errorMsg = `❌ Error processing message ${message.messageId} in @${channel.username}: ${error instanceof Error ? error.message : String(error)}`;
          functions.logger.error(errorMsg, { error, channel: channel.username, messageId: message.messageId });
          result.errors.push(errorMsg);
        }
      }

      await this.updateChannelStats(channel.id, result.extracted);
      
      functions.logger.info(`✅ Channel @${channel.username}: ${result.extracted} jobs extracted`);
      
    } catch (error) {
      const errorMsg = `❌ Critical error processing channel @${channel.username}: ${error instanceof Error ? error.message : String(error)}`;
      functions.logger.error(errorMsg, { error, channel: channel.username });
      result.errors.push(errorMsg);
    }
    
    return result;
  }

  async updateChannelStats(channelId: string, newJobsCount: number): Promise<void> {
    try {
      await this.db.collection('telegramChannels').doc(channelId).update({
        totalJobsScraped: admin.firestore.FieldValue.increment(newJobsCount),
        lastScraped: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      functions.logger.error(`Failed to update stats for channel ${channelId}:`, error);
    }
  }
}

// 1st Gen Functions (kept for backward compatibility)
export const scheduledTelegramScraping = functions
  .region('us-central1')
  .pubsub.schedule('0 9 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    functions.logger.info('⚠️ Using 1st Gen function. Please migrate to scheduledTelegramScrapingV2');
    // Keep minimal implementation for backward compatibility
  });

export const runTelegramScrapingNow = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 540,
    memory: '512MB'
  })
  .https.onCall(async (data, context) => {
    throw new functions.https.HttpsError(
      'unimplemented',
      'This function has been migrated to runTelegramScrapingNowV2. Please update your client code.'
    );
  });

// 2nd Gen Scheduled Function - runs daily at 9 AM UTC
export const scheduledTelegramScrapingV2 = onSchedule({
  schedule: '0 9 * * *',
  timeZone: 'UTC',
  region: 'us-central1',
  timeoutSeconds: 3600, // 60 minutes for 2nd gen!
  memory: '512MiB',
  secrets: ['OPENAI_API_KEY', 'TELEGRAM_API_ID', 'TELEGRAM_API_HASH', 'TELEGRAM_SESSION_STRING', 'GMAIL_USER', 'GMAIL_APP_PASSWORD']
}, async (event) => {
  const scraper = new TelegramJobScraper();
  const sessionId = `scheduled_${Date.now()}`;

  try {
    functions.logger.info('🚀 Starting scheduled Telegram scraping...');

    const connected = await scraper.initializeTelegramClient();
    if (!connected) {
      throw new Error('Failed to connect to Telegram');
    }

    const channelsSnapshot = await admin.firestore()
      .collection('telegramChannels')
      .where('isActive', '==', true)
      .where('scrapingEnabled', '==', true)
      .get();

    if (channelsSnapshot.empty) {
      functions.logger.warn('No active channels found');
      return; // Don't return value in 2nd gen scheduled functions
    }

    // Initialize progress tracking
    await scraper.initializeProgress(channelsSnapshot.size, sessionId);

    const totalResults = {
      processed: 0,
      extracted: 0,
      errors: [] as string[]
    };

    for (const doc of channelsSnapshot.docs) {
      const channel = doc.data() as TelegramChannel;
      const result = await scraper.processChannel(channel);
      
      totalResults.processed += result.processed;
      totalResults.extracted += result.extracted;
      totalResults.errors.push(...result.errors);
    }

    functions.logger.info(`🎉 Scraping completed: ${totalResults.extracted} jobs from ${channelsSnapshot.size} channels`);

    // Mark progress as completed and send email report
    await scraper.completeProgress(true, {
      totalJobsExtracted: totalResults.extracted,
      totalMessagesProcessed: totalResults.processed,
      errors: totalResults.errors
    }, 'scheduled');

  } catch (error) {
    functions.logger.error('❌ Scheduled scraping failed:', error);
    
    // Mark progress as failed and send email report
    const errorMessage = error instanceof Error ? error.message : String(error);
    await scraper.completeProgress(false, { 
      error: errorMessage,
      errors: [errorMessage]
    }, 'scheduled');
    
    throw error;
  }
});

// 2nd Gen Callable Function - manual scraping with 60 minute timeout
export const runTelegramScrapingNowV2 = onCall({
  region: 'us-central1',
  timeoutSeconds: 3600, // 60 minutes for 2nd gen!
  memory: '512MiB',
  cors: true, // Enable CORS
  secrets: ['OPENAI_API_KEY', 'TELEGRAM_API_ID', 'TELEGRAM_API_HASH', 'TELEGRAM_SESSION_STRING', 'GMAIL_USER', 'GMAIL_APP_PASSWORD']
}, async (request) => {
  const sessionId = `scraping_${Date.now()}`;

  try {
    functions.logger.info('🚀 Starting manual scraping...');
    functions.logger.info('Request context:', { 
      auth: request.auth ? 'authenticated' : 'unauthenticated'
    });

      // Query for active channels with detailed logging
      functions.logger.info('🔍 Querying for active channels...');
      const channelsSnapshot = await admin.firestore()
        .collection('telegramChannels')
        .where('isActive', '==', true)
        .where('scrapingEnabled', '==', true)
        .get();

      functions.logger.info(`📊 Found ${channelsSnapshot.size} active channels with scraping enabled`);

      if (channelsSnapshot.empty) {
        functions.logger.warn('⚠️ No active channels found for scraping');
        throw new HttpsError('not-found', 'No active channels found. Please ensure channels are marked as active and have scraping enabled.');
      }

      // Log channel details
      const channelNames = channelsSnapshot.docs.map(doc => {
        const channel = doc.data();
        return `@${channel.username} (${channel.name})`;
      });
      functions.logger.info(`📝 Channels to process: ${channelNames.join(', ')}`);

      // Initialize progress tracking
      const scraper = new TelegramJobScraper();
      await scraper.initializeProgress(channelsSnapshot.size, sessionId);

      // Return immediately with session info - scraping continues in background
      const response = {
        success: true,
        sessionId,
        channelsToProcess: channelsSnapshot.size,
        channelDetails: channelNames,
        message: `Scraping started for ${channelsSnapshot.size} channels. Monitor progress with session ID: ${sessionId}`
      };

      // Start background scraping (don't await - let it run async)
      processChannelsInBackground(scraper, channelsSnapshot, sessionId, channelNames).catch(error => {
        functions.logger.error('Background scraping failed:', error);
      });

      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      functions.logger.error('❌ Manual scraping failed:', {
        error: errorMessage,
        stack: errorStack,
        type: error instanceof Error ? error.constructor.name : typeof error
      });
      
      // Return error details to the client
      throw new HttpsError(
        'internal', 
        `Scraping failed: ${errorMessage}`,
        { 
          error: errorMessage,
          errorType: error instanceof Error ? error.constructor.name : 'Unknown'
        }
      );
    }
});

/**
 * Process channels in the background after returning response to client
 */
async function processChannelsInBackground(
  scraper: TelegramJobScraper,
  channelsSnapshot: admin.firestore.QuerySnapshot,
  sessionId: string,
  channelNames: string[]
) {
  const totalResults = {
    processed: 0,
    extracted: 0,
    errors: [] as string[]
  };

  try {
    // Connect to Telegram
    const connected = await scraper.initializeTelegramClient();
    if (!connected) {
      throw new Error('Failed to connect to Telegram');
    }

    // Process each channel with detailed logging and progress updates
    let channelIndex = 0;
    for (const doc of channelsSnapshot.docs) {
      const channel = doc.data() as TelegramChannel;
      channelIndex++;
      
      functions.logger.info(`🔄 [${channelIndex}/${channelsSnapshot.size}] Starting to process channel: @${channel.username}`);
      
      // Update progress: starting new channel
      await scraper.updateProgress({
        currentChannel: `@${channel.username}`,
        currentChannelIndex: channelIndex,
        processedChannels: channelIndex - 1
      });
      
      const result = await scraper.processChannel(channel);
      
      totalResults.processed += result.processed;
      totalResults.extracted += result.extracted;
      totalResults.errors.push(...result.errors);

      // Update progress: channel completed
      await scraper.updateProgress({
        processedChannels: channelIndex,
        totalJobsExtracted: totalResults.extracted,
        totalMessagesProcessed: totalResults.processed,
        errors: totalResults.errors
      });

      functions.logger.info(`✅ Channel @${channel.username} complete: ${result.extracted} jobs from ${result.processed} messages`);
    }

    // Mark progress as completed and send email report
    await scraper.completeProgress(true, {
      totalJobsExtracted: totalResults.extracted,
      totalMessagesProcessed: totalResults.processed,
      errors: totalResults.errors
    }, 'manual');

    functions.logger.info(`🎉 Manual scraping completed: ${totalResults.extracted} jobs from ${channelsSnapshot.size} channels`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    functions.logger.error('❌ Background scraping failed:', {
      error: errorMessage,
      stack: errorStack
    });
    
    // Mark progress as failed with detailed error info and send email report
    await scraper.completeProgress(false, { 
      error: errorMessage,
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      errorDetails: errorStack,
      errors: [errorMessage]
    }, 'manual');
  }
}
