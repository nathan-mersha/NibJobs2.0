const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'nibjobs-dev'
});

const db = admin.firestore();

async function addTestChannel() {
  console.log('🔧 Adding test Telegram channel to Firestore...');
  
  try {
    // Add the channel we found that works
    const channelData = {
      id: '1193582142',
      username: 'freelance_ethio',
      name: 'Afriwork (Freelance Ethiopia)', 
      category: 'jobs',
      isActive: true,
      scrapingEnabled: true,
      totalJobsScraped: 0,
      lastScraped: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Add to telegramChannels collection
    const docRef = await db.collection('telegramChannels').add(channelData);
    
    console.log('✅ Channel added successfully!');
    console.log('📋 Channel Details:');
    console.log(`   • Name: ${channelData.name}`);
    console.log(`   • Username: @${channelData.username}`);
    console.log(`   • Status: Active`);
    console.log(`   • Document ID: ${docRef.id}`);
    
    console.log('\n🎯 Now the scraping function will find this channel and process it!');
    
  } catch (error) {
    console.error('❌ Error adding channel:', error);
  }
  
  process.exit(0);
}

addTestChannel();