const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');

// Your Telegram API credentials
const apiId = 30179473;
const apiHash = 'fbe73ecfca5b76efb02a8418a10d0140';

async function generateSession() {
  console.log('🔐 Generating Telegram Session String...');
  console.log('📱 Using API ID:', apiId);
  console.log('🔑 Using API Hash:', apiHash);
  
  // Start with completely empty session for new API credentials
  const session = new StringSession(''); 
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  });

  try {
    await client.start({
      phoneNumber: async () => await input.text('📱 Enter your phone number (with country code, e.g., +251912345678): '),
      password: async () => await input.text('🔒 Enter your 2FA password (if enabled): '),
      phoneCode: async () => await input.text('📟 Enter the verification code sent to your phone: '),
      onError: (err) => console.error('❌ Authentication error:', err),
    });

    const sessionString = client.session.save();
    
    console.log('\n✅ Authentication successful!');
    console.log('\n📝 Your session string:');
    console.log('='.repeat(50));
    console.log(sessionString);
    console.log('='.repeat(50));
    console.log('\n💡 Copy this session string and add it to your Firebase config as:');
    console.log('TELEGRAM_SESSION_STRING=' + sessionString);
    
    await client.disconnect();
    
    return sessionString;
  } catch (error) {
    console.error('❌ Failed to generate session:', error);
    await client.disconnect();
    throw error;
  }
}

// Run the generator
generateSession().catch(console.error);