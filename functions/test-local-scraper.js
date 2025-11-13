const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const OpenAI = require('openai');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'nibjobs-dev'
  });
}

const db = admin.firestore();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class TelegramJobScraper {
  constructor() {
    this.client = null;
  }

  async initializeTelegramClient() {
    console.log('🔐 Initializing Telegram client...');
    
    const apiId = parseInt(process.env.TELEGRAM_API_ID);
    const apiHash = process.env.TELEGRAM_API_HASH;
    const sessionString = process.env.TELEGRAM_SESSION_STRING;

    if (!apiId || !apiHash || !sessionString) {
      throw new Error('Missing Telegram credentials');
    }

    console.log('✅ API ID:', apiId ? 'Set' : 'Missing');
    console.log('✅ API Hash:', apiHash ? 'Set (length: ' + apiHash.length + ')' : 'Missing');
    console.log('✅ Session String:', sessionString ? 'Set (length: ' + sessionString.length + ')' : 'Missing');

    const session = new StringSession(sessionString);
    this.client = new TelegramClient(session, apiId, apiHash, {
      connectionRetries: 5,
    });

    console.log('🔌 Connecting to Telegram...');
    console.log('⏳ This may take up to 60 seconds...');
    
    try {
      // Add timeout for connection - increased to 60 seconds
      const connectPromise = this.client.start({
        onError: (err) => {
          console.error('🚨 Telegram auth error:', err.message);
        }
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 60 seconds')), 60000)
      );
      
      await Promise.race([connectPromise, timeoutPromise]);
      console.log('✅ Connected to Telegram successfully!');
      
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      
      // Try to check if session is corrupted
      if (error.message.includes('AUTH_KEY_INVALID') || error.message.includes('SESSION_PASSWORD_NEEDED')) {
        console.log('⚠️  Session string may be invalid or expired');
        console.log('💡 You may need to regenerate the session string');
      }
      
      throw error;
    }
    
    console.log('👤 Getting user info...');
    const me = await this.client.getMe();
    console.log('👤 Logged in as:', me.firstName, me.lastName || '', `(ID: ${me.id})`);
  }

  async getActiveChannels() {
    console.log('📋 Fetching active Telegram channels from Firestore...');
    
    const channelsSnapshot = await db
      .collection('telegramChannels')
      .where('isActive', '==', true)
      .get();

    const channels = [];
    channelsSnapshot.forEach(doc => {
      const data = doc.data();
      channels.push({
        id: doc.id,
        username: data.username,
        name: data.name || data.username,
        ...data
      });
    });

    console.log(`📊 Found ${channels.length} active channels:`, channels.map(c => c.name));
    return channels;
  }

  async getLatestChannelMessages(channel, limit = 10) {
    console.log(`📨 Fetching latest ${limit} messages from ${channel.name}...`);
    
    try {
      const messages = await this.client.getMessages(channel.username, { limit });
      console.log(`✅ Retrieved ${messages.length} messages from ${channel.name}`);
      
      return messages.filter(msg => msg.message && msg.message.trim().length > 0);
    } catch (error) {
      console.error(`❌ Error fetching messages from ${channel.name}:`, error.message);
      return [];
    }
  }

  async extractJobWithOpenAI(messageText, channelName) {
    console.log(`🤖 Processing message with OpenAI (${messageText.substring(0, 50)}...)`);
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a job posting analyzer. Analyze the following message and determine if it's a legitimate job posting. If it is, extract the job details in JSON format. If it's not a job posting, return null.

Required JSON format:
{
  "isJob": true/false,
  "title": "job title",
  "company": "company name",
  "location": "job location",
  "type": "full-time/part-time/contract/internship",
  "category": "engineering/marketing/sales/design/etc",
  "description": "job description",
  "requirements": "job requirements",
  "salary": "salary range or null",
  "contactInfo": "contact information"
}

Only return valid job postings. Ignore spam, advertisements, news, or non-job related content.`
          },
          {
            role: 'user',
            content: `Channel: ${channelName}\n\nMessage: ${messageText}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content?.trim();
      
      if (!content) {
        console.log('❌ No content from OpenAI');
        return null;
      }

      console.log('🤖 OpenAI Response:', content.substring(0, 100) + '...');
      
      try {
        const jobData = JSON.parse(content);
        if (jobData && jobData.isJob) {
          console.log('✅ Valid job found:', jobData.title);
          return jobData;
        } else {
          console.log('ℹ️  Not a job posting');
          return null;
        }
      } catch (parseError) {
        console.log('❌ Failed to parse OpenAI response as JSON');
        return null;
      }
    } catch (error) {
      console.error('❌ OpenAI API error:', error.message);
      return null;
    }
  }

  async saveJobToFirestore(jobData, originalMessage, channelInfo) {
    console.log('💾 Saving job to Firestore:', jobData.title);
    
    const jobDoc = {
      ...jobData,
      source: 'telegram',
      channelId: channelInfo.id,
      channelName: channelInfo.name,
      channelUsername: channelInfo.username,
      originalMessage: originalMessage.message,
      messageId: originalMessage.id,
      messageDate: originalMessage.date,
      scrapedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      views: 0,
      applications: 0
    };

    // Check for duplicates
    const duplicateQuery = await db
      .collection('jobs')
      .where('title', '==', jobData.title)
      .where('company', '==', jobData.company)
      .where('channelId', '==', channelInfo.id)
      .limit(1)
      .get();

    if (!duplicateQuery.empty) {
      console.log('⚠️  Duplicate job found, skipping');
      return null;
    }

    const docRef = await db.collection('jobs').add(jobDoc);
    console.log('✅ Job saved with ID:', docRef.id);
    return docRef.id;
  }

  async runScraping() {
    const startTime = Date.now();
    console.log('🚀 Starting Telegram job scraping...');
    console.log('⏰ Started at:', new Date().toISOString());
    
    let totalChannels = 0;
    let totalMessages = 0;
    let totalJobs = 0;
    
    try {
      // Initialize Telegram client
      await this.initializeTelegramClient();

      // Get active channels
      const channels = await this.getActiveChannels();
      totalChannels = channels.length;

      if (channels.length === 0) {
        console.log('⚠️  No active channels found');
        return { success: true, message: 'No active channels to scrape', stats: {} };
      }

      // Process each channel
      for (const channel of channels) {
        console.log(`\n🔄 Processing channel: ${channel.name} (@${channel.username})`);
        
        try {
          // Get latest messages
          const messages = await this.getLatestChannelMessages(channel, 10);
          totalMessages += messages.length;

          // Process each message
          for (const message of messages) {
            console.log(`\n📝 Message ${message.id} (${new Date(message.date * 1000).toLocaleString()}):`);
            console.log(`   Content: ${message.message.substring(0, 100)}...`);
            
            // Extract job with OpenAI
            const jobData = await this.extractJobWithOpenAI(message.message, channel.name);
            
            if (jobData) {
              // Save to Firestore
              const jobId = await this.saveJobToFirestore(jobData, message, channel);
              if (jobId) {
                totalJobs++;
              }
            }
          }
          
        } catch (channelError) {
          console.error(`❌ Error processing channel ${channel.name}:`, channelError.message);
        }
      }

      // Disconnect
      if (this.client) {
        await this.client.disconnect();
        console.log('🔌 Disconnected from Telegram');
      }

      const duration = Date.now() - startTime;
      console.log('\n🎉 Scraping completed successfully!');
      console.log('📊 Statistics:');
      console.log(`   • Channels processed: ${totalChannels}`);
      console.log(`   • Messages analyzed: ${totalMessages}`);
      console.log(`   • Jobs extracted: ${totalJobs}`);
      console.log(`   • Duration: ${Math.round(duration / 1000)}s`);

      return {
        success: true,
        message: 'Scraping completed successfully',
        stats: {
          channels: totalChannels,
          messages: totalMessages,
          jobs: totalJobs,
          duration: Math.round(duration / 1000)
        }
      };

    } catch (error) {
      console.error('💥 Scraping failed:', error);
      
      if (this.client) {
        try {
          await this.client.disconnect();
        } catch (disconnectError) {
          console.error('Error disconnecting:', disconnectError.message);
        }
      }

      throw error;
    }
  }
}

// Run the scraper
async function main() {
  console.log('🎯 Local Telegram Job Scraper Test');
  console.log('===================================\n');
  
  const scraper = new TelegramJobScraper();
  
  try {
    const result = await scraper.runScraping();
    console.log('\n✅ SUCCESS:', result);
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    console.error('Stack trace:', error.stack);
  }
  
  console.log('\n🏁 Test completed');
  process.exit(0);
}

if (require.main === module) {
  main();
}