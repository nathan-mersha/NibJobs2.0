const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');

async function generateFreshSession() {
  console.log('🔄 Generating Fresh Telegram Session...');
  console.log('=====================================\n');
  
  const apiId = 4429232;
  const apiHash = 'c4be33331bc7ad43b034770bcf058952';

  console.log('🆕 Starting with empty session...');
  const session = new StringSession(''); // Empty session
  
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 3,
    timeout: 15000,
    useWSS: false, // Try without WSS
  });

  try {
    console.log('🔌 Connecting to Telegram...');
    
    await client.start({
      phoneNumber: async () => {
        const phone = await input.text('📱 Enter your phone number (with country code): ');
        console.log('📞 Using phone:', phone);
        return phone;
      },
      password: async () => {
        const pass = await input.text('🔒 Enter your 2FA password (press Enter if none): ');
        return pass || undefined;
      },
      phoneCode: async () => {
        const code = await input.text('📟 Enter verification code from Telegram: ');
        console.log('🔢 Using code:', code);
        return code;
      },
      onError: (err) => {
        console.error('❌ Auth error:', err.message);
      },
    });

    console.log('\n✅ Authentication successful!');
    
    const me = await client.getMe();
    console.log('👤 Logged in as:', me.firstName, me.lastName || '');
    
    const newSessionString = client.session.save();
    
    console.log('\n📝 NEW Session String:');
    console.log('='.repeat(60));
    console.log(newSessionString);
    console.log('='.repeat(60));
    
    console.log('\n💾 Update your .env file with:');
    console.log(`TELEGRAM_SESSION_STRING=${newSessionString}`);
    
    await client.disconnect();
    console.log('\n🔌 Disconnected successfully');
    
  } catch (error) {
    console.error('❌ Failed to generate session:', error.message);
    
    try {
      await client.disconnect();
    } catch (e) {
      // Ignore
    }
  }
}

generateFreshSession().then(() => {
  console.log('\n🏁 Session generation completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});