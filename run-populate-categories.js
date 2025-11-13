const { initializeApp } = require('firebase/app');
const { getFunctions, httpsCallable } = require('firebase/functions');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBCT9OTlgpDy1lTnKX2a-rrKKDADOPJfQ",
  authDomain: "nibjobs-dev.firebaseapp.com",
  projectId: "nibjobs-dev",
  storageBucket: "nibjobs-dev.firebasestorage.app",
  messagingSenderId: "580893750183",
  appId: "1:580893750183:web:75e26c948e9e3cf35b8be3"
};

async function populateHierarchicalCategories() {
  console.log('🏗️ Initializing Firebase...');
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const functions = getFunctions(app);
  
  console.log('🏗️ Calling populateJobCategories function (hierarchical structure)...');
  
  try {
    const populateJobCategories = httpsCallable(functions, 'populateJobCategories');
    const result = await populateJobCategories();
    
    console.log('✅ Success!', result.data);
    console.log(`📊 Created: ${result.data.created}`);
    console.log(`📊 Updated: ${result.data.updated}`);
    console.log(`📊 Total Categories: ${result.data.totalCategories}`);
    console.log(`🏗️ Structure: ${result.data.structure}`);
    
    console.log('\n🎯 Structure Created:');
    console.log('└── Main Categories (Level 0)');
    console.log('    ├── Technology & IT');
    console.log('    │   ├── Software Development');
    console.log('    │   ├── Data Science & Analytics');
    console.log('    │   ├── Cybersecurity');
    console.log('    │   └── ... (more subcategories)');
    console.log('    ├── Marketing & Sales');
    console.log('    │   ├── Digital Marketing');
    console.log('    │   ├── Content Marketing');
    console.log('    │   └── ... (more subcategories)');
    console.log('    └── ... (more main categories)');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error details:', error.message);
  }
}

populateHierarchicalCategories();