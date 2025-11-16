/**
 * Browser-based Migration Script
 * Add this to your App.tsx temporarily and call it once from the console
 */

import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase'; // Adjust import path

export async function migrateJobStatistics() {
  try {
    console.log('🚀 Starting migration: Adding job statistics...');
    
    const jobsRef = collection(db, 'jobs');
    const snapshot = await getDocs(jobsRef);
    
    let updatedCount = 0;
    const updates = [];
    
    for (const jobDoc of snapshot.docs) {
      const jobData = jobDoc.data();
      
      // Generate realistic statistics
      const baseViews = Math.floor(Math.random() * 500) + 100; // 100-600 views
      const recentApplicants = Math.floor(Math.random() * 15) + 1; // 1-15 recent
      const totalApplicants = Math.floor(Math.random() * 80) + recentApplicants + 10; // At least 10 more than recent
      const viewsLast24h = Math.floor(Math.random() * 150) + 30; // 30-180 views in 24h
      
      const updateData = {
        // Social proof statistics
        recentApplicants,
        totalApplicants,
        viewsLast24h,
        
        // Keep or set applicants and views
        applicants: jobData.applicants || totalApplicants,
        views: jobData.views || baseViews,
        
        // Add timestamp
        statisticsUpdatedAt: new Date(),
      };
      
      const jobRef = doc(db, 'jobs', jobDoc.id);
      updates.push(updateDoc(jobRef, updateData));
      updatedCount++;
      
      console.log(`✓ Updated job: ${jobDoc.id} - ${jobData.title}`);
    }
    
    await Promise.all(updates);
    console.log(`✅ Successfully updated ${updatedCount} jobs with statistics!`);
    console.log('📊 Statistics added:');
    console.log('   - recentApplicants: Number who applied in last 24h');
    console.log('   - totalApplicants: Total applications');
    console.log('   - viewsLast24h: Views in last 24h');
    console.log('   - applicants & views: Display counts');
    
    return { success: true, count: updatedCount };
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    return { success: false, error };
  }
}

export async function addSampleUserProfiles() {
  try {
    console.log('🚀 Starting migration: Adding sample user profiles for testing...');
    
    // You can manually add a test user profile in Firestore Console
    console.log('ℹ️  To test job matching, add a user profile manually:');
    console.log('   Collection: users');
    console.log('   Document ID: <your-user-id>');
    console.log('   Fields:');
    console.log('   {');
    console.log('     skills: ["React", "TypeScript", "JavaScript", "Node.js"],');
    console.log('     experience: 5,');
    console.log('     education: "Bachelor",');
    console.log('     preferredCategories: ["Software Development", "IT"],');
    console.log('     preferredLocations: ["Addis Ababa", "Remote"]');
    console.log('   }');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error };
  }
}

// Add match scores to jobs (client-side calculation)
export function calculateAndAddMatchScore(job: any, userProfile: any) {
  if (!userProfile || !job) return job;
  
  let totalScore = 0;
  let factors = 0;
  
  // Skills match (40%)
  if (job.requiredSkills && userProfile.skills) {
    const requiredSkills = job.requiredSkills.map((s: string) => s.toLowerCase());
    const userSkills = userProfile.skills.map((s: string) => s.toLowerCase());
    const matchedSkills = requiredSkills.filter((skill: string) => userSkills.includes(skill));
    const skillScore = (matchedSkills.length / requiredSkills.length) * 100;
    totalScore += skillScore * 0.4;
    factors++;
  }
  
  // Experience match (25%)
  if (job.experienceYearsRequired && userProfile.experience !== undefined) {
    const expRequired = parseInt(job.experienceYearsRequired) || 0;
    const userExp = parseInt(userProfile.experience) || 0;
    let expScore = userExp >= expRequired ? 100 : (userExp / expRequired) * 100;
    if (userExp > expRequired * 2) expScore = 85; // Overqualified
    totalScore += expScore * 0.25;
    factors++;
  }
  
  // Education match (15%)
  if (job.educationRequired && userProfile.education) {
    const levels: { [key: string]: number } = {
      'High School': 1, 'Associate': 2, 'Bachelor': 3, 'Master': 4, 'PhD': 5
    };
    const reqLevel = levels[job.educationRequired] || 0;
    const userLevel = levels[userProfile.education] || 0;
    const eduScore = userLevel >= reqLevel ? 100 : userLevel === reqLevel - 1 ? 70 : 40;
    totalScore += eduScore * 0.15;
    factors++;
  }
  
  // Location match (10%)
  if (job.location && userProfile.preferredLocations) {
    const jobLoc = job.location.toLowerCase();
    const preferred = userProfile.preferredLocations.map((l: string) => l.toLowerCase());
    const locMatch = preferred.some((loc: string) => jobLoc.includes(loc) || loc.includes(jobLoc));
    const locScore = locMatch ? 100 : (job.isRemote ? 80 : 40);
    totalScore += locScore * 0.1;
    factors++;
  }
  
  // Category match (10%)
  if (job.category && userProfile.preferredCategories) {
    const catMatch = userProfile.preferredCategories.includes(job.category);
    totalScore += (catMatch ? 100 : 50) * 0.1;
    factors++;
  }
  
  const matchScore = factors > 0 ? Math.round(totalScore) : 0;
  return { ...job, matchScore };
}
