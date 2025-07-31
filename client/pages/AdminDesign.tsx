import { useState, useEffect } from "react";
import { DesignSettings, DesignUpdateRequest, AVAILABLE_FONTS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS_OPTIONS } from "@shared/design";
import AdminAuth from "../components/AdminAuth";
import AdminLayout from "../components/AdminLayout";

export default function AdminDesign() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [designData, setDesignData] = useState<DesignSettings | null>(null);
  const [formData, setFormData] = useState<DesignUpdateRequest>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    // Check if already authenticated
    const authenticated = localStorage.getItem("admin_authenticated") === "true";
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      fetchDesignData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setLoading(true);
    fetchDesignData();
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
  };

  const fetchDesignData = async () => {
    try {
      const response = await fetch("/api/design");
      if (response.ok) {
        const data = await response.json();
        setDesignData(data);
        setFormData({
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          accent_color: data.accent_color,
          background_color: data.background_color,
          text_color: data.text_color,
          font_family: data.font_family,
          font_size_base: data.font_size_base,
          font_weight_normal: data.font_weight_normal,
          font_weight_bold: data.font_weight_bold,
          border_radius: data.border_radius,
        });
      }
    } catch (error) {
      console.error("Error fetching design data:", error);
      setMessage({type: 'error', text: 'Erro ao carregar dados'});
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/design", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Check if response has content to read
      const contentType = response.headers.get('content-type');
      
      if (response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const responseData = await response.json();
          setDesignData(responseData);
        }
        setMessage({type: 'success', text: 'Configurações salvas com sucesso!'});
      } else {
        let errorMessage = 'Erro ao salvar configurações';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // If JSON parsing fails, use default message
          }
        }
        
        setMessage({type: 'error', text: errorMessage});
      }
    } catch (error) {
      console.error("Error updating design data:", error);
      setMessage({type: 'error', text: 'Erro ao salvar configurações'});
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof DesignUpdateRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  if (loading) {
    return (
      <AdminLayout onLogout={handleLogout}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-8 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cores & Fontes</h1>
          <p className="text-gray-600">Personalize a aparência visual do site</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Colors Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">🎨 Cores</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Primary Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Principal
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.primary_color || '#dc2626'}
                    onChange={(e) => handleInputChange('primary_color', e.target.value)}
                    className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primary_color || '#dc2626'}
                    onChange={(e) => handleInputChange('primary_color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="#dc2626"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Secundária
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.secondary_color || '#6b7280'}
                    onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                    className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondary_color || '#6b7280'}
                    onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="#6b7280"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor de Destaque
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.accent_color || '#000000'}
                    onChange={(e) => handleInputChange('accent_color', e.target.value)}
                    className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.accent_color || '#000000'}
                    onChange={(e) => handleInputChange('accent_color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor de Fundo
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.background_color || '#ffffff'}
                    onChange={(e) => handleInputChange('background_color', e.target.value)}
                    className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.background_color || '#ffffff'}
                    onChange={(e) => handleInputChange('background_color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor do Texto
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.text_color || '#000000'}
                    onChange={(e) => handleInputChange('text_color', e.target.value)}
                    className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.text_color || '#000000'}
                    onChange={(e) => handleInputChange('text_color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">📝 Tipografia</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Família da Fonte
                </label>
                <select
                  value={formData.font_family || 'Inter'}
                  onChange={(e) => handleInputChange('font_family', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {AVAILABLE_FONTS.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamanho Base
                </label>
                <select
                  value={formData.font_size_base || '16px'}
                  onChange={(e) => handleInputChange('font_size_base', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {FONT_SIZES.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              {/* Font Weight Normal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso Normal
                </label>
                <select
                  value={formData.font_weight_normal || '400'}
                  onChange={(e) => handleInputChange('font_weight_normal', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {FONT_WEIGHTS.map(weight => (
                    <option key={weight} value={weight}>{weight} - {weight === '300' ? 'Light' : weight === '400' ? 'Normal' : weight === '500' ? 'Medium' : weight === '600' ? 'Semi Bold' : weight === '700' ? 'Bold' : weight === '800' ? 'Extra Bold' : 'Black'}</option>
                  ))}
                </select>
              </div>

              {/* Font Weight Bold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso Negrito
                </label>
                <select
                  value={formData.font_weight_bold || '700'}
                  onChange={(e) => handleInputChange('font_weight_bold', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {FONT_WEIGHTS.map(weight => (
                    <option key={weight} value={weight}>{weight} - {weight === '300' ? 'Light' : weight === '400' ? 'Normal' : weight === '500' ? 'Medium' : weight === '600' ? 'Semi Bold' : weight === '700' ? 'Bold' : weight === '800' ? 'Extra Bold' : 'Black'}</option>
                  ))}
                </select>
              </div>

              {/* Border Radius */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raio da Borda
                </label>
                <select
                  value={formData.border_radius || '8px'}
                  onChange={(e) => handleInputChange('border_radius', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {BORDER_RADIUS_OPTIONS.map(radius => (
                    <option key={radius} value={radius}>{radius} - {radius === '0px' ? 'Quadrado' : radius === '4px' ? 'Leve' : radius === '8px' ? 'Suave' : radius === '12px' ? 'Médio' : radius === '16px' ? 'Arredondado' : 'Muito Arredondado'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">👁️ Preview</h2>
            
            <div 
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg"
              style={{
                backgroundColor: formData.background_color || '#ffffff',
                fontFamily: formData.font_family || 'Inter',
                fontSize: formData.font_size_base || '16px',
                borderRadius: formData.border_radius || '8px'
              }}
            >
              <h3 
                style={{ 
                  color: formData.primary_color || '#dc2626',
                  fontWeight: formData.font_weight_bold || '700'
                }}
                className="text-2xl mb-4"
              >
                Título Principal
              </h3>
              <p 
                style={{ 
                  color: formData.text_color || '#000000',
                  fontWeight: formData.font_weight_normal || '400'
                }}
                className="mb-4"
              >
                Este é um exemplo de como o texto ficará com as configurações atuais.
              </p>
              <button
                style={{
                  backgroundColor: formData.primary_color || '#dc2626',
                  color: formData.background_color || '#ffffff',
                  borderRadius: formData.border_radius || '8px'
                }}
                className="px-4 py-2"
              >
                Botão de Exemplo
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
