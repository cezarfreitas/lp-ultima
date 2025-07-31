// Utilitário para suprimir warnings específicos e conhecidos de bibliotecas externas

const suppressKnownWarnings = () => {
  const originalConsoleWarn = console.warn;

  console.warn = (...args) => {
    const message = args[0];

    // Suprimir warnings específicos do Recharts sobre defaultProps
    if (typeof message === "string") {
      const isRechartsDefaultPropsWarning =
        message.includes("Support for defaultProps will be removed") &&
        (message.includes("XAxis") ||
          message.includes("YAxis") ||
          message.includes("CartesianGrid") ||
          message.includes("Tooltip") ||
          message.includes("Legend"));

      if (isRechartsDefaultPropsWarning) {
        return; // Não exibir este warning
      }
    }

    // Exibir todos os outros warnings normalmente
    originalConsoleWarn.apply(console, args);
  };
};

// Executar apenas em desenvolvimento
if (process.env.NODE_ENV === "development") {
  suppressKnownWarnings();
}

export { suppressKnownWarnings };
