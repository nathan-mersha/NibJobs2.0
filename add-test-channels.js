const admin = require('firebase-admin');
const { applicationDefault } = require('firebase-admin/app');

// Initialize Firebase Admin with default credentials
admin.initializeApp({
  credential: applicationDefault(),
  projectId: 'nibjobs-dev'
});

const db = admin.firestore();

async function addTestChannels() {
  console.log('🚀 Adding test Telegram channels...');
  
  const testChannels = [
    {
      id: 'test-channel-1',
      username: 'jobsindubai',
      name: 'Jobs in Dubai',
      category: 'general',
      isActive: true,
      scrapingEnabled: true,
      totalJobsScraped: 0,
      lastScraped: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'test-channel-2', 
      username: 'uaejobs',
      name: 'UAE Jobs Official',
      category: 'general',
      isActive: true,
      scrapingEnabled: true,
      totalJobsScraped: 0,
      lastScraped: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ];
  
  const batch = db.batch();
  
  testChannels.forEach(channel => {
    const ref = db.collection('telegramChannels').doc(channel.id);
    batch.set(ref, channel);
  });
  
  try {
    await batch.commit();
    console.log('✅ Test channels added successfully!');
    
    // Verify channels were added
    const snapshot = await db.collection('telegramChannels').get();
    console.log(`📱 Total channels in database: ${snapshot.size}`);
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${data.name} (@${data.username}) - Active: ${data.isActive}`);
    });
    
  } catch (error) {
    console.error('❌ Error adding channels:', error);
  }
  
  process.exit(0);
}

addTestChannels();