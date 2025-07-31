import { useState } from "react";

interface MigrationStatus {
  name: string;
  endpoint: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
}

export default function SetupComplete() {
  const [migrations, setMigrations] = useState<MigrationStatus[]>([
    { name: "Showroom", endpoint: "/api/migrate-showroom", status: 'pending', message: '' },
    { name: "FAQ", endpoint: "/api/migrate-faq", status: 'pending', message: '' },
    { name: "Testimonials", endpoint: "/api/migrate-testimonials", status: 'pending', message: '' },
    { name: "About", endpoint: "/api/migrate-about", status: 'pending', message: '' },
    { name: "Footer", endpoint: "/api/migrate-footer", status: 'pending', message: '' },
    { name: "SEO", endpoint: "/api/migrate-seo", status: 'pending', message: '' },
    { name: "Pixels", endpoint: "/api/migrate-pixels", status: 'pending', message: '' }
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const runAllMigrations = async () => {
    setIsRunning(true);

    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      
      // Update status to running
      setMigrations(prev => prev.map((m, index) => 
        index === i ? { ...m, status: 'running', message: 'Executando...' } : m
      ));

      try {
        const response = await fetch(migration.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (data.success) {
          setMigrations(prev => prev.map((m, index) => 
            index === i ? { ...m, status: 'success', message: data.message || 'Sucesso!' } : m
          ));
        } else {
          setMigrations(prev => prev.map((m, index) => 
            index === i ? { ...m, status: 'error', message: data.error || 'Erro desconhecido' } : m
          ));
        }
      } catch (error) {
        setMigrations(prev => prev.map((m, index) => 
          index === i ? { 
            ...m, 
            status: 'error', 
            message: error instanceof Error ? error.message : 'Erro de conexão' 
          } : m
        ));
      }

      // Wait a bit between migrations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: MigrationStatus['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'running':
        return '🔄';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusColor = (status: MigrationStatus['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-600';
      case 'running':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Setup Completo da Aplicação
        </h1>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              🚀 Configuração de SEO e Migração Completa
            </h2>
            <p className="text-blue-800 mb-4">
              Este processo executará todas as migrações necessárias para configurar completamente 
              a aplicação, incluindo a nova otimização de SEO com foco em "Seja um Lojista Oficial Ecko".
            </p>
            <ul className="list-disc list-inside space-y-2 text-blue-800">
              <li>Migração do Showroom (sem categorias)</li>
              <li>Migração do FAQ</li>
              <li>Migração dos Testimonials</li>
              <li>Migração da seção About</li>
              <li>Migração do Footer</li>
              <li><strong>Migração do SEO (NOVO)</strong> - Otimizado para "Seja um Lojista Oficial Ecko"</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status das Migrações:
            </h3>
            
            <div className="space-y-3">
              {migrations.map((migration, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getStatusIcon(migration.status)}</span>
                    <span className="font-medium text-gray-900">{migration.name}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${getStatusColor(migration.status)}`}>
                      {migration.status === 'pending' ? 'Aguardando' : 
                       migration.status === 'running' ? 'Executando...' :
                       migration.status === 'success' ? 'Concluído' : 'Erro'}
                    </span>
                    {migration.message && (
                      <p className={`text-xs mt-1 ${getStatusColor(migration.status)}`}>
                        {migration.message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={runAllMigrations}
              disabled={isRunning}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? "🔄 Executando Migrações..." : "🚀 Executar Setup Completo"}
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Voltar
            </button>
          </div>

          {migrations.every(m => m.status === 'success') && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Setup Completo!
                  </h3>
                  <p className="text-green-800">
                    Todas as migrações foram executadas com sucesso. A aplicação está 
                    otimizada para SEO com foco em "Seja um Lojista Oficial Ecko".
                  </p>
                  <div className="mt-4">
                    <a 
                      href="/admin/seo" 
                      className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Gerenciar SEO
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
