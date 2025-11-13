#!/bin/bash

echo "🤖 NibJobs Telegram Scraper Setup"
echo "================================="
echo ""

# Check if .env file exists in functions directory
FUNCTIONS_DIR="/home/nathan/Documents/Workspace/NibJobs 2.0/functions"
ENV_FILE="$FUNCTIONS_DIR/.env"

echo "📁 Checking functions directory..."
if [ ! -d "$FUNCTIONS_DIR" ]; then
    echo "❌ Functions directory not found!"
    exit 1
fi

echo "📝 Setting up environment variables..."

# Prompt for Telegram Bot Token
echo ""
echo "🔑 Please enter your Telegram Bot Token:"
echo "   (Get this from @BotFather on Telegram)"
echo "   Format: 123456789:ABCDEF1234567890abcdef1234567890ABC"
echo ""
read -p "Bot Token: " BOT_TOKEN

if [ -z "$BOT_TOKEN" ]; then
    echo "❌ Bot token cannot be empty!"
    exit 1
fi

# Validate token format (basic check)
if [[ ! $BOT_TOKEN =~ ^[0-9]+:[A-Za-z0-9_-]+$ ]]; then
    echo "⚠️  Warning: Token format looks incorrect. Proceeding anyway..."
fi

# Create or update .env file
echo "💾 Creating environment configuration..."
cat > "$ENV_FILE" << EOF
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=$BOT_TOKEN

# Firebase Configuration
FIREBASE_PROJECT_ID=nibjobs-dev
FIREBASE_REGION=us-central1

# Scraping Configuration
SCRAPING_ENABLED=true
SCRAPING_INTERVAL_MINUTES=60
MAX_MESSAGES_PER_CHANNEL=50

# Job Processing
AUTO_APPROVE_JOBS=false
MINIMUM_JOB_SCORE=0.7
EOF

echo "✅ Environment file created: $ENV_FILE"
echo ""

# Create channels configuration
echo "📋 Setting up default job channels..."
CHANNELS_FILE="$FUNCTIONS_DIR/src/telegram-channels.json"

cat > "$CHANNELS_FILE" << 'EOF'
{
  "jobChannels": [
    {
      "username": "jobsearchae",
      "name": "Jobs in UAE",
      "category": "general",
      "country": "UAE",
      "description": "General job postings in United Arab Emirates",
      "priority": "high",
      "enabled": true
    },
    {
      "username": "jobsindubai", 
      "name": "Jobs in Dubai",
      "category": "general",
      "country": "UAE",
      "description": "Job opportunities in Dubai",
      "priority": "high",
      "enabled": true
    },
    {
      "username": "techjobsworld",
      "name": "Tech Jobs Worldwide",
      "category": "technology",
      "country": "global",
      "description": "Technology and IT job postings worldwide",
      "priority": "high",
      "enabled": true
    },
    {
      "username": "remotejobsboard",
      "name": "Remote Jobs Board",
      "category": "remote",
      "country": "global", 
      "description": "Remote work opportunities",
      "priority": "medium",
      "enabled": true
    },
    {
      "username": "jobsincanada",
      "name": "Jobs in Canada",
      "category": "general",
      "country": "Canada",
      "description": "Job postings in Canada",
      "priority": "medium",
      "enabled": true
    },
    {
      "username": "jobsinus",
      "name": "Jobs in USA",
      "category": "general",
      "country": "USA",
      "description": "Job opportunities in United States",
      "priority": "medium",
      "enabled": true
    },
    {
      "username": "marketingjobs_hub",
      "name": "Marketing Jobs Hub",
      "category": "marketing",
      "country": "global",
      "description": "Marketing and advertising job postings",
      "priority": "low",
      "enabled": true
    },
    {
      "username": "designjobs_io",
      "name": "Design Jobs",
      "category": "design",
      "country": "global",
      "description": "Design and creative job opportunities",
      "priority": "low",
      "enabled": true
    },
    {
      "username": "developerjobs_hub",
      "name": "Developer Jobs Hub",
      "category": "technology",
      "country": "global",
      "description": "Software development job postings",
      "priority": "high",
      "enabled": true
    },
    {
      "username": "financejobs_world",
      "name": "Finance Jobs World",
      "category": "finance",
      "country": "global",
      "description": "Finance and accounting job opportunities",
      "priority": "medium",
      "enabled": true
    }
  ]
}
EOF

echo "✅ Channels configuration created: $CHANNELS_FILE"
echo ""

# Create test script
echo "🧪 Creating test script..."
TEST_SCRIPT="$FUNCTIONS_DIR/test-telegram.js"

cat > "$TEST_SCRIPT" << 'EOF'
const axios = require('axios');
require('dotenv').config();

async function testTelegramBot() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
        console.error('❌ TELEGRAM_BOT_TOKEN not found in .env file');
        return;
    }
    
    console.log('🤖 Testing Telegram Bot connection...');
    console.log('Token:', botToken.substring(0, 10) + '...');
    
    try {
        // Test bot info
        const response = await axios.get(`https://api.telegram.org/bot${botToken}/getMe`);
        
        if (response.data.ok) {
            const bot = response.data.result;
            console.log('✅ Bot connected successfully!');
            console.log(`   Bot Name: ${bot.first_name}`);
            console.log(`   Username: @${bot.username}`);
            console.log(`   ID: ${bot.id}`);
        } else {
            console.error('❌ Bot connection failed:', response.data.description);
        }
    } catch (error) {
        console.error('❌ Error testing bot:', error.message);
        console.log('');
        console.log('🔧 Troubleshooting:');
        console.log('   1. Check your bot token from @BotFather');
        console.log('   2. Make sure the token is correctly set in .env file');
        console.log('   3. Verify internet connection');
    }
}

testTelegramBot();
EOF

echo "✅ Test script created: $TEST_SCRIPT"
echo ""

# Display next steps
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. 🧪 Test your bot connection:"
echo "   cd '$FUNCTIONS_DIR'"
echo "   node test-telegram.js"
echo ""
echo "2. 🚀 Deploy the scraping functions:"
echo "   cd '/home/nathan/Documents/Workspace/NibJobs 2.0'"
echo "   firebase deploy --only functions"
echo ""
echo "3. 📱 Configure channels in your admin panel:"
echo "   - Login to http://localhost:19006"
echo "   - Go to Admin Panel > Settings"
echo "   - Manage Telegram channels"
echo ""
echo "4. 🔄 Test manual scraping:"
echo "   - Use the admin panel to trigger manual scraping"
echo "   - Check Firebase Console for scraped jobs"
echo ""
echo "📁 Files created:"
echo "   - $ENV_FILE"
echo "   - $CHANNELS_FILE" 
echo "   - $TEST_SCRIPT"
echo ""
echo "⚠️  Important Notes:"
echo "   - Keep your bot token secure and private"
echo "   - Some channels may require joining first"
echo "   - Respect rate limits to avoid being blocked"
echo "   - Review scraped jobs before publishing"
echo ""

# Make the script executable
chmod +x "$0"

echo "✅ Setup script completed successfully!"