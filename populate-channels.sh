#!/bin/bash

# Populate sample Telegram channels
echo "🤖 Populating sample Telegram channels..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Create the Node.js script to populate channels
cat > populate-telegram-channels.js << 'EOF'
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
EOF

# Check if service account key exists
if [ ! -f "firebase/service-account-key.json" ]; then
    echo "⚠️  Service account key not found at firebase/service-account-key.json"
    echo "📖 Please download it from Firebase Console > Project Settings > Service Accounts"
    echo "   and save it as firebase/service-account-key.json"
    exit 1
fi

# Install firebase-admin if not already installed
if [ ! -d "node_modules/firebase-admin" ]; then
    echo "📦 Installing firebase-admin..."
    npm install firebase-admin
fi

# Run the population script
echo "🔄 Running channel population script..."
node populate-telegram-channels.js

# Clean up
rm populate-telegram-channels.js

echo ""
echo "🎯 Next steps:"
echo "1. 📱 Open your admin panel: http://localhost:19006"
echo "2. 🔑 Login with your superadmin account"
echo "3. 📋 Navigate to 'Telegram Channels' in the sidebar"
echo "4. 🤖 Get a Telegram bot token using ./setup-telegram.sh"
echo "5. ⚡ Test manual scraping once bot is configured"