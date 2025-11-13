const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
require('dotenv').config();

async function findJobChannels() {
  console.log('🔍 Searching for Ethiopian Job Channels');
  console.log('=====================================\n');
  
  const apiId = parseInt(process.env.TELEGRAM_API_ID);
  const apiHash = process.env.TELEGRAM_API_HASH;
  const sessionString = process.env.TELEGRAM_SESSION_STRING;

  const session = new StringSession(sessionString);
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  });

  try {
    console.log('🔌 Connecting to Telegram...');
    await client.start();
    console.log('✅ Connected successfully!');
    
    // Search terms for Ethiopian job channels
    const searchTerms = [
      'ethiopia jobs',
      'ethiopian jobs', 
      'addis ababa jobs',
      'job vacancy ethiopia',
      'ethiopia vacancy'
    ];
    
    const foundChannels = [];
    
    for (const term of searchTerms) {
      console.log(`\n🔍 Searching for: "${term}"`);
      
      try {
        // Search for channels using the global search
        const result = await client.invoke({
          _: 'contacts.search',
          q: term,
          limit: 10
        });
        
        if (result.chats && result.chats.length > 0) {
          console.log(`   Found ${result.chats.length} results:`);
          
          result.chats.forEach(chat => {
            if (chat.className === 'Channel' && !chat.megagroup) {
              const channelInfo = {
                id: chat.id.toString(),
                username: chat.username,
                title: chat.title,
                participantsCount: chat.participantsCount
              };
              
              console.log(`   📺 Channel: ${chat.title}`);
              console.log(`      Username: @${chat.username || 'N/A'}`);
              console.log(`      Members: ${chat.participantsCount || 'N/A'}`);
              
              if (chat.username) {
                foundChannels.push(channelInfo);
              }
            }
          });
        } else {
          console.log(`   No results for "${term}"`);
        }
        
      } catch (searchError) {
        console.log(`   ❌ Search failed: ${searchError.message}`);
      }
    }
    
    // Also check user's joined channels
    console.log('\n📋 Checking your joined channels...');
    const dialogs = await client.getDialogs({ limit: 50 });
    
    const jobRelatedChannels = dialogs.filter(dialog => {
      const entity = dialog.entity;
      if (entity.className === 'Channel' && !entity.megagroup) {
        const title = entity.title.toLowerCase();
        return title.includes('job') || title.includes('vacancy') || title.includes('career') || title.includes('ethiopia');
      }
      return false;
    });
    
    console.log(`   Found ${jobRelatedChannels.length} job-related channels you're subscribed to:`);
    
    jobRelatedChannels.forEach(dialog => {
      const entity = dialog.entity;
      console.log(`   📺 ${entity.title}`);
      console.log(`      Username: @${entity.username || 'N/A'}`);
      console.log(`      ID: ${entity.id}`);
      
      if (entity.username) {
        foundChannels.push({
          id: entity.id.toString(),
          username: entity.username,
          title: entity.title,
          participantsCount: entity.participantsCount
        });
      }
    });
    
    console.log('\n📊 SUMMARY - Found Channels with Usernames:');
    console.log('='.repeat(60));
    
    const uniqueChannels = foundChannels.filter((channel, index, self) => 
      index === self.findIndex(c => c.username === channel.username)
    );
    
    if (uniqueChannels.length > 0) {
      uniqueChannels.forEach((channel, index) => {
        console.log(`${index + 1}. ${channel.title}`);
        console.log(`   Username: @${channel.username}`);
        console.log(`   Members: ${channel.participantsCount || 'N/A'}`);
        console.log('   ' + '-'.repeat(40));
      });
      
      console.log('\n💾 Copy these for testing:');
      console.log('const realChannels = [');
      uniqueChannels.slice(0, 3).forEach(channel => {
        console.log(`  {`);
        console.log(`    id: '${channel.id}',`);
        console.log(`    username: '${channel.username}',`);
        console.log(`    name: '${channel.title}',`);
        console.log(`    isActive: true`);
        console.log(`  },`);
      });
      console.log('];');
    } else {
      console.log('❌ No channels with usernames found');
    }
    
    await client.disconnect();
    console.log('\n🔌 Disconnected');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    try {
      await client.disconnect();
    } catch (e) {}
  }
}

findJobChannels().then(() => {
  console.log('\n🏁 Channel search completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Error:', error);
  process.exit(1);
});