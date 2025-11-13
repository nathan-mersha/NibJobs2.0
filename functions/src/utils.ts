// Utility functions for common operations

export const formatSalary = (salary: string | null, currency: string | null): string => {
  if (!salary) return 'Salary not specified';
  
  if (currency && !salary.includes(currency)) {
    return `${currency} ${salary}`;
  }
  
  return salary;
};

export const formatJobTitle = (title: string, company: string | null): string => {
  if (company) {
    return `${title} at ${company}`;
  }
  return title;
};

export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
};

export const extractTelegramChannelName = (url: string): string => {
  const match = url.match(/t\.me\/([^\/]+)/);
  return match ? match[1] : url;
};

export const generateJobId = (): string => {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeJobDescription = (description: string): string => {
  // Remove excessive whitespace and normalize line breaks
  return description
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
};

export const extractKeywords = (text: string, maxKeywords: number = 10): string[] => {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must'
  ]);
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word));
  
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });
  
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        break;
      }
      
      await sleep(delay * attempt);
    }
  }
  
  throw lastError!;
};

export const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Constants
export const APP_CONSTANTS = {
  MAX_JOBS_PER_PAGE: 20,
  MAX_FCM_TOKENS_PER_USER: 5,
  MAX_CATEGORIES_PER_USER: 10,
  SCRAPING_INTERVAL_HOURS: 24,
  MAX_RETRY_ATTEMPTS: 3,
  NOTIFICATION_BATCH_SIZE: 500,
  DEFAULT_NOTIFICATION_SOUND: 'default',
} as const;