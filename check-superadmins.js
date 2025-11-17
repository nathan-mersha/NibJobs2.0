const admin = require('firebase-admin');

// Initialize Firebase Admin - using default credentials
admin.initializeApp();

const db = admin.firestore();

async function checkSuperadmins() {
  console.log('🔍 Checking for superadmin users...\n');
  
  try {
    const superadminsSnapshot = await db
      .collection('users')
      .where('role', '==', 'superadmin')
      .get();

    if (superadminsSnapshot.empty) {
      console.log('❌ NO SUPERADMIN USERS FOUND!');
      console.log('\nThis is why you\'re not receiving emails.');
      console.log('\n📋 To fix this:');
      console.log('1. Log into your app');
      console.log('2. Go to Admin Panel > Users');
      console.log('3. Change your role to "superadmin"');
      console.log('   OR run the fix script below:\n');
      
      // Show all users
      const allUsers = await db.collection('users').limit(10).get();
      console.log(`\n📊 Found ${allUsers.size} users in database:\n`);
      allUsers.docs.forEach(doc => {
        const user = doc.data();
        console.log(`  - ${user.email || 'No email'} (${user.role || 'No role'})`);
      });
      
      process.exit(1);
    }

    console.log(`✅ Found ${superadminsSnapshot.size} superadmin(s):\n`);
    
    superadminsSnapshot.docs.forEach((doc, index) => {
      const user = doc.data();
      console.log(`${index + 1}. ${user.email || 'No email'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Name: ${user.fullName || user.firstName || 'No name'}`);
      console.log(`   UID: ${doc.id}`);
      console.log('');
    });

    console.log('✅ Email notifications should be working!');
    console.log('\n🔍 If you\'re still not receiving emails, check:');
    console.log('1. Function logs: firebase functions:log');
    console.log('2. Gmail credentials are set: firebase functions:secrets:access GMAIL_USER');
    console.log('3. Your spam folder');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSuperadmins();
