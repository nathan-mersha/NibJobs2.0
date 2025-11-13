const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const OpenAI = require('openai');
require('dotenv').config();

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
    await this.client.start();
    console.log('✅ Connected to Telegram successfully!');
    
    const me = await this.client.getMe();
    console.log('👤 Logged in as:', me.firstName, me.lastName || '', `(ID: ${me.id})`);
  }

  async getMockChannels() {
    // Real channels for testing  
    console.log('📋 Using real Telegram channels for testing...');
    
    const realChannels = [
      {
        id: '1193582142',
        username: 'freelance_ethio',
        name: 'Afriwork (Freelance Ethiopia)',
        isActive: true
      }
    ];

    console.log(`📊 Found ${realChannels.length} real channels:`, realChannels.map(c => c.name));
    return realChannels;
  }

  async getLatestChannelMessages(channel, limit = 5) {
    console.log(`📨 Fetching latest ${limit} messages from ${channel.name}...`);
    
    try {
      const messages = await this.client.getMessages(channel.username, { limit });
      const textMessages = messages.filter(msg => msg.message && msg.message.trim().length > 0);
      
      console.log(`✅ Retrieved ${messages.length} total messages, ${textMessages.length} with text from ${channel.name}`);
      
      return textMessages;
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
        console.log('Raw response:', content);
        return null;
      }
    } catch (error) {
      console.error('❌ OpenAI API error:', error.message);
      return null;
    }
  }

  async runScraping() {
    const startTime = Date.now();
    console.log('🚀 Starting Telegram job scraping...');
    console.log('⏰ Started at:', new Date().toISOString());
    
    let totalChannels = 0;
    let totalMessages = 0;
    let totalJobs = 0;
    const foundJobs = [];
    
    try {
      // Initialize Telegram client
      await this.initializeTelegramClient();

      // Get mock channels (replace with real Firestore query later)
      const channels = await this.getMockChannels();
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
          const messages = await this.getLatestChannelMessages(channel, 5);
          totalMessages += messages.length;

          // Process each message
          for (const message of messages) {
            console.log(`\n📝 Message ${message.id} (${new Date(message.date * 1000).toLocaleString()}):`);
            console.log(`   Content: ${message.message.substring(0, 150)}...`);
            
            // Extract job with OpenAI
            const jobData = await this.extractJobWithOpenAI(message.message, channel.name);
            
            if (jobData) {
              // Instead of saving to Firestore, just collect the jobs
              const jobEntry = {
                ...jobData,
                source: 'telegram',
                channelId: channel.id,
                channelName: channel.name,
                channelUsername: channel.username,
                originalMessage: message.message,
                messageId: message.id,
                messageDate: message.date,
                scrapedAt: new Date().toISOString()
              };
              
              foundJobs.push(jobEntry);
              totalJobs++;
              console.log('💾 Job collected for display');
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

      // Display found jobs
      if (foundJobs.length > 0) {
        console.log('\n📋 FOUND JOBS:');
        console.log('='.repeat(80));
        foundJobs.forEach((job, index) => {
          console.log(`\n${index + 1}. 💼 ${job.title}`);
          console.log(`   🏢 Company: ${job.company}`);
          console.log(`   📍 Location: ${job.location}`);
          console.log(`   📂 Category: ${job.category}`);
          console.log(`   💰 Salary: ${job.salary || 'Not specified'}`);
          console.log(`   📺 Channel: ${job.channelName}`);
          console.log(`   📝 Description: ${job.description.substring(0, 100)}...`);
          console.log('   ' + '-'.repeat(50));
        });
        console.log('='.repeat(80));
      }

      return {
        success: true,
        message: 'Scraping completed successfully',
        stats: {
          channels: totalChannels,
          messages: totalMessages,
          jobs: totalJobs,
          duration: Math.round(duration / 1000)
        },
        foundJobs: foundJobs
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
  console.log('🎯 Local Telegram Job Scraper Test (Real Channel)');
  console.log('=================================================\n');
  
  const scraper = new TelegramJobScraper();
  
  try {
    const result = await scraper.runScraping();
    console.log('\n✅ SUCCESS:', result.message);
    console.log('📈 Final Stats:', result.stats);
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