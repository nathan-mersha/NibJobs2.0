export declare const formatSalary: (salary: string | null, currency: string | null) => string;
export declare const formatJobTitle: (title: string, company: string | null) => string;
export declare const formatTimeAgo: (date: Date) => string;
export declare const extractTelegramChannelName: (url: string) => string;
export declare const generateJobId: () => string;
export declare const generateUserId: () => string;
export declare const validateEmail: (email: string) => boolean;
export declare const sanitizeJobDescription: (description: string) => string;
export declare const extractKeywords: (text: string, maxKeywords?: number) => string[];
export declare const sleep: (ms: number) => Promise<void>;
export declare const retry: <T>(fn: () => Promise<T>, maxAttempts?: number, delay?: number) => Promise<T>;
export declare const chunkArray: <T>(array: T[], chunkSize: number) => T[][];
export declare const isValidUrl: (url: string) => boolean;
export declare const APP_CONSTANTS: {
    readonly MAX_JOBS_PER_PAGE: 20;
    readonly MAX_FCM_TOKENS_PER_USER: 5;
    readonly MAX_CATEGORIES_PER_USER: 10;
    readonly SCRAPING_INTERVAL_HOURS: 24;
    readonly MAX_RETRY_ATTEMPTS: 3;
    readonly NOTIFICATION_BATCH_SIZE: 500;
    readonly DEFAULT_NOTIFICATION_SOUND: "default";
};
//# sourceMappingURL=utils.d.ts.map