"use strict";
// Utility functions for common operations
Object.defineProperty(exports, "__esModule", { value: true });
exports.APP_CONSTANTS = exports.isValidUrl = exports.chunkArray = exports.retry = exports.sleep = exports.extractKeywords = exports.sanitizeJobDescription = exports.validateEmail = exports.generateUserId = exports.generateJobId = exports.extractTelegramChannelName = exports.formatTimeAgo = exports.formatJobTitle = exports.formatSalary = void 0;
const formatSalary = (salary, currency) => {
    if (!salary)
        return 'Salary not specified';
    if (currency && !salary.includes(currency)) {
        return `${currency} ${salary}`;
    }
    return salary;
};
exports.formatSalary = formatSalary;
const formatJobTitle = (title, company) => {
    if (company) {
        return `${title} at ${company}`;
    }
    return title;
};
exports.formatJobTitle = formatJobTitle;
const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (minutes < 1)
        return 'Just now';
    if (minutes < 60)
        return `${minutes}m ago`;
    if (hours < 24)
        return `${hours}h ago`;
    if (days < 7)
        return `${days}d ago`;
    return date.toLocaleDateString();
};
exports.formatTimeAgo = formatTimeAgo;
const extractTelegramChannelName = (url) => {
    const match = url.match(/t\.me\/([^\/]+)/);
    return match ? match[1] : url;
};
exports.extractTelegramChannelName = extractTelegramChannelName;
const generateJobId = () => {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
exports.generateJobId = generateJobId;
const generateUserId = () => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
exports.generateUserId = generateUserId;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const sanitizeJobDescription = (description) => {
    // Remove excessive whitespace and normalize line breaks
    return description
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
};
exports.sanitizeJobDescription = sanitizeJobDescription;
const extractKeywords = (text, maxKeywords = 10) => {
    const commonWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must'
    ]);
    const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !commonWords.has(word));
    const wordCount = new Map();
    words.forEach(word => {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });
    return Array.from(wordCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxKeywords)
        .map(([word]) => word);
};
exports.extractKeywords = extractKeywords;
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.sleep = sleep;
const retry = async (fn, maxAttempts = 3, delay = 1000) => {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxAttempts) {
                break;
            }
            await (0, exports.sleep)(delay * attempt);
        }
    }
    throw lastError;
};
exports.retry = retry;
const chunkArray = (array, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
};
exports.chunkArray = chunkArray;
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
};
exports.isValidUrl = isValidUrl;
// Constants
exports.APP_CONSTANTS = {
    MAX_JOBS_PER_PAGE: 20,
    MAX_FCM_TOKENS_PER_USER: 5,
    MAX_CATEGORIES_PER_USER: 10,
    SCRAPING_INTERVAL_HOURS: 24,
    MAX_RETRY_ATTEMPTS: 3,
    NOTIFICATION_BATCH_SIZE: 500,
    DEFAULT_NOTIFICATION_SOUND: 'default',
};
//# sourceMappingURL=utils.js.map