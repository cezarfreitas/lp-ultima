import { useState, useEffect } from "react";

interface UploadSettingsProps {
  onSettingsChange?: (settings: UploadSettings) => void;
}

export interface UploadSettings {
  useMultiFormat: boolean;
  preferredFormat: 'thumbnail' | 'small' | 'medium' | 'large';
  autoMigration: boolean;
}

export default function UploadSettings({ onSettingsChange }: UploadSettingsProps) {
  const [settings, setSettings] = useState<UploadSettings>({
    useMultiFormat: false,
    preferredFormat: 'medium',
    autoMigration: false,
  });

  const [migrationStatus, setMigrationStatus] = useState<string>("");
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('upload_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        onSettingsChange?.(parsed);
      } catch (error) {
        console.error('Error loading upload settings:', error);
      }
    }
  }, [onSettingsChange]);

  const updateSettings = (newSettings: Partial<UploadSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('upload_settings', JSON.stringify(updated));
    onSettingsChange?.(updated);
  };

  const handleMigration = async () => {
    setMigrating(true);
    setMigrationStatus("Executando migração...");

    try {
      const response = await fetch("/api/migrate-multi-format", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setMigrationStatus("Migração executada com sucesso!");
        updateSettings({ useMultiFormat: true });
      } else {
        setMigrationStatus(`Erro na migração: ${data.error}`);
      }
    } catch (error) {
      setMigrationStatus(`Erro na migração: ${error}`);
    } finally {
      setMigrating(false);
    }
  };

  const testMultiFormat = async () => {
    try {
      const response = await fetch("/api/upload/multi-format", {
        method: "POST",
        body: new FormData(), // Empty form data just to test endpoint
      });

      if (response.status === 400) {
        // Expected error (no file), means endpoint exists
        setMigrationStatus("Sistema multi-formato disponível! ✅");
        return true;
      } else {
        setMigrationStatus("Sistema multi-formato não disponível");
        return false;
      }
    } catch (error) {
      setMigrationStatus("Sistema multi-formato não disponível");
      return false;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">⚙️ Configurações de Upload</h3>

      <div className="space-y-6">
        {/* System Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Status do Sistema</h4>
          
          <div className="flex gap-2">
            <button
              onClick={testMultiFormat}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200"
            >
              Testar Multi-Formato
            </button>
            
            <button
              onClick={handleMigration}
              disabled={migrating}
              className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm hover:bg-purple-200 disabled:opacity-50"
            >
              {migrating ? "Migrando..." : "Executar Migração"}
            </button>
          </div>

          {migrationStatus && (
            <div className={`text-sm p-2 rounded ${
              migrationStatus.includes("sucesso") || migrationStatus.includes("✅")
                ? "bg-green-50 text-green-700 border border-green-200"
                : migrationStatus.includes("Erro")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}>
              {migrationStatus}
            </div>
          )}
        </div>

        {/* Upload Mode */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Modo de Upload</h4>
          
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                checked={!settings.useMultiFormat}
                onChange={() => updateSettings({ useMultiFormat: false })}
                className="mr-2"
              />
              <span className="text-sm">Clássico (1 formato, compatível)</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                checked={settings.useMultiFormat}
                onChange={() => updateSettings({ useMultiFormat: true })}
                className="mr-2"
              />
              <span className="text-sm">Multi-formato (4 versões automáticas)</span>
            </label>
          </div>
        </div>

        {/* Preferred Format */}
        {settings.useMultiFormat && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Formato Preferido para URLs</h4>
            
            <select
              value={settings.preferredFormat}
              onChange={(e) => updateSettings({ 
                preferredFormat: e.target.value as UploadSettings['preferredFormat']
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="thumbnail">Thumbnail (150x150) - Miniaturas</option>
              <option value="small">Small (400x400) - Listagens</option>
              <option value="medium">Medium (800x800) - Galeria</option>
              <option value="large">Large (1200x1200) - Visualização</option>
            </select>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">ℹ️ Informações</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Clássico:</strong> Gera 1 imagem comprimida (compatível com sistema atual)</p>
            <p><strong>Multi-formato:</strong> Gera 4 versões otimizadas (thumbnail, small, medium, large)</p>
            <p><strong>Fallback:</strong> Se multi-formato falhar, usa o sistema clássico automaticamente</p>
          </div>
        </div>
      </div>
    </div>
  );
}
