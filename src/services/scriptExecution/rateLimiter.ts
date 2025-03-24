
import { RateLimiterConfig } from './types';

// Specific rate limiting for different script types
const RATE_LIMITS: Record<string, RateLimiterConfig> = {
  default: {
    maxRequests: 10,
    resetInterval: 60000 // 1 minute
  },
  ngs: {
    maxRequests: 5,
    resetInterval: 300000 // 5 minutes
  },
  lightweight: {
    maxRequests: 20,
    resetInterval: 60000 // 1 minute
  }
};

// Rate limiting implementation
export const rateLimiter = {
  requestCounts: new Map<string, number>(),
  lastReset: Date.now(),
  maxRequests: 10, // Max 10 executions per minute per script
  resetInterval: 60000, // 1 minute in milliseconds
  
  checkLimit(scriptId: string, scriptType: string = 'default'): boolean {
    // Reset counts if interval has passed
    const now = Date.now();
    if (now - this.lastReset > this.resetInterval) {
      this.requestCounts.clear();
      this.lastReset = now;
    }
    
    // Set limits based on script type
    const limits = RATE_LIMITS[scriptType] || RATE_LIMITS.default;
    
    // Get current count for this script
    const currentCount = this.requestCounts.get(scriptId) || 0;
    
    // Check if limit is exceeded
    if (currentCount >= limits.maxRequests) {
      return false;
    }
    
    // Increment count
    this.requestCounts.set(scriptId, currentCount + 1);
    return true;
  }
};
