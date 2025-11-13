const https = require('https');

const functionUrl = 'https://us-central1-nibjobs-dev.cloudfunctions.net/runTelegramScrapingNow';

console.log('🚀 Testing enhanced Telegram scraping function...');
console.log('📞 Calling:', functionUrl);

const postData = JSON.stringify({
  data: {}
});

const options = {
  hostname: 'us-central1-nibjobs-dev.cloudfunctions.net',
  port: 443,
  path: '/runTelegramScrapingNow',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log(`📡 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response:');
    try {
      const result = JSON.parse(data);
      console.log(JSON.stringify(result, null, 2));
      
      if (result.result) {
        console.log('✅ Enhanced scraping test completed!');
        console.log(`📊 Results: ${result.result.totalJobsExtracted} jobs extracted from ${result.result.channelsProcessed} channels`);
        if (result.result.errors && result.result.errors.length > 0) {
          console.log('⚠️ Errors encountered:', result.result.errors);
        }
      }
    } catch (error) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error);
});

req.write(postData);
req.end();