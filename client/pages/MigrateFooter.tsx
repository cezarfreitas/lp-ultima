import { useState } from "react";

export default function MigrateFooter() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMigrate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/migrate-footer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      console.error('Migration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Migração de Footer
          </h1>
          
          <p className="text-gray-600 mb-6">
            Esta migração criará as tabelas necessárias para o sistema de footer e 
            adicionará dados padrão se as tabelas estiverem vazias.
          </p>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Tabelas que serão criadas:
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">footer_section</code> - Configurações do rodapé</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">footer_links</code> - Links do rodapé</li>
            </ul>
          </div>

          <div className="mt-8">
            <button
              onClick={handleMigrate}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              {loading ? 'Executando migração...' : 'Executar Migração'}
            </button>
          </div>

          {loading && (
            <div className="mt-4 flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Processando...</span>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-sm font-medium text-red-800 mb-2">Erro na Migração</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="text-sm font-medium text-green-800 mb-2">
                Migração Concluída com Sucesso!
              </h3>
              <div className="text-sm text-green-700">
                <p className="mb-2">{result.message}</p>
                {result.tables && (
                  <div>
                    <p className="font-medium">Tabelas criadas:</p>
                    <ul className="list-disc list-inside mt-1">
                      {result.tables.map((table: string) => (
                        <li key={table} className="font-mono">{table}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.defaultData && (
                  <p className="mt-2">
                    <span className="font-medium">Dados padrão:</span> {result.defaultData}
                  </p>
                )}
              </div>
            </div>
          )}

          {result && (
            <div className="mt-6 flex space-x-4">
              <a
                href="/admin/footer"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Ir para Admin Footer
              </a>
              <a
                href="/admin"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Voltar ao Admin
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
