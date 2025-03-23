
// Rate limiting implementation
export const rateLimiter = {
  requestCounts: new Map<string, number>(),
  lastReset: Date.now(),
  maxRequests: 10, // Max 10 executions per minute per script
  resetInterval: 60000, // 1 minute in milliseconds
  
  checkLimit(scriptId: string): boolean {
    // Reset counts if interval has passed
    const now = Date.now();
    if (now - this.lastReset > this.resetInterval) {
      this.requestCounts.clear();
      this.lastReset = now;
    }
    
    // Get current count for this script
    const currentCount = this.requestCounts.get(scriptId) || 0;
    
    // Check if limit is exceeded
    if (currentCount >= this.maxRequests) {
      return false;
    }
    
    // Increment count
    this.requestCounts.set(scriptId, currentCount + 1);
    return true;
  }
};
