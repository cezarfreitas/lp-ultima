// Supressão imediata de warnings conhecidos do Recharts
(() => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === "development") {
    const originalConsoleWarn = console.warn;

    console.warn = (...args) => {
      const message = args[0];

      // Suprimir warnings específicos do Recharts sobre defaultProps
      if (typeof message === "string") {
        // Padrão mais específico para capturar os warnings do Recharts
        if (message.includes("Support for defaultProps will be removed from function components") &&
            (message.includes("XAxis") ||
             message.includes("YAxis") ||
             message.includes("CartesianGrid") ||
             message.includes("Tooltip") ||
             message.includes("Legend") ||
             message.includes("Line") ||
             message.includes("ResponsiveContainer"))) {
          return; // Não exibir este warning
        }
      }

      // Exibir todos os outros warnings normalmente
      originalConsoleWarn.apply(console, args);
    };
  }
})();
