# Database Schema Updates for Job Statistics & Matching

## Updated Job Document Schema

```typescript
interface Job {
  // ... existing fields ...
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  salary?: string;
  contractType: string;
  category: string;
  isRemote: boolean;
  experienceLevel?: string;
  educationRequired?: string;
  
  // NEW: Application Statistics & Social Proof
  recentApplicants?: number;        // Number of people who applied in last 24 hours
  totalApplicants?: number;         // Total number of applications received
  viewsLast24h?: number;            // Views in the last 24 hours
  applicants?: number;              // Current applicants count (for display)
  views?: number;                   // Total views count
  
  // NEW: Job Matching (calculated per user, not stored in job doc)
  matchScore?: number;              // 0-100, calculated based on user profile
  
  // Metadata
  requiredSkills?: string[];        // For matching calculation
  preferredSkills?: string[];       // For matching calculation
  experienceYearsRequired?: number; // For matching calculation
  postedDate?: Date;
  deadline?: Date;
  createdAt?: Date;
  statisticsUpdatedAt?: Date;       // When statistics were last updated
}
```

## Updated User Profile Schema

```typescript
interface UserProfile {
  // ... existing fields ...
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  
  // NEW: Profile Fields for Job Matching
  skills?: string[];                // Array of user's skills (e.g., ["JavaScript", "React", "Node.js"])
  experience?: number;              // Years of experience
  education?: string;               // Education level: "High School", "Associate", "Bachelor", "Master", "PhD"
  preferredCategories?: string[];   // Preferred job categories
  preferredLocations?: string[];    // Preferred work locations
  
  // Profile metadata
  profileCompleteness?: number;     // 0-100 percentage
  profileUpdatedAt?: Date;
  
  // Existing fields
  savedJobs?: string[];             // Array of saved job IDs
  appliedJobs?: string[];           // Array of applied job IDs
  createdAt?: Date;
}
```

## Sample Data Examples

### Job Document with Statistics
```json
{
  "id": "job123",
  "title": "Senior Frontend Developer",
  "company": "Tech Corp",
  "location": "Addis Ababa",
  "salary": "50,000 - 70,000 ETB",
  "category": "Software Development",
  "contractType": "Full-time",
  "isRemote": true,
  "experienceLevel": "Senior",
  "educationRequired": "Bachelor",
  "requiredSkills": ["React", "TypeScript", "Redux", "Node.js"],
  "preferredSkills": ["GraphQL", "AWS", "Docker"],
  "experienceYearsRequired": 5,
  
  "recentApplicants": 15,
  "totalApplicants": 87,
  "viewsLast24h": 234,
  "applicants": 87,
  "views": 1250,
  
  "postedDate": "2025-11-10T00:00:00Z",
  "statisticsUpdatedAt": "2025-11-15T08:30:00Z"
}
```

### User Profile with Matching Data
```json
{
  "uid": "user456",
  "email": "john.doe@example.com",
  "displayName": "John Doe",
  
  "skills": ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Redux"],
  "experience": 6,
  "education": "Bachelor",
  "preferredCategories": ["Software Development", "Web Development"],
  "preferredLocations": ["Addis Ababa", "Remote"],
  
  "profileCompleteness": 85,
  "profileUpdatedAt": "2025-11-14T10:00:00Z",
  
  "savedJobs": ["job123", "job456"],
  "appliedJobs": ["job789"],
  "createdAt": "2025-10-01T00:00:00Z"
}
```

## Implementation Steps

### 1. Run Migration Script
```bash
cd mobile/migrations
npm install firebase-admin
node add-job-statistics.js
```

### 2. Update Job Creation/Update Logic
When creating or updating jobs, include these fields:
```javascript
const jobData = {
  // ... other fields ...
  recentApplicants: 0,
  totalApplicants: 0,
  viewsLast24h: 0,
  applicants: 0,
  views: 0,
  statisticsUpdatedAt: new Date()
};
```

### 3. Implement Statistics Tracking

#### Track Job Views
```javascript
// When a user views a job details page
async function trackJobView(jobId) {
  const jobRef = doc(db, 'jobs', jobId);
  await updateDoc(jobRef, {
    views: increment(1),
    viewsLast24h: increment(1) // Reset this daily with a scheduled function
  });
}
```

#### Track Applications
```javascript
// When a user applies to a job
async function trackJobApplication(jobId) {
  const jobRef = doc(db, 'jobs', jobId);
  await updateDoc(jobRef, {
    applicants: increment(1),
    totalApplicants: increment(1),
    recentApplicants: increment(1) // Reset this daily with a scheduled function
  });
}
```

### 4. Calculate Match Score on Client Side
```javascript
import { calculateJobMatchScore } from './src/utils/jobMatching';

// In JobDetailsScreen, after fetching job
const userProfile = await getUserProfile(auth.currentUser.uid);
const matchScore = calculateJobMatchScore(job, userProfile);

setJob({
  ...jobData,
  matchScore
});
```

### 5. Set Up Daily Statistics Reset (Firebase Cloud Function)
```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.resetDailyStatistics = functions.pubsub
  .schedule('every day 00:00')
  .timeZone('Africa/Addis_Ababa')
  .onRun(async (context) => {
    const db = admin.firestore();
    const jobsRef = db.collection('jobs');
    const snapshot = await jobsRef.get();
    
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, {
        recentApplicants: 0,
        viewsLast24h: 0,
        statisticsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log('Daily statistics reset completed');
  });
```

## Firestore Security Rules Update

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /jobs/{jobId} {
      // Allow read to all
      allow read: if true;
      
      // Allow statistics update
      allow update: if request.auth != null 
        && request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['views', 'viewsLast24h', 'applicants', 'totalApplicants', 'recentApplicants', 'statisticsUpdatedAt']);
    }
    
    match /users/{userId} {
      // Users can read their own profile
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Users can update their own profile
      allow update: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Testing Checklist

- [ ] Job statistics display correctly when present
- [ ] Job statistics hide gracefully when not present
- [ ] Match score calculates correctly for logged-in users
- [ ] Match score doesn't show for anonymous users
- [ ] Statistics update when user views/applies to job
- [ ] Daily reset function works correctly
- [ ] UI handles edge cases (0 applicants, 100% match, etc.)
- [ ] Performance is acceptable with large datasets
