// Hierarchical category structure with parent-child relationships

export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  jobCount: number;
  // Hierarchy fields
  parentId?: string;  // null for main categories, parent ID for subcategories
  level: number;      // 0 for main categories, 1 for subcategories, 2 for sub-subcategories
  order: number;      // Display order within the same level
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Example structure:
const HIERARCHICAL_CATEGORIES = {
  "technology": {
    id: "technology",
    name: "Technology & IT",
    parentId: null,
    level: 0,
    subcategories: [
      {
        id: "software-development", 
        name: "Software Development",
        parentId: "technology",
        level: 1
      },
      {
        id: "data-science", 
        name: "Data Science & Analytics",
        parentId: "technology",
        level: 1
      },
      {
        id: "cybersecurity", 
        name: "Cybersecurity",
        parentId: "technology",
        level: 1
      }
    ]
  },
  "marketing": {
    id: "marketing",
    name: "Marketing & Sales",
    parentId: null,
    level: 0,
    subcategories: [
      {
        id: "digital-marketing",
        name: "Digital Marketing", 
        parentId: "marketing",
        level: 1
      },
      {
        id: "content-marketing",
        name: "Content Marketing",
        parentId: "marketing", 
        level: 1
      }
    ]
  }
};