import { useState, useEffect } from "react";
import AdminAuth from "../components/AdminAuth";
import AdminLayout from "../components/AdminLayout";
import CacheControl from "../components/CacheControl";

export default function AdminCache() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDeveloperMode, setShowDeveloperMode] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const authenticated =
      localStorage.getItem("admin_authenticated") === "true";
    setIsAuthenticated(authenticated);
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
  };

  return (
    <AdminLayout title="Gerenciamento de Cache" onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Main Cache Control */}
        <CacheControl />

        {/* Developer Mode Toggle */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-700">
                Modo Desenvolvedor
              </h3>
              <p className="text-sm text-gray-600">
                Mostra comandos do console e informações técnicas
              </p>
            </div>
            <button
              onClick={() => setShowDeveloperMode(!showDeveloperMode)}
              className={`px-4 py-2 rounded transition-colors ${
                showDeveloperMode
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
            >
              {showDeveloperMode ? "Ativo" : "Inativo"}
            </button>
          </div>
        </div>

        {/* Developer Information */}
        {showDeveloperMode && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <h4 className="text-white font-bold mb-3">
              🔧 Comandos do Console
            </h4>
            <div className="space-y-2">
              <div>
                <span className="text-yellow-400">clearAllCaches()</span>
                <span className="text-gray-400"> - Limpa todos os caches</span>
              </div>
              <div>
                <span className="text-yellow-400">clearApiCache()</span>
                <span className="text-gray-400"> - Limpa cache da API</span>
              </div>
              <div>
                <span className="text-yellow-400">
                  clearServiceWorkerCache()
                </span>
                <span className="text-gray-400"> - Limpa cache SW</span>
              </div>
              <div>
                <span className="text-yellow-400">clearBrowserCache()</span>
                <span className="text-gray-400"> - Força reload</span>
              </div>
              <div>
                <span className="text-yellow-400">getCacheStats()</span>
                <span className="text-gray-400"> - Mostra estatísticas</span>
              </div>
              <div>
                <span className="text-yellow-400">clearExpiredCache()</span>
                <span className="text-gray-400"> - Limpa apenas expirados</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <h5 className="text-white font-bold mb-2">📋 Exemplo de Uso:</h5>
              <div className="bg-black p-2 rounded text-xs">
                <div className="text-gray-400">// Verificar estatísticas</div>
                <div>getCacheStats().then(console.log)</div>
                <div className="text-gray-400 mt-2">// Limpar tudo</div>
                <div>clearAllCaches()</div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-3">
            🚀 Dicas de Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">Quando Limpar Cache:</h4>
              <ul className="space-y-1">
                <li>• Após atualizar conteúdo no admin</li>
                <li>• Quando imagens não aparecem</li>
                <li>• Para testar mudanças</li>
                <li>• Se a página carrega lenta</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Benefícios do Cache:</h4>
              <ul className="space-y-1">
                <li>• Página 80% mais rápida na 2ª visita</li>
                <li>• Imagens carregam instantaneamente</li>
                <li>• Menos uso de dados móveis</li>
                <li>• Melhor experiência offline</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
