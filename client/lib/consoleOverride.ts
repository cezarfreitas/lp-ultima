// Override de console mais agressivo para suprimir warnings específicos

if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  const originalError = console.error;

  // Override para console.warn
  console.warn = function(...args: any[]) {
    const message = String(args[0] || '');
    
    // Filtrar warnings específicos do Recharts
    const shouldSuppress = 
      message.includes('Support for defaultProps will be removed') ||
      message.includes('defaultProps will be removed from function components') ||
      (message.includes('XAxis') && message.includes('defaultProps')) ||
      (message.includes('YAxis') && message.includes('defaultProps'));
    
    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };

  // Override para console.error (caso alguns warnings sejam tratados como erros)
  console.error = function(...args: any[]) {
    const message = String(args[0] || '');
    
    // Filtrar errors específicos do Recharts sobre defaultProps
    const shouldSuppress = 
      message.includes('Support for defaultProps will be removed') ||
      message.includes('defaultProps will be removed from function components');
    
    if (!shouldSuppress) {
      originalError.apply(console, args);
    }
  };
}
