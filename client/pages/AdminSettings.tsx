import { useState, useEffect } from "react";
import { WebhookSettings } from "@shared/webhooks";
import AdminAuth from "../components/AdminAuth";
import AdminLayout from "../components/AdminLayout";

export default function AdminSettings() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settings, setSettings] = useState<WebhookSettings | null>(null);
  const [formData, setFormData] = useState({
    webhook_url: '',
    webhook_secret: '',
    webhook_enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Check if already authenticated
    const authenticated = localStorage.getItem("admin_authenticated") === "true";
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setLoading(true);
    fetchSettings();
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/webhooks');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setFormData({
          webhook_url: data.webhook_url || '',
          webhook_secret: data.webhook_secret || '',
          webhook_enabled: data.webhook_enabled || false,
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage({ type: 'error', text: 'Erro ao carregar configurações' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/webhooks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setSettings(updatedData);
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Erro ao salvar configurações' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  if (loading) {
    return (
      <AdminLayout onLogout={handleLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <div className="space-y-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Configurações
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Configure webhooks e outras configurações do sistema
            </p>
          </div>
        </div>

        {/* Webhook Configuration */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Configurações de Webhook
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Configure o webhook que receberá as notificações quando um lead for capturado ou um consumidor for identificado.
            </p>

            <div className="space-y-6">
              {/* Webhook URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL do Webhook *
                </label>
                <input
                  type="url"
                  value={formData.webhook_url}
                  onChange={(e) => handleInputChange('webhook_url', e.target.value)}
                  placeholder="https://seu-webhook.com/leads"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  URL que receberá as notificações de leads e consumidores
                </p>
              </div>

              {/* Webhook Secret */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chave Secreta (Opcional)
                </label>
                <input
                  type="password"
                  value={formData.webhook_secret}
                  onChange={(e) => handleInputChange('webhook_secret', e.target.value)}
                  placeholder="chave-secreta-para-validacao"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Chave enviada no cabeçalho X-Webhook-Secret para validação
                </p>
              </div>

              {/* Webhook Enabled */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="webhook_enabled"
                  checked={formData.webhook_enabled}
                  onChange={(e) => handleInputChange('webhook_enabled', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="webhook_enabled" className="ml-2 block text-sm text-gray-900">
                  Habilitar webhook
                </label>
              </div>

              {/* Webhook Payload Example */}
              <div className="bg-gray-50 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Exemplo de Payload</h4>
                <pre className="text-xs text-gray-600 overflow-x-auto">
{`// Para lojista
{
  "event": "new_lead",
  "type": "lojista", 
  "data": {
    "name": "João Silva",
    "whatsapp": "(11) 99999-9999",
    "has_cnpj": "sim",
    "store_type": "fisica_online",
    "cep": "01234-567"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}

// Para consumidor  
{
  "event": "consumer_detected",
  "type": "consumidor",
  "data": {
    "name": "Maria Santos",
    "whatsapp": "(11) 88888-8888"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}`}
                </pre>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`mt-4 p-4 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Salvando...
                  </div>
                ) : (
                  'Salvar Configurações'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
