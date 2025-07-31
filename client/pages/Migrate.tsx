import { useState } from "react";

export default function Migrate() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleMigrate = async (endpoint: string, description: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({type: 'success', text: `${description}: ${data.message}`});
      } else {
        setMessage({type: 'error', text: data.error || 'Erro na migração'});
      }
    } catch (error) {
      console.error("Migration error:", error);
      setMessage({type: 'error', text: 'Erro ao conectar com o servidor'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Migração do Banco
        </h1>
        
        <p className="text-gray-600 text-center mb-8">
          Adiciona a coluna <code className="bg-gray-100 px-2 py-1 rounded">logo_image</code> na tabela para suportar uploads de logo.
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
            onClick={handleMigrate}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Migrando..." : "Executar Migração"}
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
