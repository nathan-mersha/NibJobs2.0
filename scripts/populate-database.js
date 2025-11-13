const admin = require('firebase-admin');

// Initialize Firebase Admin (using default credentials)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'nibjobs-dev'
  });
}

const db = admin.firestore();

// Common job categories
const jobCategories = [
  {
    id: 'technology',
    name: 'Technology',
    description: 'Software development, IT support, system administration',
    icon: '💻',
    keywords: ['developer', 'programmer', 'software', 'IT', 'tech', 'coding', 'web', 'mobile', 'database', 'devops', 'frontend', 'backend', 'fullstack']
  },
  {
    id: 'design',
    name: 'Design & Creative',
    description: 'UI/UX design, graphic design, creative roles',
    icon: '🎨',
    keywords: ['designer', 'ui', 'ux', 'graphic', 'creative', 'art', 'visual', 'photoshop', 'figma', 'illustrator', 'branding']
  },
  {
    id: 'marketing',
    name: 'Marketing & Sales',
    description: 'Digital marketing, sales, advertising, content creation',
    icon: '📈',
    keywords: ['marketing', 'sales', 'advertising', 'seo', 'content', 'social media', 'campaign', 'promotion', 'lead generation', 'copywriting']
  },
  {
    id: 'finance',
    name: 'Finance & Accounting',
    description: 'Financial analysis, accounting, banking, investment',
    icon: '💰',
    keywords: ['finance', 'accounting', 'banker', 'financial', 'analyst', 'bookkeeper', 'audit', 'tax', 'investment', 'treasury']
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Medical professionals, healthcare workers, pharmacy',
    icon: '🏥',
    keywords: ['doctor', 'nurse', 'medical', 'healthcare', 'physician', 'therapist', 'pharmacist', 'dentist', 'surgeon', 'clinical']
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Teaching, training, educational administration',
    icon: '🎓',
    keywords: ['teacher', 'professor', 'educator', 'tutor', 'instructor', 'academic', 'school', 'university', 'training', 'curriculum']
  },
  {
    id: 'engineering',
    name: 'Engineering',
    description: 'Mechanical, electrical, civil, chemical engineering',
    icon: '⚙️',
    keywords: ['engineer', 'mechanical', 'electrical', 'civil', 'chemical', 'structural', 'automotive', 'aerospace', 'industrial', 'manufacturing']
  },
  {
    id: 'customer-service',
    name: 'Customer Service',
    description: 'Customer support, call center, client relations',
    icon: '📞',
    keywords: ['customer service', 'support', 'call center', 'help desk', 'client relations', 'representative', 'agent', 'assistant']
  },
  {
    id: 'human-resources',
    name: 'Human Resources',
    description: 'HR management, recruitment, talent acquisition',
    icon: '👥',
    keywords: ['hr', 'human resources', 'recruiter', 'talent', 'hiring', 'personnel', 'benefits', 'payroll', 'recruitment', 'staffing']
  },
  {
    id: 'operations',
    name: 'Operations & Management',
    description: 'Project management, operations, business analysis',
    icon: '📊',
    keywords: ['operations', 'manager', 'project manager', 'business analyst', 'coordinator', 'supervisor', 'director', 'executive', 'administration']
  },
  {
    id: 'retail',
    name: 'Retail & Sales',
    description: 'Retail sales, merchandising, store management',
    icon: '🛒',
    keywords: ['retail', 'sales associate', 'cashier', 'store', 'merchandising', 'inventory', 'customer', 'shop', 'commerce', 'vendor']
  },
  {
    id: 'hospitality',
    name: 'Hospitality & Tourism',
    description: 'Hotels, restaurants, travel, event management',
    icon: '🏨',
    keywords: ['hospitality', 'hotel', 'restaurant', 'chef', 'waiter', 'tourism', 'travel', 'event', 'catering', 'concierge']
  },
  {
    id: 'construction',
    name: 'Construction & Trades',
    description: 'Construction, electrical, plumbing, carpentry',
    icon: '🔨',
    keywords: ['construction', 'electrician', 'plumber', 'carpenter', 'contractor', 'builder', 'maintenance', 'repair', 'trades', 'technician']
  },
  {
    id: 'transportation',
    name: 'Transportation & Logistics',
    description: 'Shipping, delivery, logistics, supply chain',
    icon: '🚚',
    keywords: ['driver', 'delivery', 'logistics', 'shipping', 'transportation', 'supply chain', 'warehouse', 'distribution', 'courier', 'freight']
  },
  {
    id: 'media',
    name: 'Media & Communications',
    description: 'Journalism, broadcasting, public relations',
    icon: '📺',
    keywords: ['journalist', 'reporter', 'media', 'communications', 'pr', 'public relations', 'broadcasting', 'writer', 'editor', 'producer']
  },
  {
    id: 'legal',
    name: 'Legal',
    description: 'Lawyers, legal assistants, compliance',
    icon: '⚖️',
    keywords: ['lawyer', 'attorney', 'legal', 'paralegal', 'compliance', 'counsel', 'litigation', 'contracts', 'law', 'juridical']
  },
  {
    id: 'consulting',
    name: 'Consulting',
    description: 'Business consulting, advisory services',
    icon: '💼',
    keywords: ['consultant', 'advisor', 'consulting', 'strategy', 'advisory', 'specialist', 'expert', 'freelance', 'independent']
  },
  {
    id: 'research',
    name: 'Research & Development',
    description: 'Research, data analysis, scientific roles',
    icon: '🔬',
    keywords: ['research', 'scientist', 'analyst', 'data', 'laboratory', 'development', 'innovation', 'study', 'investigation', 'experimental']
  },
  {
    id: 'agriculture',
    name: 'Agriculture & Environment',
    description: 'Farming, environmental science, sustainability',
    icon: '🌱',
    keywords: ['agriculture', 'farming', 'environmental', 'sustainability', 'green', 'ecology', 'conservation', 'renewable', 'organic', 'climate']
  },
  {
    id: 'security',
    name: 'Security & Safety',
    description: 'Security guards, safety officers, cybersecurity',
    icon: '🔒',
    keywords: ['security', 'guard', 'safety', 'protection', 'cybersecurity', 'surveillance', 'officer', 'defense', 'risk', 'compliance']
  }
];

