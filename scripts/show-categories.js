// Simple script to populate Firebase directly
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (in a real app, you'd use service account key)
// For now, we'll create the data structure locally

const jobCategories = [
  {
    id: 'technology',
    name: 'Technology',
    description: 'Software development, IT support, system administration',
    icon: '💻',
    jobCount: 0,
    keywords: ['developer', 'programmer', 'software', 'IT', 'tech', 'coding', 'web', 'mobile', 'database', 'devops', 'frontend', 'backend', 'fullstack']
  },
  {
    id: 'design',
    name: 'Design & Creative',
    description: 'UI/UX design, graphic design, creative roles',
    icon: '🎨',
    jobCount: 0,
    keywords: ['designer', 'ui', 'ux', 'graphic', 'creative', 'art', 'visual', 'photoshop', 'figma', 'illustrator', 'branding']
  },
  {
    id: 'marketing',
    name: 'Marketing & Sales',
    description: 'Digital marketing, sales, advertising, content creation',
    icon: '📈',
    jobCount: 0,
    keywords: ['marketing', 'sales', 'advertising', 'seo', 'content', 'social media', 'campaign', 'promotion', 'lead generation', 'copywriting']
  },
  {
    id: 'finance',
    name: 'Finance & Accounting',
    description: 'Financial analysis, accounting, banking, investment',
    icon: '💰',
    jobCount: 0,
    keywords: ['finance', 'accounting', 'banker', 'financial', 'analyst', 'bookkeeper', 'audit', 'tax', 'investment', 'treasury']
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Medical professionals, healthcare workers, pharmacy',
    icon: '🏥',
    jobCount: 0,
    keywords: ['doctor', 'nurse', 'medical', 'healthcare', 'physician', 'therapist', 'pharmacist', 'dentist', 'surgeon', 'clinical']
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Teaching, training, educational administration',
    icon: '🎓',
    jobCount: 0,
    keywords: ['teacher', 'professor', 'educator', 'tutor', 'instructor', 'academic', 'school', 'university', 'training', 'curriculum']
  },
  {
    id: 'engineering',
    name: 'Engineering',
    description: 'Civil, mechanical, electrical, chemical engineering',
    icon: '⚙️',
    jobCount: 0,
    keywords: ['engineer', 'civil', 'mechanical', 'electrical', 'chemical', 'structural', 'project', 'construction', 'manufacturing', 'industrial']
  },
  {
    id: 'customer-service',
    name: 'Customer Service',
    description: 'Customer support, call center, client relations',
    icon: '📞',
    jobCount: 0,
    keywords: ['customer service', 'support', 'call center', 'help desk', 'client relations', 'customer care', 'representative', 'chat support']
  },
  {
    id: 'retail',
    name: 'Retail & Hospitality',
    description: 'Sales associate, restaurant, hotel, tourism',
    icon: '🏪',
    jobCount: 0,
    keywords: ['retail', 'sales associate', 'cashier', 'restaurant', 'waiter', 'hotel', 'hospitality', 'tourism', 'front desk', 'server']
  },
  {
    id: 'logistics',
    name: 'Logistics & Transportation',
    description: 'Supply chain, delivery, warehouse, shipping',
    icon: '🚚',
    jobCount: 0,
    keywords: ['logistics', 'supply chain', 'warehouse', 'delivery', 'driver', 'shipping', 'transportation', 'distribution', 'courier', 'freight']
  }
];

console.log('📋 Job Categories to be created:');
console.log('=====================================');
jobCategories.forEach((category, index) => {
  console.log(`${index + 1}. ${category.icon} ${category.name}`);
  console.log(`   ${category.description}`);
  console.log(`   Keywords: ${category.keywords.slice(0, 5).join(', ')}...`);
  console.log('');
});

console.log(`✅ Total categories: ${jobCategories.length}`);
console.log('🔥 Firebase function will create these when deployed!');

export { jobCategories };