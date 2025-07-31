import { useState, useEffect } from "react";
import { FormContent } from "@shared/form-content";
import AdminAuth from "../components/AdminAuth";
import AdminLayout from "../components/AdminLayout";

export default function AdminFormContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [content, setContent] = useState<FormContent | null>(null);
  const [formData, setFormData] = useState({
    main_title: '',
    main_subtitle: '',
    form_title: '',
    form_subtitle: '',
    benefit1_title: '',
    benefit1_description: '',
    benefit2_title: '',
    benefit2_description: '',
    benefit3_title: '',
    benefit3_description: '',
    benefit4_title: '',
    benefit4_description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Check if already authenticated
    const authenticated = localStorage.getItem("admin_authenticated") === "true";
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      fetchContent();
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setLoading(true);
    fetchContent();
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
  };

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/form-content');
      if (response.ok) {
        const data = await response.json();
        setContent(data);
        setFormData({
          main_title: data.main_title || '',
          main_subtitle: data.main_subtitle || '',
          form_title: data.form_title || '',
          form_subtitle: data.form_subtitle || '',
          benefit1_title: data.benefit1_title || '',
          benefit1_description: data.benefit1_description || '',
          benefit2_title: data.benefit2_title || '',
          benefit2_description: data.benefit2_description || '',
          benefit3_title: data.benefit3_title || '',
          benefit3_description: data.benefit3_description || '',
          benefit4_title: data.benefit4_title || '',
          benefit4_description: data.benefit4_description || '',
        });
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      setMessage({ type: 'error', text: 'Erro ao carregar conteúdo' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/form-content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setContent(updatedData);
        setMessage({ type: 'success', text: 'Conteúdo salvo com sucesso!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Erro ao salvar conteúdo' });
      }
    } catch (error) {
      console.error('Error saving content:', error);
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
              Textos do Formulário
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Edite os textos da seção do formulário de captura de leads
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Seção Principal
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título Principal
                </label>
                <input
                  type="text"
                  value={formData.main_title}
                  onChange={(e) => handleInputChange('main_title', e.target.value)}
                  placeholder="Por que ser um"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtítulo Principal
                </label>
                <textarea
                  rows={3}
                  value={formData.main_subtitle}
                  onChange={(e) => handleInputChange('main_subtitle', e.target.value)}
                  placeholder="Junte-se à nossa rede de parceiros..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Seção do Formulário
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Formulário
                </label>
                <input
                  type="text"
                  value={formData.form_title}
                  onChange={(e) => handleInputChange('form_title', e.target.value)}
                  placeholder="Seja um Lojista Oficial"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtítulo do Formulário
                </label>
                <textarea
                  rows={2}
                  value={formData.form_subtitle}
                  onChange={(e) => handleInputChange('form_subtitle', e.target.value)}
                  placeholder="Preencha o formulário e nossa equipe..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Benefícios
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Benefit 1 */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Benefício 1</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={formData.benefit1_title}
                  onChange={(e) => handleInputChange('benefit1_title', e.target.value)}
                  placeholder="Preços Exclusivos"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={formData.benefit1_description}
                  onChange={(e) => handleInputChange('benefit1_description', e.target.value)}
                  placeholder="Acesso a preços diferenciados..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Benefício 2</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={formData.benefit2_title}
                  onChange={(e) => handleInputChange('benefit2_title', e.target.value)}
                  placeholder="Produtos Exclusivos"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={formData.benefit2_description}
                  onChange={(e) => handleInputChange('benefit2_description', e.target.value)}
                  placeholder="Tenha acesso primeiro às novas coleções..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Benefício 3</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={formData.benefit3_title}
                  onChange={(e) => handleInputChange('benefit3_title', e.target.value)}
                  placeholder="Suporte Completo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={formData.benefit3_description}
                  onChange={(e) => handleInputChange('benefit3_description', e.target.value)}
                  placeholder="Nossa equipe oferece treinamento..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Benefício 4</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={formData.benefit4_title}
                  onChange={(e) => handleInputChange('benefit4_title', e.target.value)}
                  placeholder="Crescimento Rápido"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={formData.benefit4_description}
                  onChange={(e) => handleInputChange('benefit4_description', e.target.value)}
                  placeholder="Aproveite a força da marca Ecko..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Salvando...
              </div>
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
