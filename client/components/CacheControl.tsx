import { useState, useEffect } from "react";
import {
  clearAllCaches,
  clearApiCache,
  clearServiceWorkerCache,
  clearBrowserCache,
  getCacheStats,
  clearExpiredCache,
} from "../lib/cacheManager";

interface CacheStats {
  api: any;
  serviceWorker: any;
  localStorage: any;
  sessionStorage: any;
}

export default function CacheControl() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const cacheStats = await getCacheStats();
      setStats(cacheStats);
    } catch (error) {
      console.error("Failed to load cache stats:", error);
    }
  };

  const handleClearCache = async (type: string) => {
    setLoading(true);
    try {
      switch (type) {
        case "all":
          await clearAllCaches();
          break;
        case "api":
          await clearApiCache();
          break;
        case "sw":
          await clearServiceWorkerCache();
          break;
        case "browser":
          clearBrowserCache();
          break;
        case "expired":
          await clearExpiredCache();
          break;
      }

      // Reload stats after clearing (except for browser cache which reloads page)
      if (type !== "browser" && type !== "all") {
        await loadStats();
      }
    } catch (error) {
      console.error(`Failed to clear ${type} cache:`, error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Gerenciamento de Cache
        </h3>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={loading}
        >
          {loading ? "Carregando..." : "Atualizar"}
        </button>
      </div>

      {stats && (
        <div className="space-y-6">
          {/* Cache Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Cache da API</h4>
              <p className="text-sm text-gray-600">
                Entradas: {stats.api.size}
                <br />
                Storage: {stats.api.hasStorage ? "Ativo" : "Desabilitado"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">
                Service Worker
              </h4>
              <p className="text-sm text-gray-600">
                Status:{" "}
                {stats.serviceWorker.supported ? "Suportado" : "Não suportado"}
                <br />
                Caches: {stats.serviceWorker.caches.length}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">
                Local Storage
              </h4>
              <p className="text-sm text-gray-600">
                Status:{" "}
                {stats.localStorage.supported ? "Ativo" : "Não suportado"}
                <br />
                Tamanho: {formatBytes(stats.localStorage.size)}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">
                Session Storage
              </h4>
              <p className="text-sm text-gray-600">
                Status:{" "}
                {stats.sessionStorage.supported ? "Ativo" : "Não suportado"}
                <br />
                Tamanho: {formatBytes(stats.sessionStorage.size)}
              </p>
            </div>
          </div>

          {/* Cache Control Buttons */}
          <div className="border-t pt-6">
            <h4 className="font-semibold text-gray-700 mb-4">Ações de Cache</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                onClick={() => handleClearCache("expired")}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                disabled={loading}
              >
                Limpar Expirados
              </button>

              <button
                onClick={() => handleClearCache("api")}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                disabled={loading}
              >
                Limpar API Cache
              </button>

              <button
                onClick={() => handleClearCache("sw")}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                disabled={loading}
              >
                Limpar Imagens/SW
              </button>

              <button
                onClick={() => handleClearCache("browser")}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                disabled={loading}
              >
                Limpar Browser
              </button>

              <button
                onClick={() => handleClearCache("all")}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors sm:col-span-2"
                disabled={loading}
              >
                Limpar Tudo + Recarregar
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            <p className="font-semibold mb-2">💡 Dicas:</p>
            <ul className="space-y-1">
              <li>
                • <strong>Limpar Expirados</strong>: Remove apenas dados antigos
              </li>
              <li>
                • <strong>API Cache</strong>: Limpa dados do localStorage (hero,
                form, etc.)
              </li>
              <li>
                • <strong>Imagens/SW</strong>: Limpa cache de imagens e assets
              </li>
              <li>
                • <strong>Browser</strong>: Força reload completo da página
              </li>
              <li>
                • <strong>Limpar Tudo</strong>: Remove todos os caches e
                recarrega
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
