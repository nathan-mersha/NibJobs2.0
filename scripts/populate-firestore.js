import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration - using your project config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Job categories data
const jobCategories = [
  {
    id: 'technology',
    name: 'Technology',
    description: 'Software development, IT support, system administration',
    icon: '💻',
    jobCount: 0,
    isActive: true,
    keywords: ['developer', 'programmer', 'software', 'IT', 'tech', 'coding', 'web', 'mobile', 'database', 'devops', 'frontend', 'backend', 'fullstack'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'design',
    name: 'Design & Creative',
    description: 'UI/UX design, graphic design, creative roles',
    icon: '🎨',
    jobCount: 0,
    isActive: true,
    keywords: ['designer', 'ui', 'ux', 'graphic', 'creative', 'art', 'visual', 'photoshop', 'figma', 'illustrator', 'branding'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'marketing',
    name: 'Marketing & Sales',
    description: 'Digital marketing, sales, advertising, content creation',
    icon: '📈',
    jobCount: 0,
    isActive: true,
    keywords: ['marketing', 'sales', 'advertising', 'seo', 'content', 'social media', 'campaign', 'promotion', 'lead generation', 'copywriting'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'finance',
    name: 'Finance & Accounting',
    description: 'Financial analysis, accounting, banking, investment',
    icon: '💰',
    jobCount: 0,
    isActive: true,
    keywords: ['finance', 'accounting', 'banker', 'financial', 'analyst', 'bookkeeper', 'audit', 'tax', 'investment', 'treasury'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Medical professionals, healthcare workers, pharmacy',
    icon: '🏥',
    jobCount: 0,
    isActive: true,
    keywords: ['doctor', 'nurse', 'medical', 'healthcare', 'physician', 'therapist', 'pharmacist', 'dentist', 'surgeon', 'clinical'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Teaching, training, educational administration',
    icon: '🎓',
    jobCount: 0,
    isActive: true,
    keywords: ['teacher', 'professor', 'educator', 'tutor', 'instructor', 'academic', 'school', 'university', 'training', 'curriculum'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'engineering',
    name: 'Engineering',
    description: 'Civil, mechanical, electrical, chemical engineering',
    icon: '⚙️',
    jobCount: 0,
    isActive: true,
    keywords: ['engineer', 'civil', 'mechanical', 'electrical', 'chemical', 'structural', 'project', 'construction', 'manufacturing', 'industrial'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'customer-service',
    name: 'Customer Service',
    description: 'Customer support, call center, client relations',
    icon: '📞',
    jobCount: 0,
    isActive: true,
    keywords: ['customer service', 'support', 'call center', 'help desk', 'client relations', 'customer care', 'representative', 'chat support'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'retail',
    name: 'Retail & Hospitality',
    description: 'Sales associate, restaurant, hotel, tourism',
    icon: '🏪',
    jobCount: 0,
    isActive: true,
    keywords: ['retail', 'sales associate', 'cashier', 'restaurant', 'waiter', 'hotel', 'hospitality', 'tourism', 'front desk', 'server'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'logistics',
    name: 'Logistics & Transportation',
    description: 'Supply chain, delivery, warehouse, shipping',
    icon: '🚚',
    jobCount: 0,
    isActive: true,
    keywords: ['logistics', 'supply chain', 'warehouse', 'delivery', 'driver', 'shipping', 'transportation', 'distribution', 'courier', 'freight'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample jobs data
const sampleJobs = [
  {
    title: 'Senior Frontend Developer',
    company: 'BeeTech Solutions',
    location: 'San Francisco, CA',
    type: 'Full-time',
    category: 'technology',
    salary: '$120,000 - $160,000',
    description: 'Join our buzzing team as a Senior Frontend Developer! We\'re looking for a talented developer to help build amazing user interfaces.',
    requirements: ['5+ years React experience', 'TypeScript proficiency', 'Modern CSS frameworks', 'Git workflow knowledge'],
    remote: true,
    urgent: false,
    views: 245,
    applications: 12,
    isActive: true,
    companyLogo: '🐝',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    expiresAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
    skills: ['React', 'TypeScript', 'CSS', 'JavaScript', 'HTML'],
    benefits: ['Health Insurance', 'Remote Work', '401k Match', 'Flexible Hours']
  },
  {
    title: 'UX Designer',
    company: 'Golden Hive Studios',
    location: 'Austin, TX',
    type: 'Full-time',
    category: 'design',
    salary: '$85,000 - $115,000',
    description: 'Create sweet user experiences that make our users buzz with excitement! We need a creative UX Designer to join our hive.',
    requirements: ['3+ years UX design', 'Figma expertise', 'User research experience', 'Portfolio required'],
    remote: false,
    urgent: true,
    views: 189,
    applications: 8,
    isActive: true,
    companyLogo: '🍯',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    skills: ['Figma', 'User Research', 'Prototyping', 'Wireframing', 'Design Systems'],
    benefits: ['Health Insurance', 'Design Budget', 'Conference Attendance', 'Flexible PTO']
  },
  {
    title: 'Digital Marketing Specialist',
    company: 'HoneyWork Corp',
    location: 'New York, NY',
    type: 'Full-time',
    category: 'marketing',
    salary: '$65,000 - $85,000',
    description: 'Help us spread the buzz about our amazing products! Looking for a digital marketing specialist to grow our online presence.',
    requirements: ['2+ years digital marketing', 'SEO/SEM knowledge', 'Social media expertise', 'Analytics experience'],
    remote: true,
    urgent: false,
    views: 156,
    applications: 15,
    isActive: true,
    companyLogo: '🍯',
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    expiresAt: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
    skills: ['SEO', 'Google Analytics', 'Social Media', 'Content Marketing', 'PPC'],
    benefits: ['Remote Work', 'Marketing Budget', 'Professional Development', 'Health Insurance']
  },
  {
    title: 'Financial Analyst',
    company: 'Buzzing Finance Ltd',
    location: 'Chicago, IL',
    type: 'Full-time',
    category: 'finance',
    salary: '$75,000 - $95,000',
    description: 'Analyze financial data and help our company make sweet investment decisions. Perfect for detail-oriented financial professionals.',
    requirements: ['Bachelor\'s in Finance', 'Excel expertise', '2+ years experience', 'Financial modeling skills'],
    remote: false,
    urgent: false,
    views: 134,
    applications: 6,
    isActive: true,
    companyLogo: '💰',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    expiresAt: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
    skills: ['Excel', 'Financial Modeling', 'SQL', 'Bloomberg Terminal', 'PowerBI'],
    benefits: ['Bonus Structure', 'Health Insurance', '401k Match', 'Professional Certifications']
  },
  {
    title: 'Registered Nurse',
    company: 'Healing Hive Hospital',
    location: 'Miami, FL',
    type: 'Full-time',
    category: 'healthcare',
    salary: '$70,000 - $90,000',
    description: 'Join our caring team of healthcare professionals. We\'re looking for a compassionate RN to provide excellent patient care.',
    requirements: ['RN License', 'BSN preferred', '1+ years experience', 'BLS certification'],
    remote: false,
    urgent: true,
    views: 203,
    applications: 18,
    isActive: true,
    companyLogo: '🏥',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
    skills: ['Patient Care', 'Medical Procedures', 'EMR Systems', 'Team Collaboration', 'Emergency Response'],
    benefits: ['Health Insurance', 'Shift Differentials', 'Continuing Education', 'Retirement Plan']
  }
];

async function populateDatabase() {
  try {
    console.log('🐝 Starting to populate NibJobs database...');
    
    // Create job categories
    console.log('📋 Creating job categories...');
    const batch = writeBatch(db);
    
    for (const category of jobCategories) {
      const categoryRef = doc(db, 'jobCategories', category.id);
      batch.set(categoryRef, category);
    }
    
    await batch.commit();
    console.log(`✅ Successfully created ${jobCategories.length} job categories`);
    
    // Create sample jobs
    console.log('💼 Creating sample jobs...');
    const jobsBatch = writeBatch(db);
    
    for (const job of sampleJobs) {
      const jobRef = doc(collection(db, 'jobs'));
      jobsBatch.set(jobRef, {
        ...job,
        id: jobRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    await jobsBatch.commit();
    console.log(`✅ Successfully created ${sampleJobs.length} sample jobs`);
    
    // Create app metadata
    const metadataRef = doc(db, 'metadata', 'app');
    await setDoc(metadataRef, {
      totalCategories: jobCategories.length,
      totalJobs: sampleJobs.length,
      lastUpdated: new Date(),
      version: '1.0.0'
    });
    
    console.log('🎉 Database population completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${jobCategories.length}`);
    console.log(`   - Jobs: ${sampleJobs.length}`);
    console.log('   - Collections: jobCategories, jobs, metadata');
    
  } catch (error) {
    console.error('❌ Error populating database:', error);
    throw error;
  }
}

// Run the population script
populateDatabase()
  .then(() => {
    console.log('🚀 All done! Your Firestore database is ready.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Population failed:', error);
    process.exit(1);
  });