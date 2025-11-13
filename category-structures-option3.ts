// Separate collections for categories and subcategories

// Main Categories Collection: /categories/{categoryId}
interface MainCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  jobCount: number;
  subcategoryCount: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Subcategories Collection: /categories/{categoryId}/subcategories/{subcategoryId}
interface Subcategory {
  id: string;
  name: string; 
  description: string;
  parentCategoryId: string;
  isActive: boolean;
  jobCount: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Example Firestore structure:
/*
/categories
  /technology-it
    - name: "Technology & IT"
    - jobCount: 1250
    /subcategories
      /software-development
        - name: "Software Development"
        - jobCount: 450
      /data-science
        - name: "Data Science & Analytics" 
        - jobCount: 320
      /cybersecurity
        - name: "Cybersecurity"
        - jobCount: 180
        
  /marketing-sales  
    - name: "Marketing & Sales"
    - jobCount: 890
    /subcategories
      /digital-marketing
        - name: "Digital Marketing"
        - jobCount: 290
      /content-marketing
        - name: "Content Marketing"
        - jobCount: 150
*/