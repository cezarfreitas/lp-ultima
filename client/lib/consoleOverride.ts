// Override de console para suprimir warnings conhecidos do Recharts

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;

  console.warn = function(message: any, ...args: any[]) {
    const messageStr = String(message || '');

    // Lista de padrões de warnings para suprimir
    const suppressPatterns = [
      'Support for defaultProps will be removed',
      'defaultProps will be removed from function components',
    ];

    // Lista de componentes Recharts que geram estes warnings
    const rechartsComponents = [
      'XAxis', 'YAxis', 'CartesianGrid', 'Tooltip',
      'Legend', 'Line', 'ResponsiveContainer', 'LineChart'
    ];

    // Verificar se é um warning do Recharts que devemos suprimir
    const isRechartsWarning = suppressPatterns.some(pattern =>
      messageStr.includes(pattern)
    ) && rechartsComponents.some(component =>
      messageStr.includes(component) || args.some(arg => String(arg).includes(component))
    );

    // Se não for um warning do Recharts sobre defaultProps, exibir normalmente
    if (!isRechartsWarning) {
      originalWarn.apply(console, [message, ...args]);
    }
  };
}
