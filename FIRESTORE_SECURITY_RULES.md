# Firestore Security Rules Update

## Issue
The Companies page cannot fetch company data due to Firestore permission errors:
```
Error: Missing or insufficient permissions
```

## Solution
Update your Firestore security rules to allow reading approved company profiles.

## Required Security Rules

Add these rules to your `firestore.rules` file in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      // Allow users to read their own document
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Allow users to write their own document
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Allow reading company profiles that are approved (for public companies page)
      allow read: if request.auth != null 
                  && resource.data.role == 'company' 
                  && resource.data.companyProfile.verificationStatus == 'approved';
      
      // Allow admins and superadmins to read all users
      allow read: if request.auth != null 
                  && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superadmin'];
      
      // Allow admins and superadmins to write to all users
      allow write: if request.auth != null 
                   && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superadmin'];
    }
    
    // Jobs collection
    match /jobs/{jobId} {
      // Allow anyone authenticated to read jobs
      allow read: if request.auth != null;
      
      // Allow companies to create jobs
      allow create: if request.auth != null 
                    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'company';
      
      // Allow job owners to update/delete their jobs
      allow update, delete: if request.auth != null 
                            && resource.data.companyId == request.auth.uid;
      
      // Allow admins to do anything
      allow write: if request.auth != null 
                   && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superadmin'];
    }
    
    // Categories collection
    match /categories/{categoryId} {
      // Allow anyone authenticated to read categories
      allow read: if request.auth != null;
      
      // Only admins can write categories
      allow write: if request.auth != null 
                   && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superadmin'];
    }
    
    // Other collections (telegram, support, etc.)
    match /{document=**} {
      allow read, write: if false; // Deny by default, add specific rules as needed
    }
  }
}
```

## How to Apply

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Replace the existing rules with the rules above
5. Click **Publish**

## Key Points

- ✅ Authenticated users can read **approved** company profiles
- ✅ Users can read/write their own data
- ✅ Admins/superadmins have full access
- ✅ Public companies page only shows verified companies
- ✅ Security is maintained while allowing necessary access

## Code Changes Made

The Companies page now:
1. Only fetches companies with `verificationStatus == 'approved'`
2. Only selects necessary fields: `email`, `role`, `createdAt`, `companyProfile`
3. Handles permission errors gracefully with user-friendly messages
4. Provides detailed console logs for debugging
