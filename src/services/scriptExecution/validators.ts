
// Python script validation
export const validatePythonScript = (code: string, issues: string[]) => {
  // Check for potentially dangerous imports
  const dangerousImports = [
    'os.system', 'subprocess.', 'eval(', 'exec(', '__import__', 
    'importlib', 'pickle.', 'marshal.', 'open(', 'file(', 
    'requests.', 'urllib.', 'socket.'
  ];
  
  dangerousImports.forEach(imp => {
    if (code.includes(imp)) {
      issues.push(`Contains potentially unsafe operation: ${imp}`);
    }
  });
  
  // Check for infinite loops (simplistic approach)
  if ((code.includes('while True') || code.includes('while 1')) && 
      !code.includes('break') && !code.includes('return')) {
    issues.push('Contains potential infinite loop');
  }
  
  // Check for excessive resource usage
  if (code.includes('range(') && !code.includes('len(')) {
    const rangeMatches = code.match(/range\s*\(\s*(\d+)/g);
    if (rangeMatches) {
      rangeMatches.forEach(match => {
        const numberMatch = match.match(/\d+/);
        if (numberMatch && parseInt(numberMatch[0]) > 1000000) {
          issues.push('Contains very large range operation');
        }
      });
    }
  }
};

// R script validation
export const validateRScript = (code: string, issues: string[]) => {
  // Check for potentially dangerous operations in R
  const dangerousOperations = [
    'system(', 'shell(', 'eval(parse', 'source(', 
    'install.packages(', 'library(parallel)', 'socket'
  ];
  
  dangerousOperations.forEach(op => {
    if (code.includes(op)) {
      issues.push(`Contains potentially unsafe operation: ${op}`);
    }
  });
  
  // Check for infinite loops
  if ((code.includes('while(TRUE)') || code.includes('while (TRUE)')) && 
      !code.includes('break') && !code.includes('return')) {
    issues.push('Contains potential infinite loop');
  }
};

// Julia script validation
export const validateJuliaScript = (code: string, issues: string[]) => {
  // Check for potentially dangerous operations in Julia
  const dangerousOperations = [
    'run(', 'eval(', 'include(', 'import', 'using Distributed', 
    'open(', 'download(', 'connect('
  ];
  
  dangerousOperations.forEach(op => {
    if (code.includes(op)) {
      issues.push(`Contains potentially unsafe operation: ${op}`);
    }
  });
  
  // Check for infinite loops
  if ((code.includes('while true') || code.includes('while (true)')) && 
      !code.includes('break') && !code.includes('return')) {
    issues.push('Contains potential infinite loop');
  }
};

// JavaScript script validation
export const validateJavaScriptScript = (code: string, issues: string[]) => {
  // Check for potentially dangerous operations in JavaScript
  const dangerousOperations = [
    'eval(', 'Function(', 'setTimeout(', 'setInterval(', 
    'require(', 'process.', 'window.', 'document.'
  ];
  
  dangerousOperations.forEach(op => {
    if (code.includes(op)) {
      issues.push(`Contains potentially unsafe operation: ${op}`);
    }
  });
  
  // Check for infinite loops
  if ((code.includes('while(true)') || code.includes('while (true)')) && 
      !code.includes('break') && !code.includes('return')) {
    issues.push('Contains potential infinite loop');
  }
};

// Bash script validation
export const validateBashScript = (code: string, issues: string[]) => {
  // Check for potentially dangerous operations in Bash
  const dangerousOperations = [
    'rm -rf', 'mkfs', 'dd', '> /dev/', '| sh', 
    'curl | bash', 'wget | sh', 'sudo'
  ];
  
  dangerousOperations.forEach(op => {
    if (code.includes(op)) {
      issues.push(`Contains potentially unsafe operation: ${op}`);
    }
  });
  
  // Check for infinite loops
  if ((code.includes('while true') || code.includes('while :')) && 
      !code.includes('break') && !code.includes('exit')) {
    issues.push('Contains potential infinite loop');
  }
};
