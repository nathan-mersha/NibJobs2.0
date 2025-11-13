const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./firebase/service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const sampleChannels = [
  {
    username: 'jobsindubai',
    name: 'Jobs in Dubai',
    category: 'general',
    country: 'UAE',
    isActive: true,
    scrapingEnabled: true,
    totalJobsScraped: 0,
    lastScraped: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    username: 'uaejobs',
    name: 'UAE Jobs Official',
    category: 'general',
    country: 'UAE',
    isActive: true,
    scrapingEnabled: true,
    totalJobsScraped: 0,
    lastScraped: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    username: 'techjobsme',
    name: 'Tech Jobs Middle East',
    category: 'technology',
    country: 'global',
    isActive: true,
    scrapingEnabled: true,
    totalJobsScraped: 0,
    lastScraped: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    username: 'remoteworkjobs',
    name: 'Remote Work Jobs',
    category: 'remote',
    country: 'global',
    isActive: true,
    scrapingEnabled: true,
    totalJobsScraped: 0,
    lastScraped: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    username: 'marketingjobs',
    name: 'Marketing & Sales Jobs',
    category: 'marketing',
    country: 'global',
    isActive: true,
    scrapingEnabled: true,
    totalJobsScraped: 0,
    lastScraped: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function populateChannels() {
  console.log('🚀 Starting to populate Telegram channels...');
  
  try {
    for (const channel of sampleChannels) {
      // Check if channel already exists
      const existingChannel = await db.collection('telegramChannels')
        .where('username', '==', channel.username)
        .get();

      if (!existingChannel.empty) {
        console.log(`⏭️  Channel @${channel.username} already exists, skipping...`);
        continue;
      }

      // Add the channel
      const docRef = await db.collection('telegramChannels').add(channel);
      console.log(`✅ Added channel @${channel.username} (${channel.name}) with ID: ${docRef.id}`);
    }

    console.log('🎉 Successfully populated Telegram channels!');
    console.log('\n📱 You can now view and manage these channels in your admin panel.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating channels:', error);
    process.exit(1);
  }
}

populateChannels();
