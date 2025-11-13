const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, limit } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBCT9OTlgpDy1lTnKX2a-rrKKDADOPJfQ",
  authDomain: "nibjobs-dev.firebaseapp.com",
  projectId: "nibjobs-dev",
  storageBucket: "nibjobs-dev.firebasestorage.app",
  messagingSenderId: "580893750183",
  appId: "1:580893750183:web:75e26c948e9e3cf35b8be3"
};

async function checkCategories() {
  console.log('🔍 Checking categories in database...');
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  try {
    // Get first 10 categories
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, limit(10));
    const querySnapshot = await getDocs(q);
    
    console.log(`📊 Found ${querySnapshot.size} categories (showing first 10):`);
    console.log('='.repeat(50));
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📂 ${data.name} (${doc.id})`);
      console.log(`   📄 ${data.description}`);
      console.log(`   ✅ Active: ${data.isActive}, Jobs: ${data.jobCount}`);
      console.log('');
    });
    
    // Get total count
    const allSnapshot = await getDocs(categoriesRef);
    console.log(`📈 Total categories in database: ${allSnapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCategories();