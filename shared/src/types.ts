// Using admin.firestore.Timestamp for compatibility across client and server
import type { Timestamp as FirestoreTimestamp } from 'firebase-admin/firestore';

export type Timestamp = FirestoreTimestamp;

// Core data models as specified in the requirements

export interface Job {
  id: string;
  title: string;
  
  // Enhanced Category System
  category: string;              // Subcategory name (e.g., "Software Development")
  categoryId: string;            // Subcategory ID (e.g., "technology-software-development")
  categoryPath: string;          // Full path (e.g., "technology/software-development")
  mainCategory: string;          // Main category name (e.g., "Technology & IT")
  mainCategoryId: string;        // Main category ID (e.g., "technology")
  categoryHierarchy: string[];   // Breadcrumb array ["Technology & IT", "Software Development"]
  
  // Job Details
  contractType: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
  salary: string | null;
  tags: string[];                // Job-specific tags from AI extraction
  description: string;
  applyLink: string | null;
  jobSource: string;             // e.g., "Telegram Channel Name"
  rawPost: string;               // Original message text
  location: string | null;
  company: string | null;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead' | null;
  isRemote: boolean;
  currency: string | null;
  
  // AI Classification Confidence
  categoryConfidence?: number;    // 0-1 score of how confident AI is about categorization
  alternativeCategories?: string[]; // Other possible categories AI considered
  
  // Enhanced Searchability
  searchKeywords: string[];       // Generated from title, description, tags, category keywords
  skillsRequired: string[];       // Extracted technical skills
  
  // Timestamps
  postedDate: Timestamp;
  extractedAt: Timestamp;
  createdAt: Timestamp;
  
  // Telegram Source
  telegramMessageId: string;
  telegramMessageUrl: string;
  telegramChannelId: string;      // Which channel it came from
  telegramChannelName: string;    // Channel display name
  
  // Engagement & Status
  notificationSent: boolean;
  viewCount?: number;             // Track how many times viewed
  applicationCount?: number;      // Track applications if integrated
  isActive: boolean;              // Job still available
  expiryDate?: Timestamp;         // When job expires
}

export interface User {
  userId: string;
  email?: string;
  fcmTokens: string[];
  selectedCategories: string[];
  isNotificationsEnabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TelegramSource {
  id: string;
  channelName: string;
  channelUrl: string;
  isActive: boolean;
  lastScrapedAt: Timestamp | null;
  createdAt: Timestamp;
}

export interface TelegramChannel {
  id: string;
  username: string;              // Telegram username without @
  name: string;                 // Display name of the channel
  imageUrl?: string;            // Optional channel profile image
  category: string;             // Job category this channel focuses on
  isActive: boolean;            // Whether the channel is active for scraping
  scrapingEnabled: boolean;     // Whether scraping is enabled for this channel
  totalJobsScraped: number;     // Total number of jobs scraped from this channel
  lastScraped: Timestamp | null; // When the channel was last scraped
  createdAt: Timestamp;         // When the channel was added to the system
  updatedAt: Timestamp;         // Last time the channel was updated
}

export interface FailedExtraction {
  id: string;
  channelName: string;
  rawMessage: string;
  telegramMessageId: string;
  error: string;
  timestamp: Timestamp;
  retryCount: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  
  // Path-based hierarchy
  path: string;           // e.g., "technology/software-development" 
  fullPath: string;       // e.g., "Technology & IT > Software Development"
  parentPath?: string;    // e.g., "technology" (null for main categories)
  
  // Metadata
  level: number;          // 0 = main category, 1 = subcategory
  isMainCategory: boolean;
  isSubcategory: boolean;
  
  // Display
  icon?: string;
  color?: string;
  order: number;
  
  // Stats
  isActive: boolean;
  jobCount: number;
  
