import { useState } from "react";

export default function Migrate() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
        setMessage({
          type: "success",
          text: `${description}: ${data.message}`,
        });
      } else {
        setMessage({ type: "error", text: data.error || "Erro na migração" });
      }
    } catch (error) {
      console.error("Migration error:", error);
      setMessage({ type: "error", text: "Erro ao conectar com o servidor" });
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
          Execute as migrações necessárias para adicionar novas funcionalidades
          ao banco de dados.
        </p>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Upload de Logo</h3>
            <p className="text-sm text-gray-600 mb-3">
              Adiciona a coluna{" "}
              <code className="bg-gray-100 px-1 rounded">logo_image</code> para
              suportar upload de logos.
            </p>
            <button
              onClick={() => handleMigrate("/api/migrate-logo", "Logo")}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Migrando..." : "Migrar Logo"}
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              Configurações de Design
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Cria a tabela{" "}
              <code className="bg-gray-100 px-1 rounded">design_settings</code>{" "}
              para cores e fontes.
            </p>
            <button
              onClick={() => handleMigrate("/api/migrate-design", "Design")}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Migrando..." : "Migrar Design"}
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Sistema de Leads</h3>
            <p className="text-sm text-gray-600 mb-3">
              Cria a tabela <code className="bg-gray-100 px-1 rounded">leads</code> para captura de leads.
            </p>
            <button
              onClick={() => handleMigrate("/api/migrate-leads", "Leads")}
              disabled={loading}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Migrando..." : "Migrar Leads"}
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Webhooks e Textos do Formulário</h3>
            <p className="text-sm text-gray-600 mb-3">
              Cria as tabelas <code className="bg-gray-100 px-1 rounded">webhook_settings</code> e <code className="bg-gray-100 px-1 rounded">form_content</code> para configurações e textos editáveis.
            </p>
            <button
              onClick={() => handleMigrate("/api/migrate-new-tables", "Novas Tabelas")}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Migrando..." : "Migrar Novas Tabelas"}
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              Remover Limites de Caracteres
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Remove limites de caracteres de todos os campos de texto.
            </p>
            <button
              onClick={() => handleMigrate("/api/remove-limits", "Limites")}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Migrando..." : "Remover Limites"}
            </button>
          </div>

          {message?.type === "success" && (
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
