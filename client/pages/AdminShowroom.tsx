import { useState, useEffect } from "react";
import { ShowroomSection, ShowroomItem, CATEGORY_LABELS } from "@shared/showroom";
import AdminAuth from "../components/AdminAuth";
import AdminLayout from "../components/AdminLayout";
import ImageUploadCompressed from "../components/ImageUploadCompressed";

type Tab = 'configuracoes' | 'itens';

export default function AdminShowroom() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('configuracoes');
  const [section, setSection] = useState<ShowroomSection | null>(null);
  const [items, setItems] = useState<ShowroomItem[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    background_type: 'dark' as 'white' | 'gray' | 'gradient' | 'dark',
    layout_type: 'masonry' as 'grid' | 'masonry' | 'carousel',
    show_categories: true,
    max_items: 12,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    media_url: '',
    media_type: 'image' as 'image' | 'video',
    category: 'ambiente' as 'ambiente' | 'lookbook' | 'lifestyle' | 'produtos',
    is_featured: false,
    is_active: true
  });
  const [editingItem, setEditingItem] = useState<ShowroomItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const authenticated = localStorage.getItem("admin_authenticated") === "true";
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      fetchShowroom();
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setLoading(true);
    fetchShowroom();
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
  };

  const fetchShowroom = async () => {
    try {
      const response = await fetch('/api/admin/showroom');
      if (response.ok) {
        const data = await response.json();
        setSection(data);
        setItems(data.items || []);
        setFormData({
          title: data.title || '',
          subtitle: data.subtitle || '',
          background_type: data.background_type || 'dark',
          layout_type: data.layout_type || 'masonry',
          show_categories: data.show_categories ?? true,
          max_items: data.max_items || 12,
        });
      }
    } catch (error) {
      console.error("Error fetching showroom:", error);
      setMessage({ type: 'error', text: 'Erro ao carregar showroom' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/showroom/section', {
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

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.media_url) {
      setMessage({ type: 'error', text: 'Título e URL da mídia são obrigatórios' });
      return;
    }

    try {
      const response = await fetch('/api/showroom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        await fetchShowroom();
        setNewItem({
          title: '',
          description: '',
          media_url: '',
          media_type: 'image',
          category: 'ambiente',
          is_featured: false,
          is_active: true
        });
        setMessage({ type: 'success', text: 'Item adicionado com sucesso!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Erro ao adicionar item' });
      }
    } catch (error) {
      console.error('Error adding item:', error);
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(`/api/showroom/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingItem.title,
          description: editingItem.description,
          media_url: editingItem.media_url,
          media_type: editingItem.media_type,
          category: editingItem.category,
          is_featured: editingItem.is_featured,
          is_active: editingItem.is_active,
        }),
      });

      if (response.ok) {
        await fetchShowroom();
        setEditingItem(null);
        setMessage({ type: 'success', text: 'Item atualizado com sucesso!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Erro ao atualizar item' });
      }
    } catch (error) {
      console.error('Error updating item:', error);
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Tem certeza que deseja deletar este item?')) return;

    try {
      const response = await fetch(`/api/showroom/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchShowroom();
        setMessage({ type: 'success', text: 'Item deletado com sucesso!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Erro ao deletar item' });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

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
              Showroom
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie ambientes, looks e experiências da marca
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
              onClick={() => setActiveTab('itens')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'itens'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🖼️ Itens ({items.length})
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
                    placeholder="Nosso [destaque]Showroom[/destaque]"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtítulo da Seção
                  </label>
                  <textarea
                    rows={2}
                    value={formData.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    placeholder="Explore ambientes, looks e experiências..."
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Layout
                  </label>
                  <select
                    value={formData.layout_type}
                    onChange={(e) => handleInputChange('layout_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="grid">Grade Regular</option>
                    <option value="masonry">Masonry (Pinterest)</option>
                    <option value="carousel">Carrossel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de Itens
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="24"
                    value={formData.max_items}
                    onChange={(e) => handleInputChange('max_items', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      checked={formData.show_categories}
                      onChange={(e) => handleInputChange('show_categories', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Mostrar filtros de categoria
                    </span>
                  </label>
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

        {activeTab === 'itens' && (
          <div className="space-y-6">
            {/* Add New Item */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Adicionar Novo Item
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="Ambiente Urbano Moderno"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="ambiente">Ambientes</option>
                    <option value="lookbook">Lookbooks</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="produtos">Produtos</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    rows={3}
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Descrição do item do showroom..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Mídia
                  </label>
                  <select
                    value={newItem.media_type}
                    onChange={(e) => setNewItem({ ...newItem, media_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="image">Imagem</option>
                    <option value="video">Vídeo</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      checked={newItem.is_featured}
                      onChange={(e) => setNewItem({ ...newItem, is_featured: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Item em destaque
                    </span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <ImageUploadCompressed 
                    label="URL da Mídia *"
                    currentUrl={newItem.media_url}
                    onUrlChange={(url) => setNewItem({ ...newItem, media_url: url })}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newItem.is_active}
                      onChange={(e) => setNewItem({ ...newItem, is_active: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Item ativo (visível na página)
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={handleAddItem}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Adicionar Item
                </button>
              </div>
            </div>

            {/* Filter */}
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Filtrar por categoria:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Todas</option>
                  <option value="ambiente">Ambientes</option>
                  <option value="lookbook">Lookbooks</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="produtos">Produtos</option>
                </select>
              </div>
            </div>

            {/* Items Grid */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Itens Cadastrados ({filteredItems.length})
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <div key={item.id} className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="aspect-video bg-gray-100">
                      {item.media_type === 'video' ? (
                        <video
                          src={item.media_url}
                          className="w-full h-full object-cover"
                          muted
                          loop
                        />
                      ) : (
                        <img
                          src={item.media_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Deletar
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {item.title}
                        </h4>
                        <div className="flex space-x-1">
                          {item.is_featured && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                              Destaque
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {item.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {CATEGORY_LABELS[item.category]} • Posição: {item.position}
                      </p>
                      {item.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🖼️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item</h3>
                  <p className="text-gray-500">
                    {selectedCategory === 'all' 
                      ? 'Comece adicionando itens ao showroom.' 
                      : `Nenhum item na categoria "${CATEGORY_LABELS[selectedCategory as keyof typeof CATEGORY_LABELS]}".`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <h3 className="text-lg font-medium mb-4">Editar Item</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ambiente">Ambientes</option>
                    <option value="lookbook">Lookbooks</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="produtos">Produtos</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    rows={3}
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Mídia</label>
                  <select
                    value={editingItem.media_type}
                    onChange={(e) => setEditingItem({ ...editingItem, media_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="image">Imagem</option>
                    <option value="video">Vídeo</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <ImageUploadCompressed 
                    label="URL da Mídia"
                    currentUrl={editingItem.media_url}
                    onUrlChange={(url) => setEditingItem({ ...editingItem, media_url: url })}
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingItem.is_featured}
                      onChange={(e) => setEditingItem({ ...editingItem, is_featured: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Item em destaque</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingItem.is_active}
                      onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Item ativo</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateItem}
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
