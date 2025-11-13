// Simple Firebase Web SDK script to add test channels
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAfzp8OF2qfCdN6-m1E78T3HAPSkw0iz78",
  authDomain: "nibjobs-dev.firebaseapp.com",
  projectId: "nibjobs-dev",
  storageBucket: "nibjobs-dev.firebasestorage.app",
  messagingSenderId: "1064805804188",
  appId: "1:1064805804188:web:c3dd789204f6bc347b89de"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addTestChannels() {
  console.log('🔧 Adding test channels to Firestore...');
  
  try {
    // Add the working channel we found
    const channelData = {
      username: 'freelance_ethio',
      name: 'Afriwork (Freelance Ethiopia)', 
      category: 'jobs',
      isActive: true,
      scrapingEnabled: true,
      totalJobsScraped: 0,
      lastScraped: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'telegramChannels'), channelData);
    
    console.log('✅ Channel added successfully!');
    console.log('📋 Channel Details:');
    console.log(`   • Name: ${channelData.name}`);
    console.log(`   • Username: @${channelData.username}`);
    console.log(`   • Status: Active & Scraping Enabled`);
    console.log(`   • Document ID: ${docRef.id}`);
    
    console.log('\n🎯 Channel is ready for scraping!');
    console.log('🌐 Test the scraping via: http://localhost:19006');
    
  } catch (error) {
    console.error('❌ Error adding channel:', error);
  }
}

addTestChannels();