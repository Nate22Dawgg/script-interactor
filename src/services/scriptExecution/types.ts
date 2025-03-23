
export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

export interface RateLimiterConfig {
  maxRequests: number;
  resetInterval: number;
}
