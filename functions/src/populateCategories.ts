import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Hierarchical Category Structure with Path-based Organization
 */
const HIERARCHICAL_CATEGORIES = {
  "technology": {
    name: "Technology & IT",
    icon: "💻",
    color: "#3498db",
    description: "Technology and Information Technology roles",
    tags: ["tech", "it", "computers", "digital"],
    keywords: ["technology", "IT", "computer", "digital", "tech"],
    subcategories: [
      { 
        id: "software-development", 
        name: "Software Development", 
        description: "Build and maintain software applications and systems",
        tags: ["programming", "coding", "developer", "software"],
        keywords: ["programming", "coding", "development", "software engineer", "developer"]
      },
      { 
        id: "data-science", 
        name: "Data Science & Analytics", 
        description: "Analyze data to extract insights and drive business decisions",
        tags: ["data", "analytics", "statistics", "ai", "ml"],
        keywords: ["data scientist", "analyst", "machine learning", "statistics", "big data"]
      },
      { 
        id: "cybersecurity", 
        name: "Cybersecurity", 
        description: "Protect systems, networks, and data from digital threats",
        tags: ["security", "cyber", "protection", "hacking"],
        keywords: ["cybersecurity", "security analyst", "penetration testing", "infosec"]
      },
      { 
        id: "devops-cloud", 
        name: "DevOps & Cloud", 
        description: "Manage infrastructure, deployment, and cloud platforms",
        tags: ["devops", "cloud", "aws", "azure", "infrastructure"],
        keywords: ["devops", "cloud engineer", "AWS", "Azure", "GCP", "kubernetes"]
      },
      { 
        id: "ui-ux-design", 
        name: "UI/UX Design", 
        description: "Design user interfaces and experiences for digital products",
        tags: ["design", "ui", "ux", "user experience"],
        keywords: ["UI designer", "UX designer", "user experience", "interface design"]
      },
      { 
        id: "product-management", 
        name: "Product Management", 
        description: "Guide product development from conception to launch",
        tags: ["product", "management", "strategy", "roadmap"],
        keywords: ["product manager", "product owner", "product strategy"]
      },
      { 
        id: "quality-assurance", 
        name: "Quality Assurance", 
        description: "Test software and ensure quality standards",
        tags: ["qa", "testing", "quality", "automation"],
        keywords: ["QA", "quality assurance", "software testing", "test automation"]
      },
      { 
        id: "it-support", 
        name: "IT Support & Administration", 
        description: "Provide technical support and system administration",
        tags: ["support", "admin", "helpdesk", "technical"],
        keywords: ["IT support", "system admin", "help desk", "technical support"]
      },
      { 
        id: "mobile-development", 
        name: "Mobile Development", 
        description: "Create mobile applications for iOS and Android",
        tags: ["mobile", "ios", "android", "app"],
        keywords: ["mobile developer", "iOS developer", "Android developer", "app development"]
      },
      { 
        id: "web-development", 
        name: "Web Development", 
        description: "Build websites and web applications",
        tags: ["web", "frontend", "backend", "fullstack"],
        keywords: ["web developer", "frontend", "backend", "full stack", "javascript"]
      },
      { 
        id: "ai-ml", 
        name: "AI/Machine Learning", 
        description: "Develop intelligent systems and machine learning models",
        tags: ["ai", "ml", "artificial intelligence", "deep learning"],
        keywords: ["AI", "machine learning", "deep learning", "neural networks", "MLOps"]
      },
      { 
        id: "blockchain", 
        name: "Blockchain", 
        description: "Work with blockchain technology and cryptocurrencies",
        tags: ["blockchain", "crypto", "web3", "defi"],
        keywords: ["blockchain", "cryptocurrency", "web3", "smart contracts", "DeFi"]
      }
    ]
  },

  "marketing": {
    name: "Marketing & Sales",
    icon: "📢",
    color: "#e74c3c",
    description: "Marketing, advertising, and sales positions",
    tags: ["marketing", "sales", "advertising", "promotion"],
    keywords: ["marketing", "sales", "advertising", "promotion", "brand"],
    subcategories: [
      { 
        id: "digital-marketing", 
        name: "Digital Marketing", 
        description: "Promote products and services through digital channels",
        tags: ["digital", "online", "internet", "campaigns"],
        keywords: ["digital marketing", "online marketing", "digital campaigns"]
      },
      { 
        id: "content-marketing", 
        name: "Content Marketing", 
        description: "Create and distribute valuable content to attract customers",
        tags: ["content", "blogging", "copywriting", "storytelling"],
        keywords: ["content marketing", "content creator", "copywriter", "blogger"]
      },
      { 
        id: "social-media", 
        name: "Social Media Marketing", 
        description: "Manage and grow brand presence on social media platforms",
        tags: ["social", "media", "facebook", "instagram", "twitter"],
        keywords: ["social media", "community manager", "social media marketing"]
      },
      { 
        id: "seo-sem", 
        name: "SEO/SEM", 
        description: "Optimize websites for search engines and manage paid search",
        tags: ["seo", "sem", "search", "google", "optimization"],
        keywords: ["SEO", "SEM", "search engine optimization", "google ads", "PPC"]
      },
      { 
        id: "sales-rep", 
        name: "Sales Representative", 
        description: "Sell products or services to customers and clients",
        tags: ["sales", "selling", "revenue", "b2b", "b2c"],
        keywords: ["sales rep", "account executive", "business development", "sales"]
      },
      { 
        id: "account-management", 
        name: "Account Management", 
        description: "Manage relationships with existing clients and accounts",
        tags: ["account", "client", "relationship", "retention"],
        keywords: ["account manager", "client success", "customer success"]
      }
    ]
  },

  "finance": {
    name: "Finance & Accounting",
    icon: "💰",
    color: "#27ae60",
    description: "Financial services and accounting positions",
    tags: ["finance", "accounting", "money", "financial"],
    keywords: ["finance", "accounting", "financial", "money", "budget"],
    subcategories: [
      { 
        id: "financial-analysis", 
        name: "Financial Analysis", 
        description: "Analyze financial data to support business decisions",
        tags: ["analysis", "financial", "modeling", "forecasting"],
        keywords: ["financial analyst", "financial modeling", "investment analysis"]
      },
      { 
        id: "accounting", 
        name: "Accounting", 
        description: "Manage financial records and ensure compliance",
        tags: ["accounting", "bookkeeping", "ledger", "compliance"],
        keywords: ["accountant", "bookkeeper", "CPA", "financial reporting"]
      },
      { 
        id: "corporate-finance", 
        name: "Corporate Finance", 
        description: "Manage company finances and financial planning",
        tags: ["corporate", "finance", "planning", "treasury"],
        keywords: ["corporate finance", "treasury", "financial planning", "CFO"]
      }
    ]
  },

  "healthcare": {
    name: "Healthcare & Medical",
    icon: "🏥",
    color: "#e67e22",
    description: "Healthcare and medical industry positions",
    tags: ["healthcare", "medical", "health", "medicine"],
    keywords: ["healthcare", "medical", "health", "medicine", "clinical"],
    subcategories: [
      { 
        id: "nursing", 
        name: "Nursing", 
        description: "Provide patient care and medical assistance",
        tags: ["nurse", "patient care", "medical", "clinical"],
        keywords: ["nurse", "RN", "LPN", "nursing", "patient care"]
      },
      { 
        id: "medical-doctor", 
        name: "Medical Doctor", 
        description: "Diagnose and treat patients as a licensed physician",
        tags: ["doctor", "physician", "md", "medical"],
        keywords: ["doctor", "physician", "MD", "medical doctor", "clinician"]
      }
    ]
  },

  "education": {
    name: "Education & Training",
    icon: "🎓",
    color: "#9b59b6",
    description: "Education and training positions",
    tags: ["education", "teaching", "training", "learning"],
    keywords: ["education", "teaching", "training", "instructor", "professor"],
    subcategories: [
      { 
        id: "teaching", 
        name: "Teaching", 
        description: "Educate students in various subjects and levels",
        tags: ["teacher", "education", "classroom", "students"],
        keywords: ["teacher", "educator", "instructor", "professor"]
      }
    ]
  },

  "remote": {
    name: "Remote & Freelance",
    icon: "🌍",
    color: "#34495e",
    description: "Remote work and freelance opportunities",
    tags: ["remote", "freelance", "work from home", "distributed"],
    keywords: ["remote", "freelance", "work from home", "telecommute", "distributed"],
    subcategories: [
      { 
        id: "remote-work", 
        name: "Remote Work", 
        description: "Full-time remote positions across various fields",
        tags: ["remote", "telecommute", "distributed", "wfh"],
        keywords: ["remote work", "work from home", "telecommute", "distributed team"]
      },
      { 
        id: "freelance", 
        name: "Freelance Projects", 
        description: "Contract and freelance project opportunities",
        tags: ["freelance", "contract", "project", "gig"],
        keywords: ["freelance", "contractor", "project based", "gig work"]
      }
    ]
  }
};

