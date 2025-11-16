# Quick Migration Guide

## Run Job Statistics Migration

The migration function is now available in your browser console!

### Steps:

1. **Open the app** in your browser at http://localhost:19006

2. **Open Browser DevTools**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)

3. **Go to Console tab**

4. **Run the migration**
   ```javascript
   window.migrateJobStats()
   ```

5. **Wait for completion**
   - You'll see logs for each job being updated
   - When done, you'll see: "✅ Successfully updated X jobs!"
   - An alert will confirm completion

### What the migration does:

For each job in your Firestore database, it adds:
- `recentApplicants`: 1-15 (random number of recent applicants)
- `totalApplicants`: 11-95 (total applications, always more than recent)
- `viewsLast24h`: 30-180 (views in last 24 hours)
- `applicants`: Total applicants count (for display)
- `views`: 100-600 (total views)
- `statisticsUpdatedAt`: Current timestamp

### Verification:

After running the migration:

1. **Check Firestore Console**
   - Go to https://console.firebase.google.com
   - Select your project: nibjobs-dev
   - Go to Firestore Database
   - Check any job document - you should see the new fields

2. **Check the App**
   - Navigate to any job details page
   - You should see:
     - "Application Activity" card showing statistics
     - "Job Match" card (if you're logged in with a user profile)

### Test Match Score:

To see the match score feature:

1. **Create a user profile** in Firestore:
   ```
   Collection: users
   Document ID: [your-user-id from Auth]
   Fields:
   {
     "skills": ["React", "TypeScript", "JavaScript", "Node.js"],
     "experience": 5,
     "education": "Bachelor",
     "preferredCategories": ["Software Development", "IT"],
     "preferredLocations": ["Addis Ababa", "Remote"]
   }
   ```

2. **Log in** to the app with that user

3. **Navigate to a job details page**
   - You should see the "Job Match" card with a percentage

### Troubleshooting:

**Error: "Migration failed"**
- Check browser console for detailed error message
- Verify Firebase is initialized correctly
- Check your Firestore security rules allow updates

**No changes visible**
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Check if the migration actually ran (check console logs)
- Verify you're looking at the right Firebase project

**Match score not showing**
- Make sure you're logged in
- Verify user profile exists in Firestore
- Check that the user document ID matches your auth UID

### Re-running the Migration:

You can run `window.migrateJobStats()` multiple times safely.
It will update the values each time with new random statistics.

### Production Note:

In production, you would:
1. Track actual view counts and applications
2. Increment counters when users interact with jobs
3. Use Cloud Functions to reset daily statistics
4. Calculate match scores based on real user profiles

For now, this gives you realistic sample data to see the features in action!
