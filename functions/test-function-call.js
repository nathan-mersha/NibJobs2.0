// Simple test using Firebase Web SDK
const { initializeApp } = require('firebase/app');
const { getFunctions, httpsCallable } = require('firebase/functions');

const firebaseConfig = {
  projectId: 'nibjobs-dev',
  // Add other config as needed
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

async function testFunction() {
  console.log('🧪 Testing runTelegramScrapingNow function...');
  
  try {
    const runScraping = httpsCallable(functions, 'runTelegramScrapingNow');
    const result = await runScraping();
    
    console.log('✅ Function executed successfully!');
    console.log('📊 Result:', result.data);
    
  } catch (error) {
    console.error('❌ Function failed:', error.message);
    console.error('📋 Error details:', error);
  }
}

testFunction();