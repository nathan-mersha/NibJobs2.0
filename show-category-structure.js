const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBCT9OTlgpDy1lTnKX2a-rrKKDADOPJfQ",
  authDomain: "nibjobs-dev.firebaseapp.com",
  projectId: "nibjobs-dev",
  storageBucket: "nibjobs-dev.firebasestorage.app",
  messagingSenderId: "580893750183",
  appId: "1:580893750183:web:75e26c948e9e3cf35b8be3"
};

async function showCategoryStructure() {
  console.log('🔍 Checking hierarchical category structure...');
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  try {
    // Get all categories without complex ordering (to avoid index requirement)
    const categoriesRef = collection(db, 'categories');
    const querySnapshot = await getDocs(categoriesRef);
    
    console.log(`\n📊 Found ${querySnapshot.size} total categories\n`);
    
    const mainCategories = [];
    const subcategories = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.level === 0) {
        mainCategories.push(data);
      } else {
        subcategories.push(data);
      }
    });
    
    console.log('🏗️ HIERARCHICAL CATEGORY STRUCTURE:');
    console.log('='.repeat(60));
    
    // Display structure
    for (const mainCat of mainCategories) {
      console.log(`\n${mainCat.icon} ${mainCat.name} (${mainCat.id})`);
      console.log(`   📄 ${mainCat.description}`);
      console.log(`   📍 Path: ${mainCat.path}`);
      console.log(`   🏷️  Tags: ${mainCat.tags.join(', ')}`);
      console.log(`   📊 Jobs: ${mainCat.jobCount}`);
      
      // Find subcategories for this main category
      const relatedSubs = subcategories.filter(sub => sub.parentPath === mainCat.path);
      
      for (const sub of relatedSubs) {
        console.log(`   │`);
        console.log(`   ├── ${sub.name} (${sub.id})`);
        console.log(`   │   📄 ${sub.description}`);
        console.log(`   │   📍 Path: ${sub.path}`);
        console.log(`   │   📍 Full: ${sub.fullPath}`);
        console.log(`   │   🏷️  Tags: ${sub.tags.join(', ')}`);
        console.log(`   │   📊 Jobs: ${sub.jobCount}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📈 Summary:`);
    console.log(`   Main Categories: ${mainCategories.length}`);
    console.log(`   Subcategories: ${subcategories.length}`);
    console.log(`   Total: ${mainCategories.length + subcategories.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

showCategoryStructure();