/**
 * Populate the Firestore database with hierarchical job categories
 */
export const populateJobCategories = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    try {
      functions.logger.info('🏗️ Starting to populate hierarchical job categories...');
      
      const db = admin.firestore();
      const batch = db.batch();
      
      let createdCount = 0;
      let updatedCount = 0;
      
      // Process each main category and its subcategories
      for (const [categoryKey, mainCategory] of Object.entries(HIERARCHICAL_CATEGORIES)) {
        
        // Create main category
        const mainCategoryId = categoryKey;
        const mainCategoryRef = db.collection('categories').doc(mainCategoryId);
        const existingMainDoc = await mainCategoryRef.get();
        
        const mainCategoryData = {
          id: mainCategoryId,
          name: mainCategory.name,
          description: mainCategory.description,
          path: categoryKey,
          fullPath: mainCategory.name,
          parentPath: null,
          level: 0,
          isMainCategory: true,
          isSubcategory: false,
          icon: mainCategory.icon,
          color: mainCategory.color,
          order: Object.keys(HIERARCHICAL_CATEGORIES).indexOf(categoryKey) + 1,
          isActive: true,
          jobCount: 0,
          tags: mainCategory.tags,
          keywords: mainCategory.keywords,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        if (existingMainDoc.exists) {
          const existingData = existingMainDoc.data();
          batch.update(mainCategoryRef, {
            ...mainCategoryData,
            jobCount: existingData?.jobCount || 0,
            createdAt: existingData?.createdAt || admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          updatedCount++;
        } else {
          batch.set(mainCategoryRef, mainCategoryData);
          createdCount++;
        }
        
        // Create subcategories
        for (let i = 0; i < mainCategory.subcategories.length; i++) {
          const subcat = mainCategory.subcategories[i];
          const subcategoryId = `${categoryKey}-${subcat.id}`;
          const subcategoryRef = db.collection('categories').doc(subcategoryId);
          const existingSubDoc = await subcategoryRef.get();
          
          const subcategoryData = {
            id: subcategoryId,
            name: subcat.name,
            description: subcat.description,
            path: `${categoryKey}/${subcat.id}`,
            fullPath: `${mainCategory.name} > ${subcat.name}`,
            parentPath: categoryKey,
            level: 1,
            isMainCategory: false,
            isSubcategory: true,
            icon: mainCategory.icon, // Inherit from parent
            color: mainCategory.color, // Inherit from parent
            order: i + 1,
            isActive: true,
            jobCount: 0,
            tags: subcat.tags || [],
            keywords: subcat.keywords || [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
          
          if (existingSubDoc.exists) {
            const existingData = existingSubDoc.data();
            batch.update(subcategoryRef, {
              ...subcategoryData,
              jobCount: existingData?.jobCount || 0,
              createdAt: existingData?.createdAt || admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            updatedCount++;
          } else {
            batch.set(subcategoryRef, subcategoryData);
            createdCount++;
          }
        }
      }
      
      // Commit the batch
      await batch.commit();
      
      functions.logger.info(`✅ Hierarchical categories populated successfully! Created: ${createdCount}, Updated: ${updatedCount}`);
      
      return {
        success: true,
        message: `Hierarchical categories populated successfully! Created: ${createdCount}, Updated: ${updatedCount}`,
        totalCategories: createdCount + updatedCount,
        created: createdCount,
        updated: updatedCount,
        structure: 'hierarchical-path-based'
      };
      
    } catch (error) {
      functions.logger.error('❌ Error populating hierarchical categories:', error);
      throw new functions.https.HttpsError('internal', 'Failed to populate hierarchical categories', error);
    }
  });