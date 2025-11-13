#!/bin/bash

echo "🤖 Adding sample Telegram channels to Firestore..."

# Create a temporary JavaScript file to populate channels using Firebase CLI
cat > temp-add-channels.js << 'EOF'
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

const sampleChannels = [
  {
    username: 'jobsindubai',
    name: 'Jobs in Dubai',
    imageUrl: '',
    category: 'general',
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
    imageUrl: '',
    category: 'general',
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
    imageUrl: '', 
    category: 'technology',
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
    imageUrl: '',
    category: 'remote',
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
    imageUrl: '',
    category: 'marketing',
    isActive: true,
    scrapingEnabled: true,
    totalJobsScraped: 0,
    lastScraped: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function addChannels() {
  console.log('🚀 Adding sample channels...');
  
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
      console.log(`✅ Added channel @${channel.username} (${channel.name})`);
    }

    console.log('🎉 Sample channels added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding channels:', error);
    process.exit(1);
  }
}

addChannels();
EOF

# Run the script in the functions directory where firebase-admin is available
echo "📦 Installing firebase-admin if needed..."
cd functions
if [ ! -d "node_modules/firebase-admin" ]; then
    npm install firebase-admin --save
fi

echo "🔄 Running channel population script..."
node ../temp-add-channels.js

# Clean up
cd ..
rm temp-add-channels.js

echo ""
echo "🎯 Next steps:"
echo "1. 📱 Open your admin panel: http://localhost:19006"
echo "2. 🔑 Login with: nathanmersha@gmail.com"
echo "3. 📋 Navigate to 'Telegram Channels' in the sidebar"
echo "4. ⚡ Test the manual scraping feature"
echo "5. 🔍 Monitor the Firebase Functions logs for scraping activity"