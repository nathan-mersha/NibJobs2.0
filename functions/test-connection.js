const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
require('dotenv').config();

async function testConnection() {
  console.log('🧪 Simple Telegram Connection Test');
  console.log('==================================\n');
  
  const apiId = parseInt(process.env.TELEGRAM_API_ID);
  const apiHash = process.env.TELEGRAM_API_HASH;
  const sessionString = process.env.TELEGRAM_SESSION_STRING;

  console.log('📋 Credentials Check:');
  console.log('   API ID:', apiId ? '✅ Set' : '❌ Missing');
  console.log('   API Hash:', apiHash ? `✅ Set (${apiHash.length} chars)` : '❌ Missing');
  console.log('   Session:', sessionString ? `✅ Set (${sessionString.length} chars)` : '❌ Missing');

  if (!apiId || !apiHash || !sessionString) {
    console.error('❌ Missing required credentials');
    return;
  }

  console.log('\n🔌 Creating Telegram client...');
  
  const session = new StringSession(sessionString);
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 3,
    retryDelay: 1000,
    timeout: 10000,
  });

  try {
    console.log('🚀 Attempting connection...');
    console.log('⏳ Please wait (this can take 30-60 seconds)...');
    
    const startTime = Date.now();
    
    await client.connect();
    console.log(`✅ Connected! (${Date.now() - startTime}ms)`);
    
    console.log('🔐 Testing authentication...');
    const me = await client.getMe();
    console.log('👤 Success! Logged in as:', me.firstName, me.lastName || '');
    console.log('📱 Phone:', me.phone || 'N/A');
    console.log('🆔 User ID:', me.id.toString());
    
    console.log('\n🔍 Testing basic functionality...');
    const dialogs = await client.getDialogs({ limit: 5 });
    console.log(`📊 Can access ${dialogs.length} recent chats`);
    
    await client.disconnect();
    console.log('🔌 Disconnected successfully');
    
    console.log('\n🎉 CONNECTION TEST PASSED! ✅');
    
  } catch (error) {
    console.error('\n❌ CONNECTION FAILED:', error.message);
    console.error('📋 Error details:', error);
    
    if (error.message.includes('TIMEOUT')) {
      console.log('\n💡 Timeout suggestions:');
      console.log('   • Check your internet connection');
      console.log('   • Try running from a different network');
      console.log('   • Telegram servers might be slow');
    }
    
    if (error.message.includes('AUTH')) {
      console.log('\n💡 Authentication suggestions:');
      console.log('   • Session string might be expired');
      console.log('   • Try regenerating with generate-session.js');
      console.log('   • Check if 2FA settings changed');
    }
    
    try {
      await client.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect errors
    }
  }
}

testConnection().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});