import { useState, useEffect } from "react";
import { AboutSection, AboutStat } from "@shared/about";
import AdminAuth from "../components/AdminAuth";
import AdminLayout from "../components/AdminLayout";
import ImageUploadCompressed from "../components/ImageUploadCompressed";

type Tab = 'configuracoes' | 'estatisticas';

export default function AdminAbout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('configuracoes');
  const [section, setSection] = useState<AboutSection | null>(null);
  const [stats, setStats] = useState<AboutStat[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    background_type: 'gray' as 'white' | 'gray' | 'gradient' | 'dark',
    image_url: '',
    button_text: '',
    button_url: '',
    show_stats: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newStat, setNewStat] = useState({
    title: '',
    value: '',
    description: '',
    icon: '📊',
    is_active: true
  });
  const [editingStat, setEditingStat] = useState<AboutStat | null>(null);

  useEffect(() => {
    const authenticated = localStorage.getItem("admin_authenticated") === "true";
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      fetchAbout();
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setLoading(true);
    fetchAbout();
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
  };

  const fetchAbout = async () => {
    try {
      const response = await fetch('/api/admin/about');
      if (response.ok) {
        const data = await response.json();
        setSection(data);
        setStats(data.stats || []);
        setFormData({
          title: data.title || '',
          subtitle: data.subtitle || '',
          description: data.description || '',
          background_type: data.background_type || 'gray',
          image_url: data.image_url || '',
          button_text: data.button_text || '',
          button_url: data.button_url || '',
          show_stats: data.show_stats ?? true,
        });
      }
    } catch (error) {
      console.error("Error fetching about:", error);
      setMessage({ type: 'error', text: 'Erro ao carregar seção About' });
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

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/about/section', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setSection(prev => prev ? { ...prev, ...updatedData } : null);
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

  const handleAddStat = async () => {
    if (!newStat.title || !newStat.value || !newStat.icon) {
      setMessage({ type: 'error', text: 'Título, valor e ícone são obrigatórios' });
      return;
    }

    try {
      const response = await fetch('/api/about/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStat),
      });

      if (response.ok) {
        await fetchAbout();
        setNewStat({
          title: '',
          value: '',
          description: '',
          icon: '📊',
          is_active: true
        });
        setMessage({ type: 'success', text: 'Estatística adicionada com sucesso!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Erro ao adicionar estatística' });
      }
    } catch (error) {
      console.error('Error adding stat:', error);
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  const handleUpdateStat = async () => {
    if (!editingStat) return;

    try {
      const response = await fetch(`/api/about/stats/${editingStat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingStat.title,
          value: editingStat.value,
          description: editingStat.description,
          icon: editingStat.icon,
          is_active: editingStat.is_active,
        }),
      });

      if (response.ok) {
        await fetchAbout();
        setEditingStat(null);
        setMessage({ type: 'success', text: 'Estatística atualizada com sucesso!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Erro ao atualizar estatística' });
      }
    } catch (error) {
      console.error('Error updating stat:', error);
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  const handleDeleteStat = async (statId: number) => {
    if (!confirm('Tem certeza que deseja deletar esta estatística?')) return;

    try {
      const response = await fetch(`/api/about/stats/${statId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAbout();
        setMessage({ type: 'success', text: 'Estatística deletada com sucesso!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Erro ao deletar estatística' });
      }
    } catch (error) {
      console.error('Error deleting stat:', error);
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
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
      <div className="space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Sobre a Ecko
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie a seção sobre a empresa
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('configuracoes')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'configuracoes'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⚙️ Configurações da Seção
            </button>
            <button
              onClick={() => setActiveTab('estatisticas')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'estatisticas'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Estatísticas ({stats.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'configuracoes' && (
          <div className="space-y-6">
            {/* Section Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Configurações da Seção
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título da Seção
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Sobre a [destaque]Ecko[/destaque]"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtítulo da Seção
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    placeholder="Mais de 25 anos transformando a moda urbana brasileira"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="A Ecko Unlimited chegou ao Brasil..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Fundo
                  </label>
                  <select
                    value={formData.background_type}
                    onChange={(e) => handleInputChange('background_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="white">Fundo Branco</option>
                    <option value="gray">Fundo Cinza</option>
                    <option value="gradient">Fundo Gradiente</option>
                    <option value="dark">Fundo Escuro</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      checked={formData.show_stats}
                      onChange={(e) => handleInputChange('show_stats', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Mostrar estatísticas
                    </span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <ImageUploadCompressed 
                    label="Imagem da Seção"
                    currentUrl={formData.image_url}
                    onUrlChange={(url) => handleInputChange('image_url', url)}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto do Botão
                  </label>
                  <input
                    type="text"
                    value={formData.button_text}
                    onChange={(e) => handleInputChange('button_text', e.target.value)}
                    placeholder="Seja um Lojista"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL do Botão
                  </label>
                  <input
                    type="text"
                    value={formData.button_url}
                    onChange={(e) => handleInputChange('button_url', e.target.value)}
                    placeholder="#form"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Salvando...' : 'Salvar Configurações'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'estatisticas' && (
          <div className="space-y-6">
            {/* Add New Stat */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Adicionar Nova Estatística
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={newStat.title}
                    onChange={(e) => setNewStat({ ...newStat, title: e.target.value })}
                    placeholder="Anos de Mercado"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor *
                  </label>
                  <input
                    type="text"
                    value={newStat.value}
                    onChange={(e) => setNewStat({ ...newStat, value: e.target.value })}
                    placeholder="25+"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={newStat.description}
                    onChange={(e) => setNewStat({ ...newStat, description: e.target.value })}
                    placeholder="Experiência consolidada no mercado global"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ícone *
                  </label>
                  <input
                    type="text"
                    value={newStat.icon}
                    onChange={(e) => setNewStat({ ...newStat, icon: e.target.value })}
                    placeholder="🏆"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      checked={newStat.is_active}
                      onChange={(e) => setNewStat({ ...newStat, is_active: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Estatística ativa
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={handleAddStat}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Adicionar Estatística
                </button>
              </div>
            </div>

            {/* Stats List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Estatísticas Cadastradas ({stats.length})
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat) => (
                  <div key={stat.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{stat.icon}</span>
                        <div>
                          <div className="font-bold text-lg text-indigo-600">{stat.value}</div>
                          <div className="font-medium text-gray-900 text-sm">{stat.title}</div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        stat.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {stat.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    {stat.description && (
                      <p className="text-sm text-gray-500 mb-3">{stat.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mb-3">Posição: {stat.position}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingStat(stat)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteStat(stat.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {stats.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma estatística</h3>
                  <p className="text-gray-500">
                    Comece adicionando estatísticas à seção sobre a empresa.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Stat Modal */}
        {editingStat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">Editar Estatística</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={editingStat.title}
                    onChange={(e) => setEditingStat({ ...editingStat, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                  <input
                    type="text"
                    value={editingStat.value}
                    onChange={(e) => setEditingStat({ ...editingStat, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <input
                    type="text"
                    value={editingStat.description}
                    onChange={(e) => setEditingStat({ ...editingStat, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
                  <input
                    type="text"
                    value={editingStat.icon}
                    onChange={(e) => setEditingStat({ ...editingStat, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingStat.is_active}
                      onChange={(e) => setEditingStat({ ...editingStat, is_active: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Estatística ativa</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingStat(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateStat}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Atualizar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* System Messages */}
        {message && (
          <div className={`p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
