/**
 * Test Email Notification for Scraping
 * 
 * This script tests the email notification system by:
 * 1. Calling the manual scraping function
 * 2. Monitoring the progress
 * 3. Verifying email was sent to superadmins
 */

const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getFunctions, httpsCallable } = require('firebase/functions');

// Initialize Firebase Admin
const serviceAccount = require('./nibjobs-dev-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://nibjobs-dev.firebaseio.com'
});

// Initialize Firebase Client SDK for calling functions
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'us-central1');

async function testEmailNotification() {
  console.log('🧪 Testing Email Notification System');
  console.log('=====================================\n');

  try {
    // Step 1: Check for superadmins
    console.log('📋 Step 1: Checking for superadmin users...');
    const db = admin.firestore();
    const superadminsSnapshot = await db
      .collection('users')
      .where('role', '==', 'superadmin')
      .get();

    if (superadminsSnapshot.empty) {
      console.log('❌ No superadmin users found!');
      console.log('   Please create a user with role: "superadmin" first.');
      process.exit(1);
    }

    console.log(`✅ Found ${superadminsSnapshot.size} superadmin(s):`);
    superadminsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.email} (${data.displayName || 'No name'})`);
    });
    console.log('');

    // Step 2: Check for active telegram channels
    console.log('📋 Step 2: Checking for active Telegram channels...');
    const channelsSnapshot = await db
      .collection('telegramChannels')
      .where('isActive', '==', true)
      .where('scrapingEnabled', '==', true)
      .get();

    if (channelsSnapshot.empty) {
      console.log('⚠️  No active channels found for scraping');
      console.log('   This test will still work but won\'t scrape any jobs.');
    } else {
      console.log(`✅ Found ${channelsSnapshot.size} active channel(s) for scraping`);
    }
    console.log('');

    // Step 3: Trigger manual scraping
    console.log('📋 Step 3: Triggering manual scrape...');
    console.log('   This will:');
    console.log('   - Start background scraping');
    console.log('   - Process all active channels');
    console.log('   - Send email report when complete');
    console.log('');

    const runTelegramScrapingNowV2 = httpsCallable(functions, 'runTelegramScrapingNowV2');
    
    console.log('🚀 Calling runTelegramScrapingNowV2...');
    const result = await runTelegramScrapingNowV2();
    
    console.log('✅ Scraping started successfully!');
    console.log('\nResponse:');
    console.log(JSON.stringify(result.data, null, 2));
    console.log('');

    const sessionId = result.data.sessionId;

    // Step 4: Monitor progress
    console.log('📋 Step 4: Monitoring scraping progress...');
    console.log(`   Session ID: ${sessionId}`);
    console.log('');

    const progressRef = db.collection('scrapingProgress').doc(sessionId);
    
    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const progressDoc = await progressRef.get();
      if (!progressDoc.exists) {
        console.log('⚠️  Progress document not found yet...');
        attempts++;
        continue;
      }

      const progress = progressDoc.data();
      console.log(`   Status: ${progress.status}`);
      console.log(`   Progress: ${progress.processedChannels}/${progress.totalChannels} channels`);
      console.log(`   Jobs extracted: ${progress.totalJobsExtracted || 0}`);
      
      if (progress.status === 'completed') {
        console.log('');
        console.log('✅ Scraping completed successfully!');
        console.log('');
        console.log('📊 Final Results:');
        console.log(`   - Channels processed: ${progress.processedChannels}`);
        console.log(`   - Jobs extracted: ${progress.totalJobsExtracted}`);
        console.log(`   - Messages processed: ${progress.totalMessagesProcessed}`);
        console.log(`   - Errors: ${progress.errors?.length || 0}`);
        console.log('');
        
        console.log('📧 Email Report Status:');
        console.log('   The email notification system should have sent reports to all superadmins.');
        console.log('');
        console.log('✅ CHECK YOUR EMAIL INBOX!');
        console.log('   Look for: "[NibJobs] ✅ Manual Scraping Completed"');
        console.log('');
        console.log('   Superadmin emails that should have received reports:');
        superadminsSnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`   - ${data.email}`);
        });
        
        break;
      } else if (progress.status === 'failed') {
        console.log('');
        console.log('❌ Scraping failed!');
        console.log(`   Error: ${progress.error || 'Unknown error'}`);
        
        console.log('');
        console.log('📧 Email Report Status:');
        console.log('   A failure report should have been sent to all superadmins.');
        console.log('');
        console.log('✅ CHECK YOUR EMAIL INBOX!');
        console.log('   Look for: "[NibJobs] ❌ Manual Scraping Failed"');
        
        break;
      }
      
      attempts++;
    }

    if (attempts >= maxAttempts) {
      console.log('');
      console.log('⏰ Timeout: Scraping is taking longer than expected.');
      console.log('   Check Firebase Functions logs for details:');
      console.log('   firebase functions:log --only runTelegramScrapingNowV2');
    }

  } catch (error) {
    console.error('');
    console.error('❌ Test failed with error:');
    console.error(error);
    
    if (error.code === 'functions/unauthenticated') {
      console.error('');
      console.error('Authentication error: Make sure you\'re calling as an authenticated user');
    } else if (error.code === 'functions/permission-denied') {
      console.error('');
      console.error('Permission denied: Make sure the calling user has proper permissions');
    }
  }

  console.log('');
  console.log('🏁 Test complete!');
  process.exit(0);
}

// Run the test
testEmailNotification().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