// Sample job postings
const sampleJobs = [
  {
    title: 'Senior React Native Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    type: 'full-time',
    category: 'technology',
    salary: '$120,000 - $150,000',
    description: 'We are looking for an experienced React Native developer to join our mobile team.',
    requirements: ['5+ years React Native experience', 'TypeScript proficiency', 'Mobile app deployment experience'],
    postedAt: admin.firestore.Timestamp.now(),
    expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days
    isActive: true,
    views: 0,
    applications: 0
  },
  {
    title: 'UX/UI Designer',
    company: 'Design Studio Pro',
    location: 'New York, NY',
    type: 'full-time',
    category: 'design',
    salary: '$80,000 - $110,000',
    description: 'Join our creative team to design beautiful and functional user experiences.',
    requirements: ['3+ years UX/UI experience', 'Figma expertise', 'Portfolio required'],
    postedAt: admin.firestore.Timestamp.now(),
    expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    isActive: true,
    views: 0,
    applications: 0
  },
  {
    title: 'Digital Marketing Specialist',
    company: 'Marketing Solutions Ltd',
    location: 'Remote',
    type: 'full-time',
    category: 'marketing',
    salary: '$60,000 - $85,000',
    description: 'Drive our digital marketing campaigns and grow our online presence.',
    requirements: ['SEO/SEM experience', 'Social media marketing', 'Analytics tools proficiency'],
    postedAt: admin.firestore.Timestamp.now(),
    expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    isActive: true,
    views: 0,
    applications: 0
  },
  {
    title: 'Financial Analyst',
    company: 'Capital Investments',
    location: 'Chicago, IL',
    type: 'full-time',
    category: 'finance',
    salary: '$70,000 - $95,000',
    description: 'Analyze financial data and provide insights for investment decisions.',
    requirements: ['Finance degree', 'Excel proficiency', '2+ years experience'],
    postedAt: admin.firestore.Timestamp.now(),
    expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    isActive: true,
    views: 0,
    applications: 0
  },
  {
    title: 'Registered Nurse',
    company: 'City General Hospital',
    location: 'Boston, MA',
    type: 'full-time',
    category: 'healthcare',
    salary: '$75,000 - $90,000',
    description: 'Provide excellent patient care in our medical-surgical unit.',
    requirements: ['RN license', 'BSN preferred', 'Hospital experience'],
    postedAt: admin.firestore.Timestamp.now(),
    expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    isActive: true,
    views: 0,
    applications: 0
  }
];

async function populateDatabase() {
  console.log('🚀 Starting database population...');

  try {
    // Create categories collection
    console.log('📁 Creating job categories...');
    const batch = db.batch();
    
    for (const category of jobCategories) {
      const categoryRef = db.collection('categories').doc(category.id);
      batch.set(categoryRef, {
        ...category,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
    }
    
    await batch.commit();
    console.log(`✅ Created ${jobCategories.length} job categories`);

    // Create sample jobs
    console.log('💼 Creating sample jobs...');
    const jobsBatch = db.batch();
    
    for (const job of sampleJobs) {
      const jobRef = db.collection('jobs').doc();
      jobsBatch.set(jobRef, {
        ...job,
        id: jobRef.id,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
    }
    
    await jobsBatch.commit();
    console.log(`✅ Created ${sampleJobs.length} sample jobs`);

    // Create indexes collection for search optimization
    console.log('🔍 Setting up search indexes...');
    const searchRef = db.collection('search').doc('config');
    await searchRef.set({
      lastIndexed: admin.firestore.Timestamp.now(),
      totalJobs: sampleJobs.length,
      totalCategories: jobCategories.length,
      activeJobs: sampleJobs.filter(job => job.isActive).length
    });

    console.log('🎉 Database population completed successfully!');
    console.log(`
📊 Summary:
• Categories: ${jobCategories.length}
• Sample Jobs: ${sampleJobs.length}
• Active Jobs: ${sampleJobs.filter(job => job.isActive).length}
    `);

  } catch (error) {
    console.error('❌ Error populating database:', error);
  } finally {
    process.exit(0);
  }
}

// Run the population script
populateDatabase();