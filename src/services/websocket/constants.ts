
// WebSocket connection constants
export const WS_RECONNECT_ATTEMPTS = 5;
export const WS_CONNECTION_TIMEOUT = 5000; // 5 seconds
export const WS_HEARTBEAT_INTERVAL = 30000; // 30 seconds
export const WS_MAX_MESSAGE_SIZE = 100000; // 100KB

// Message types
export enum MessageType {
  HEARTBEAT = 'heartbeat',
  LOG = 'log',
  OUTPUT = 'output',
  VISUALIZATION = 'visualization',
  EXECUTION_STATUS = 'execution_status', 
  SECURITY_VIOLATION = 'security_violation',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  EXECUTE_SCRIPT = 'execute_script'
}

// Supported script languages
export enum ScriptLanguage {
  PYTHON = 'python',
  R = 'r',
  JULIA = 'julia',
  JAVASCRIPT = 'javascript',
  BASH = 'bash'
}

// Supported bioinformatics tools
export const SUPPORTED_TOOLS = [
  'FastQC', 'MultiQC', 'Trimmomatic', 'Cutadapt', 'fastp', 
  'BWA', 'Bowtie2', 'HISAT2', 'STAR', 'SAMtools', 
  'Picard', 'GATK', 'FreeBayes', 'bcftools', 'VEP', 
  'ANNOVAR', 'SnpEff', 'HTseq', 'featureCounts', 
  'DESeq2', 'edgeR', 'Snakemake', 'Nextflow'
];

// Resource limits by language
export const LANGUAGE_RESOURCE_LIMITS = {
  [ScriptLanguage.PYTHON]: {
    timeoutSeconds: 300,
    memoryLimitMB: 512,
    maxLoopIterations: 1000000
  },
  [ScriptLanguage.R]: {
    timeoutSeconds: 600,
    memoryLimitMB: 1024,
    maxLoopIterations: 500000
  },
  [ScriptLanguage.JULIA]: {
    timeoutSeconds: 300,
    memoryLimitMB: 1024,
    maxLoopIterations: 1000000
  },
  [ScriptLanguage.JAVASCRIPT]: {
    timeoutSeconds: 120,
    memoryLimitMB: 256,
    maxLoopIterations: 1000000
  },
  [ScriptLanguage.BASH]: {
    timeoutSeconds: 60,
    memoryLimitMB: 128,
    maxLoopIterations: 10000
  }
};
