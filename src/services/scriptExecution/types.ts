
export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

export interface RateLimiterConfig {
  maxRequests: number;
  resetInterval: number;
}

export interface NGSScriptConfig {
  // NGS-specific configuration
  referenceGenome?: string;
  minReadLength?: number;
  maxReadLength?: number;
  qualityThreshold?: number;
  adapterSequences?: string[];
  threadCount?: number;
}

export interface ResourceLimits {
  memoryMB: number;
  cpuMillicores: number;
  diskMB: number;
  timeoutSeconds: number;
}
