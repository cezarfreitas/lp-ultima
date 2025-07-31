import { useState } from "react";

export default function MigrateSEO() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const runMigration = async () => {
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/migrate-seo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setMessage("Migração de SEO executada com sucesso!");
      } else {
        setError(data.error || "Erro desconhecido na migração");
      }
    } catch (err) {
      console.error("Migration error:", err);
      setError(
        "Erro ao executar migração: " +
          (err instanceof Error ? err.message : "Erro desconhecido"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Migração de SEO
        </h1>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              O que esta migração faz:
            </h2>
            <ul className="list-disc list-inside space-y-2 text-blue-800">
              <li>
                Cria a tabela <code>seo_data</code> para gerenciar metadados SEO
              </li>
              <li>
                Insere dados padrão otimizados para "Seja um Lojista Oficial
                Ecko"
              </li>
              <li>
                Configura meta tags para redes sociais (Open Graph e Twitter)
              </li>
              <li>Define configurações de robots e estrutura de dados</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              ⚠️ Importante:
            </h3>
            <p className="text-yellow-800">
              Esta migração é segura e pode ser executada múltiplas vezes. Se os
              dados já existirem, não serão sobrescritos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={runMigration}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Executando..." : "Executar Migração de SEO"}
            </button>

            <button
              onClick={() => window.history.back()}
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Voltar
            </button>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">{message}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
