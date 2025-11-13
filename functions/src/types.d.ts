import type { Timestamp as FirestoreTimestamp } from 'firebase-admin/firestore';
export type Timestamp = FirestoreTimestamp;
export interface Job {
    id: string;
    title: string;
    category: string;
    contractType: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
    salary: string | null;
    tags: string[];
    description: string;
    applyLink: string | null;
    jobSource: string;
    rawPost: string;
    location: string | null;
    company: string | null;
    experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead' | null;
    isRemote: boolean;
    currency: string | null;
    postedDate: Timestamp;
    extractedAt: Timestamp;
    createdAt: Timestamp;
    telegramMessageId: string;
    telegramMessageUrl: string;
    notificationSent: boolean;
}
export interface User {
    userId: string;
    email?: string;
    fcmTokens: string[];
    selectedCategories: string[];
    isNotificationsEnabled: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface TelegramSource {
    id: string;
    channelName: string;
    channelUrl: string;
    isActive: boolean;
    lastScrapedAt: Timestamp | null;
    createdAt: Timestamp;
}
export interface FailedExtraction {
    id: string;
    channelName: string;
    rawMessage: string;
    telegramMessageId: string;
    error: string;
    timestamp: Timestamp;
    retryCount: number;
}
export interface Category {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    jobCount: number;
    createdAt: Timestamp;
}
export declare const JOB_CATEGORIES: readonly ["Software Development", "Design (UI/UX, Graphic)", "Marketing & Advertising", "Sales & Business Development", "Data Science & Analytics", "Product Management", "Customer Support", "Human Resources", "Finance & Accounting", "Content Writing & Editing", "Project Management", "DevOps & System Administration", "Quality Assurance", "Legal", "Operations", "Other"];
export type JobCategory = typeof JOB_CATEGORIES[number];
export declare const CONTRACT_TYPES: readonly ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];
export type ContractType = typeof CONTRACT_TYPES[number];
export declare const EXPERIENCE_LEVELS: readonly ["Entry", "Mid", "Senior", "Lead"];
export type ExperienceLevel = typeof EXPERIENCE_LEVELS[number];
export interface FCMNotificationPayload {
    notification: {
        title: string;
        body: string;
    };
    data: {
        jobId: string;
        category: string;
        type: 'new_job';
    };
    android: {
        priority: 'high' | 'normal';
        notification?: {
            channelId?: string;
            sound?: string;
            clickAction?: string;
        };
    };
    apns: {
        payload: {
            aps: {
                sound: string;
                badge?: number;
                category?: string;
            };
        };
    };
}
export interface JobExtractionResult {
    title: string;
    category: string;
    contractType: ContractType;
    salary: string | null;
    tags: string[];
    description: string;
    applyLink: string | null;
    location: string | null;
    company: string | null;
    experienceLevel: ExperienceLevel | null;
    isRemote: boolean;
    currency: string | null;
}
export interface TelegramMessage {
    messageId: number;
    text: string;
    date: number;
    chatId: number;
    messageUrl: string;
}
export interface JobListResponse {
    jobs: Job[];
    nextPageToken?: string;
    hasMore: boolean;
    total: number;
}
export interface JobFilters {
    categories?: string[];
    contractTypes?: ContractType[];
    isRemote?: boolean;
    dateRange?: {
        start: Date;
        end: Date;
    };
    search?: string;
}
export interface AppError {
    code: string;
    message: string;
    details?: any;
}
export interface ScrapingResult {
    success: boolean;
    jobsProcessed: number;
    jobsExtracted: number;
    errors: string[];
    processingTime: number;
}
export interface NotificationResult {
    success: boolean;
    notificationsSent: number;
    failedTokens: string[];
    errors: string[];
}
export interface AppConfig {
    version: string;
    minAppVersion: string;
    maintenanceMode: boolean;
    features: {
        notifications: boolean;
        realTimeUpdates: boolean;
        socialSharing: boolean;
    };
    limits: {
        maxJobsPerPage: number;
        maxFCMTokensPerUser: number;
        maxCategoriesPerUser: number;
    };
}
//# sourceMappingURL=types.d.ts.map