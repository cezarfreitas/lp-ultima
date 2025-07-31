import { useState } from "react";

export default function InitDB() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleInitialize = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/init-db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Check if response has content to read
      const contentType = response.headers.get('content-type');
      let data = null;

      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          // If JSON parsing fails, use default response
          data = null;
        }
      }

      if (response.ok) {
        setMessage({type: 'success', text: 'Banco de dados inicializado com sucesso!'});
      } else {
        setMessage({type: 'error', text: data?.error || 'Erro ao inicializar banco'});
      }
    } catch (error) {
      console.error("Error initializing database:", error);
      setMessage({type: 'error', text: 'Erro ao conectar com o servidor'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Inicializar Banco de Dados
        </h1>
        
        <p className="text-gray-600 text-center mb-8">
          Clique no botão abaixo para criar as tabelas necessárias no banco de dados MySQL.
        </p>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleInitialize}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Inicializando..." : "Inicializar Banco"}
          </button>

          {message?.type === 'success' && (
            <a
              href="/admin"
              className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 text-center transition-colors"
            >
              Ir para o Admin
            </a>
          )}

          <a
            href="/"
            className="block w-full text-center text-indigo-600 hover:text-indigo-700 py-2"
          >
            ← Voltar para a homepage
          </a>
        </div>
      </div>
    </div>
  );
}
