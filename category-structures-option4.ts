// Path-based category system - most flexible and searchable

interface Category {
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
  
  createdAt: Date;
  updatedAt: Date;
}

// Example categories with paths:
const EXAMPLE_CATEGORIES = [
  // Main Categories
  {
    id: "technology",
    name: "Technology & IT", 
    path: "technology",
    fullPath: "Technology & IT",
    level: 0,
    isMainCategory: true,
    isSubcategory: false,
    tags: ["tech", "it", "computers"],
    order: 1
  },
  
  // Subcategories
  {
    id: "software-development",
    name: "Software Development",
    path: "technology/software-development", 
    fullPath: "Technology & IT > Software Development",
    parentPath: "technology",
    level: 1,
    isMainCategory: false,
    isSubcategory: true,
    tags: ["programming", "coding", "developer", "software"],
    keywords: ["programming", "coding", "development", "software engineer"],
    order: 1
  },
  
  {
    id: "data-science",
    name: "Data Science & Analytics",
    path: "technology/data-science",
    fullPath: "Technology & IT > Data Science & Analytics", 
    parentPath: "technology",
    level: 1,
    isMainCategory: false,
    isSubcategory: true,
    tags: ["data", "analytics", "statistics", "ai"],
    keywords: ["data scientist", "analyst", "machine learning", "statistics"],
    order: 2
  }
];