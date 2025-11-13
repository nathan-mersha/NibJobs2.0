import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch, Timestamp } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: "AIzaSyBvOkBH0Im0qiRhTKEO-GUK30OB28YpYjM",
  authDomain: "nibjobs-dev.firebaseapp.com", 
  projectId: "nibjobs-dev",
  storageBucket: "nibjobs-dev.firebasestorage.app",
  messagingSenderId: "8133180402",
  appId: "1:8133180402:web:c92b62af9df6bb5a85e8a3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Job categories data (simplified for Firestore compatibility)
const jobCategories = [
  {
    id: 'technology',
    name: 'Technology',
    description: 'Software development, IT support, system administration',
    icon: '💻',
    jobCount: 0,
    isActive: true,
    keywords: ['developer', 'programmer', 'software', 'IT', 'tech', 'coding'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'design',
    name: 'Design & Creative',
    description: 'UI/UX design, graphic design, creative roles',
    icon: '🎨',
    jobCount: 0,
    isActive: true,
    keywords: ['designer', 'ui', 'ux', 'graphic', 'creative', 'art'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'marketing',
    name: 'Marketing & Sales',
    description: 'Digital marketing, sales, advertising, content creation',
    icon: '📈',
    jobCount: 0,
    isActive: true,
    keywords: ['marketing', 'sales', 'advertising', 'seo', 'content'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'finance',
    name: 'Finance & Accounting',
    description: 'Financial analysis, accounting, banking, investment',
    icon: '💰',
    jobCount: 0,
    isActive: true,
    keywords: ['finance', 'accounting', 'banker', 'financial', 'analyst'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Medical professionals, healthcare workers, pharmacy',
    icon: '🏥',
    jobCount: 0,
    isActive: true,
    keywords: ['doctor', 'nurse', 'medical', 'healthcare', 'physician'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Teaching, training, educational administration',
    icon: '🎓',
    jobCount: 0,
    isActive: true,
    keywords: ['teacher', 'professor', 'educator', 'tutor', 'instructor'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'engineering',
    name: 'Engineering',
    description: 'Civil, mechanical, electrical, chemical engineering',
    icon: '⚙️',
    jobCount: 0,
    isActive: true,
    keywords: ['engineer', 'civil', 'mechanical', 'electrical', 'chemical'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'customer-service',
    name: 'Customer Service',
    description: 'Customer support, call center, client relations',
    icon: '📞',
    jobCount: 0,
    isActive: true,
    keywords: ['customer service', 'support', 'call center', 'help desk'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'retail',
    name: 'Retail & Hospitality',
    description: 'Sales associate, restaurant, hotel, tourism',
    icon: '🏪',
    jobCount: 0,
    isActive: true,
    keywords: ['retail', 'sales associate', 'cashier', 'restaurant', 'waiter'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'logistics',
    name: 'Logistics & Transportation',
    description: 'Supply chain, delivery, warehouse, shipping',
    icon: '🚚',
    jobCount: 0,
    isActive: true,
    keywords: ['logistics', 'supply chain', 'warehouse', 'delivery', 'driver'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

// Simplified sample jobs
const sampleJobs = [
  {
    title: 'Senior Frontend Developer',
    company: 'BeeTech Solutions',
    location: 'San Francisco, CA',
    type: 'Full-time',
    category: 'technology',
    salary: '$120,000 - $160,000',
    description: 'Join our buzzing team as a Senior Frontend Developer!',
    requirements: ['5+ years React experience', 'TypeScript proficiency'],
    remote: true,
    urgent: false,
    views: 245,
    applications: 12,
    isActive: true,
    companyLogo: '🐝',
    postedAt: Timestamp.now(),
    expiresAt: Timestamp.fromDate(new Date(Date.now() + 28 * 24 * 60 * 60 * 1000))
  },
  {
    title: 'UX Designer',
    company: 'Golden Hive Studios',
    location: 'Austin, TX',
    type: 'Full-time',
    category: 'design',
    salary: '$85,000 - $115,000',
    description: 'Create sweet user experiences that make our users buzz!',
    requirements: ['3+ years UX design', 'Figma expertise'],
    remote: false,
    urgent: true,
    views: 189,
    applications: 8,
    isActive: true,
    companyLogo: '🍯',
    postedAt: Timestamp.now(),
    expiresAt: Timestamp.fromDate(new Date(Date.now() + 25 * 24 * 60 * 60 * 1000))
  },
  {
    title: 'Digital Marketing Specialist',
    company: 'HoneyWork Corp',
    location: 'New York, NY',
    type: 'Full-time',
    category: 'marketing',
    salary: '$65,000 - $85,000',
    description: 'Help us spread the buzz about our amazing products!',
    requirements: ['2+ years digital marketing', 'SEO/SEM knowledge'],
    remote: true,
    urgent: false,
    views: 156,
    applications: 15,
    isActive: true,
    companyLogo: '🍯',
    postedAt: Timestamp.now(),
    expiresAt: Timestamp.fromDate(new Date(Date.now() + 27 * 24 * 60 * 60 * 1000))
  }
];

async function populateDatabase() {
  try {
    console.log('🐝 Starting to populate NibJobs Firestore database...');
    
    // Create job categories collection
    console.log('📋 Creating jobCategories collection...');
    
    for (const category of jobCategories) {
      const categoryRef = doc(db, 'jobCategories', category.id);
      await setDoc(categoryRef, category);
      console.log(`   ✅ Created category: ${category.icon} ${category.name}`);
    }
    
    console.log(`✅ Successfully created ${jobCategories.length} job categories`);
    
    // Create jobs collection
    console.log('💼 Creating jobs collection...');
    
    for (const job of sampleJobs) {
      const jobRef = doc(collection(db, 'jobs'));
      await setDoc(jobRef, {
        ...job,
        id: jobRef.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log(`   ✅ Created job: ${job.title} at ${job.company}`);
    }
    
    console.log(`✅ Successfully created ${sampleJobs.length} sample jobs`);
    
    // Create app metadata
    console.log('📊 Creating metadata...');
    const metadataRef = doc(db, 'metadata', 'app');
    await setDoc(metadataRef, {
      totalCategories: jobCategories.length,
      totalJobs: sampleJobs.length,
      lastUpdated: Timestamp.now(),
      version: '1.0.0'
    });
    
    console.log('🎉 Database population completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Categories created: ${jobCategories.length}`);
    console.log(`   - Sample jobs created: ${sampleJobs.length}`);
    console.log('   - Collections: jobCategories, jobs, metadata');
    console.log('');
    console.log('🔥 Your Firestore database is ready!');
    console.log('   Go to Firebase Console > Firestore Database to see your data');
    
  } catch (error) {
    console.error('❌ Error populating database:', error);
    throw error;
  }
}

// Run the population script
populateDatabase()
  .then(() => {
    console.log('🚀 All done! Check your Firestore console.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Population failed:', error);
    process.exit(1);
  });