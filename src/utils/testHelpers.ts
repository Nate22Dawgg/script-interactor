
import { Script, Parameter } from '../lib/types';

/**
 * Create a test script for use in tests
 */
export const createTestScript = (overrides = {}): Script => {
  return {
    id: `test-script-${Date.now()}`,
    name: 'Test Script',
    description: 'A script created for testing purposes',
    code: 'print("Hello, world!")',
    language: 'python',
    dateCreated: new Date().toISOString(),
    status: 'idle',
    logs: [],
    visualizations: [],
    parameters: [
      {
        id: 'test-param-1',
        name: 'input_value',
        type: 'string',
        default: 'test',
        description: 'A test parameter',
        required: true
      }
    ],
    ...overrides
  };
};

/**
 * Mock WebSocket for testing WebSocket functionality
 */
export class MockWebSocket {
  url: string;
  readyState: number = WebSocket.CONNECTING;
  onopen: ((this: WebSocket, ev: Event) => any) | null = null;
  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
  onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;
  onerror: ((this: WebSocket, ev: Event) => any) | null = null;
  
  private messages: any[] = [];
  
  constructor(url: string) {
    this.url = url;
    
    // Simulate connection
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 100);
  }
  
  send(data: string): void {
    this.messages.push(JSON.parse(data));
  }
  
  close(): void {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }
  
  // Helper methods for tests
  
  /**
   * Simulate receiving a message
   */
  simulateMessage(data: any): void {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', {
        data: JSON.stringify(data)
      }));
    }
  }
  
  /**
   * Simulate an error
   */
  simulateError(): void {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }
  
  /**
   * Get sent messages for verification
   */
  getSentMessages(): any[] {
    return this.messages;
  }
}

/**
 * Generate test parameters for a script
 */
export const createTestParameters = (count: number = 3): Parameter[] => {
  const paramTypes: ('string' | 'number' | 'boolean')[] = ['string', 'number', 'boolean'];
  
  return Array.from({ length: count }).map((_, index) => {
    const type = paramTypes[index % paramTypes.length];
    let defaultValue: any;
    
    switch (type) {
      case 'string':
        defaultValue = `test-value-${index}`;
        break;
      case 'number':
        defaultValue = index * 10;
        break;
      case 'boolean':
        defaultValue = index % 2 === 0;
        break;
    }
    
    return {
      id: `test-param-${index}`,
      name: `param_${index}`,
      type,
      default: defaultValue,
      description: `Test parameter ${index}`,
      required: index % 2 === 0
    };
  });
};

/**
 * Helper to validate that a script security scan is working correctly
 */
export const testScriptSecurityScan = (code: string): { passed: boolean, reason?: string } => {
  // Test for known dangerous patterns
  const dangerousPatterns = [
    { pattern: /import\s+os/i, reason: 'imports os module' },
    { pattern: /import\s+subprocess/i, reason: 'imports subprocess module' },
    { pattern: /open\s*\(/i, reason: 'uses open() function' },
    { pattern: /eval\s*\(/i, reason: 'uses eval() function' },
    { pattern: /exec\s*\(/i, reason: 'uses exec() function' },
    { pattern: /__import__\s*\(/i, reason: 'uses __import__() function' },
    { pattern: /while\s+True.*?(?!break|return|exit)/is, reason: 'contains potential infinite loop' }
  ];
  
  for (const { pattern, reason } of dangerousPatterns) {
    if (pattern.test(code)) {
      return { passed: false, reason };
    }
  }
  
  return { passed: true };
};
