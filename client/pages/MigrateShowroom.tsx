import { useState } from "react";

export default function MigrateShowroom() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runMigration = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/migrate-showroom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Erro na migração");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Migração de Showroom
        </h1>

        <div className="space-y-4">
          <button
            onClick={runMigration}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Executando..." : "Executar Migração"}
          </button>

          {result && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              <h3 className="font-medium mb-2">Migração Concluída!</h3>
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <h3 className="font-medium mb-2">Erro na Migração</h3>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="text-center space-x-4">
            <a
              href="/admin/showroom"
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Ir para Admin de Showroom
            </a>
            <a
              href="/"
              className="text-gray-600 hover:text-gray-800 text-sm underline"
            >
              Voltar para Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
