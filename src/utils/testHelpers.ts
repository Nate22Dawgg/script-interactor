
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
 * Implements just enough of the WebSocket interface for testing
 */
export class MockWebSocket {
  url: string;
  readyState: number = WebSocket.CONNECTING;
  onopen: ((ev: Event) => any) | null = null;
  onclose: ((ev: CloseEvent) => any) | null = null;
  onmessage: ((ev: MessageEvent) => any) | null = null;
  onerror: ((ev: Event) => any) | null = null;
  
  // Adding required WebSocket properties to satisfy TypeScript
  binaryType: BinaryType = 'blob';
  bufferedAmount: number = 0;
  extensions: string = '';
  protocol: string = '';
  
  private messages: any[] = [];
  
  constructor(url: string) {
    this.url = url;
    
    // Simulate connection
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        const event = new Event('open');
        this.onopen(event);
      }
    }, 100);
  }
  
  send(data: string): void {
    this.messages.push(JSON.parse(data));
  }
  
  close(code?: number, reason?: string): void {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      const event = new CloseEvent('close', {
        code: code || 1000,
        reason: reason || '',
        wasClean: true
      });
      this.onclose(event);
    }
  }
  
  // Helper methods for tests
  
  /**
   * Simulate receiving a message
   */
  simulateMessage(data: any): void {
    if (this.onmessage) {
      const event = new MessageEvent('message', {
        data: JSON.stringify(data)
      });
      this.onmessage(event);
    }
  }
  
  /**
   * Simulate an error
   */
  simulateError(): void {
    if (this.onerror) {
      const event = new Event('error');
      this.onerror(event);
    }
  }
  
  /**
   * Get sent messages for verification
   */
  getSentMessages(): any[] {
    return this.messages;
  }
  
  // Implementing missing WebSocket methods to satisfy TypeScript
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
    // Simple implementation for testing
    if (typeof listener === 'function') {
      if (type === 'open') this.onopen = listener;
      if (type === 'close') this.onclose = listener as (ev: CloseEvent) => any;
      if (type === 'message') this.onmessage = listener as (ev: MessageEvent) => any;
      if (type === 'error') this.onerror = listener;
    }
  }
  
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void {
    // Simple implementation for testing
    if (typeof listener === 'function') {
      if (type === 'open' && this.onopen === listener) this.onopen = null;
      if (type === 'close' && this.onclose === listener) this.onclose = null;
      if (type === 'message' && this.onmessage === listener) this.onmessage = null;
      if (type === 'error' && this.onerror === listener) this.onerror = null;
    }
  }
  
  dispatchEvent(event: Event): boolean {
    return true; // Minimal implementation
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