  // Searchability
  tags: string[];         // ["tech", "programming", "code", "developer"]
  keywords: string[];     // Alternative names/synonyms
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Available job categories
export const JOB_CATEGORIES = [
  // Technology & IT
  'Software Development',
  'Data Science & Analytics',
  'Cybersecurity',
  'DevOps & Cloud',
  'UI/UX Design',
  'Product Management',
  'Quality Assurance',
  'IT Support & Administration',
  'Mobile Development',
  'Web Development',
  'AI/Machine Learning',
  'Blockchain',
  
  // Marketing & Sales
  'Digital Marketing',
  'Content Marketing',
  'Social Media Marketing',
  'SEO/SEM',
  'Sales Representative',
  'Account Management',
  'Business Development',
  'Brand Management',
  'Marketing Analytics',
  'Public Relations',
  'Email Marketing',
  'Growth Hacking',
  
  // Finance & Accounting
  'Financial Analysis',
  'Accounting',
  'Investment Banking',
  'Corporate Finance',
  'Risk Management',
  'Auditing',
  'Tax Consulting',
  'Financial Planning',
  'Banking',
  'Insurance',
  'Cryptocurrency/DeFi',
  'Bookkeeping',
  
  // Human Resources
  'Recruitment & Talent Acquisition',
  'HR Generalist',
  'Compensation & Benefits',
  'Training & Development',
  'Employee Relations',
  'HR Analytics',
  'Organizational Development',
  'Payroll',
  'HRIS Management',
  
  // Operations & Management
  'Project Management',
  'Operations Management',
  'Supply Chain Management',
  'Business Analysis',
  'Process Improvement',
  'Strategy & Planning',
  'General Management',
  'Executive Leadership',
  'Consulting',
  'Change Management',
  
  // Design & Creative
  'Graphic Design',
  'Video Production',
  'Photography',
  'Content Creation',
  'Animation',
  'Brand Design',
  'Interior Design',
  'Fashion Design',
  'Art Direction',
  'Copywriting',
  
  // Healthcare & Medical
  'Nursing',
  'Medical Doctor',
  'Pharmacy',
  'Medical Research',
  'Healthcare Administration',
  'Mental Health',
  'Dentistry',
  'Physical Therapy',
  'Medical Technology',
  'Public Health',
  'Telemedicine',
  
  // Education & Training
  'Teaching',
  'Educational Technology',
  'Curriculum Development',
  'Academic Research',
  'Online Education',
  'Educational Administration',
  'Tutoring',
  'Instructional Design',
  'Language Teaching',
  
  // Customer Service & Support
  'Customer Support',
  'Technical Support',
  'Call Center',
  'Customer Success',
  'Help Desk',
  'Community Management',
  'Client Relations',
  'Customer Experience',
  
  // Legal & Compliance
  'Legal Counsel',
  'Paralegal',
  'Compliance',
  'Contract Management',
  'Intellectual Property',
  'Litigation',
  'Corporate Law',
  'Legal Research',
  'Regulatory Affairs',
  
  // Engineering & Manufacturing
  'Software Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Quality Control',
  'Manufacturing',
  'Production Management',
  'Industrial Design',
  'Research & Development',
  
  // Media & Communications
  'Journalism',
  'Broadcasting',
  'Communications Strategy',
  'Media Planning',
  'Podcasting',
  'Publishing',
  
  // Real Estate & Construction
  'Real Estate Sales',
  'Property Management',
  'Construction Management',
  'Architecture',
  'Urban Planning',
  'Real Estate Development',
  'Facilities Management',
  'Building Inspection',
  
  // Transportation & Logistics
  'Logistics Coordination',
  'Fleet Management',
  'Warehouse Management',
  'Delivery Services',
  'Transportation Planning',
  'Freight Management',
  'Shipping & Receiving',
  
  // Retail & E-commerce
  'E-commerce Management',
  'Retail Sales',
  'Merchandising',
  'Inventory Management',
  'Store Management',
  'Online Marketplace',
  'Retail Analytics',
  
  // Non-Profit & Social Impact
  'Non-Profit Management',
  'Social Work',
  'Community Outreach',
  'Grant Writing',
  'Fundraising',
  'Program Management',
  'Advocacy',
  'Volunteer Coordination',
  
  // Remote & Freelance
  'Remote Work',
  'Freelance Projects',
  'Contract Work',
  'Part-time Remote',
  'Digital Nomad',
  'Gig Economy',
  
  // Entry Level & Internships
  'Internships',
  'Graduate Programs',
  'Entry Level',
  'Trainee Positions',
  'Junior Roles',
  'Apprenticeships',
  
  // Other
  'Other'
] as const;

export type JobCategory = typeof JOB_CATEGORIES[number];

// Contract types
export const CONTRACT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship'
] as const;

export type ContractType = typeof CONTRACT_TYPES[number];

// Experience levels
export const EXPERIENCE_LEVELS = [
  'Entry',
  'Mid',
  'Senior',
  'Lead'
] as const;

export type ExperienceLevel = typeof EXPERIENCE_LEVELS[number];

// Firebase Cloud Messaging payload types
export interface FCMNotificationPayload {
  notification: {
    title: string;
    body: string;
  };
  data: {
    jobId: string;
    category: string;
    type: 'new_job';
  };
  android: {
    priority: 'high' | 'normal';
    notification?: {
      channelId?: string;
      sound?: string;
      clickAction?: string;
    };
  };
  apns: {
    payload: {
      aps: {
        sound: string;
        badge?: number;
        category?: string;
      };
    };
  };
}

// OpenAI extraction result
export interface JobExtractionResult {
  title: string;
  category: string;
  contractType: ContractType;
  salary: string | null;
  tags: string[];
  description: string;
  applyLink: string | null;
  location: string | null;
  company: string | null;
  experienceLevel: ExperienceLevel | null;
  isRemote: boolean;
  currency: string | null;
}

// Telegram message structure
export interface TelegramMessage {
  messageId: number;
  text: string;
  date: number;
  chatId: number;
  messageUrl: string;
}

// API response types
export interface JobListResponse {
  jobs: Job[];
  nextPageToken?: string;
  hasMore: boolean;
  total: number;
}

export interface JobFilters {
  categories?: string[];
  contractTypes?: ContractType[];
  isRemote?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Cloud Function response types
export interface ScrapingResult {
  success: boolean;
  jobsProcessed: number;
  jobsExtracted: number;
  errors: string[];
  processingTime: number;
}

export interface NotificationResult {
  success: boolean;
  notificationsSent: number;
  failedTokens: string[];
  errors: string[];
}

// App configuration
export interface AppConfig {
  version: string;
  minAppVersion: string;
  maintenanceMode: boolean;
  features: {
    notifications: boolean;
    realTimeUpdates: boolean;
    socialSharing: boolean;
  };
  limits: {
    maxJobsPerPage: number;
    maxFCMTokensPerUser: number;
    maxCategoriesPerUser: number;
  };
}