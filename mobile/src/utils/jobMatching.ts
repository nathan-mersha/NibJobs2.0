/**
 * Job Matching Score Calculator
 * 
 * This utility calculates how well a job matches a user's profile.
 * Factors considered:
 * - Skills match
 * - Experience level match
 * - Education match
 * - Location preference
 * - Category preference
 */

/**
 * Calculate job matching score for a user
 * @param {Object} job - Job document data
 * @param {Object} userProfile - User profile data
 * @returns {number} Match score (0-100)
 */
export function calculateJobMatchScore(job, userProfile) {
  if (!userProfile || !job) return 0;
  
  let totalScore = 0;
  let factors = 0;
  
  // 1. Skills Match (40% weight)
  if (job.requiredSkills && userProfile.skills) {
    const requiredSkills = job.requiredSkills.map(s => s.toLowerCase());
    const userSkills = userProfile.skills.map(s => s.toLowerCase());
    
    const matchedSkills = requiredSkills.filter(skill => 
      userSkills.includes(skill)
    );
    
    const skillScore = (matchedSkills.length / requiredSkills.length) * 100;
    totalScore += skillScore * 0.4;
    factors++;
  }
  
  // 2. Experience Match (25% weight)
  if (job.experienceYearsRequired && userProfile.experience !== undefined) {
    const expRequired = parseInt(job.experienceYearsRequired) || 0;
    const userExp = parseInt(userProfile.experience) || 0;
    
    let expScore = 0;
    if (userExp >= expRequired) {
      // User has enough experience
      expScore = 100;
      // Slight penalty for being overqualified (more than 2x required)
      if (userExp > expRequired * 2) {
        expScore = 85;
      }
    } else {
      // User has less experience
      expScore = (userExp / expRequired) * 100;
    }
    
    totalScore += expScore * 0.25;
    factors++;
  }
  
  // 3. Education Match (15% weight)
  if (job.educationRequired && userProfile.education) {
    const educationLevels = {
      'High School': 1,
      'Associate': 2,
      'Bachelor': 3,
      'Master': 4,
      'PhD': 5
    };
    
    const requiredLevel = educationLevels[job.educationRequired] || 0;
    const userLevel = educationLevels[userProfile.education] || 0;
    
    let eduScore = 0;
    if (userLevel >= requiredLevel) {
      eduScore = 100;
    } else if (userLevel === requiredLevel - 1) {
      eduScore = 70; // One level below
    } else {
      eduScore = 40; // More than one level below
    }
    
    totalScore += eduScore * 0.15;
    factors++;
  }
  
  // 4. Location Match (10% weight)
  if (job.location && userProfile.preferredLocations) {
    const jobLocation = job.location.toLowerCase();
    const preferredLocations = userProfile.preferredLocations.map(l => l.toLowerCase());
    
    const locationMatch = preferredLocations.some(loc => 
      jobLocation.includes(loc) || loc.includes(jobLocation)
    );
    
    const locationScore = locationMatch ? 100 : (job.isRemote ? 80 : 40);
    totalScore += locationScore * 0.1;
    factors++;
  }
  
  // 5. Category Match (10% weight)
  if (job.category && userProfile.preferredCategories) {
    const categoryMatch = userProfile.preferredCategories.includes(job.category);
    const categoryScore = categoryMatch ? 100 : 50;
    
    totalScore += categoryScore * 0.1;
    factors++;
  }
  
  // Calculate final score
  if (factors === 0) return 0;
  
  const finalScore = Math.round(totalScore);
  return Math.min(100, Math.max(0, finalScore));
}

/**
 * Get match score category
 * @param {number} score - Match score (0-100)
 * @returns {Object} Category info
 */
export function getMatchScoreCategory(score) {
  if (score >= 80) {
    return {
      category: 'excellent',
      label: 'Excellent Match',
      color: '#28a745',
      message: 'Your skills align well with this position.'
    };
  } else if (score >= 60) {
    return {
      category: 'good',
      label: 'Good Match',
      color: '#ffc107',
      message: 'Consider applying to strengthen your profile.'
    };
  } else if (score >= 40) {
    return {
      category: 'moderate',
      label: 'Moderate Match',
      color: '#ff9800',
      message: 'You may need additional skills for this role.'
    };
  } else {
    return {
      category: 'low',
      label: 'Low Match',
      color: '#dc3545',
      message: 'This role may require significant upskilling.'
    };
  }
}

/**
 * Calculate match score and attach to job object
 * @param {Object} job - Job document
 * @param {Object} userProfile - User profile
 * @returns {Object} Job with matchScore field
 */
export function attachMatchScore(job, userProfile) {
  if (!userProfile) return job;
  
  const matchScore = calculateJobMatchScore(job, userProfile);
  return {
    ...job,
    matchScore,
    matchCategory: getMatchScoreCategory(matchScore)
  };
}
