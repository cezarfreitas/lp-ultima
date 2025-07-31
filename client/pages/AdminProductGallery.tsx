import { useState, useEffect } from "react";
import { ProductGallery, ProductItem } from "@shared/product-gallery";
import AdminAuth from "../components/AdminAuth";
import AdminLayout from "../components/AdminLayout";
import ImageUploadCompressed from "../components/ImageUploadCompressed";

export default function AdminProductGallery() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [gallery, setGallery] = useState<ProductGallery | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    cta_text: '',
    cta_description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newProduct, setNewProduct] = useState({ image_url: '', alt_text: '' });
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  useEffect(() => {
    // Check if already authenticated
    const authenticated = localStorage.getItem("admin_authenticated") === "true";
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      fetchGallery();
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setLoading(true);
    fetchGallery();
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
  };

  const fetchGallery = async () => {
    try {
      const response = await fetch('/api/product-gallery');
      if (response.ok) {
        const data = await response.json();
        setGallery(data);
        setFormData({
          title: data.title || '',
          subtitle: data.subtitle || '',
          cta_text: data.cta_text || '',
          cta_description: data.cta_description || '',
        });
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
      setMessage({ type: 'error', text: 'Erro ao carregar galeria' });
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

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/product-gallery', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setGallery(prev => prev ? { ...prev, ...updatedData } : null);
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

  const handleAddProduct = async () => {
    if (!newProduct.image_url) {
      setMessage({ type: 'error', text: 'URL da imagem é obrigatória' });
      return;
    }

    try {
      const response = await fetch('/api/product-gallery/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: newProduct.image_url,
          alt_text: newProduct.alt_text || 'Produto Ecko',
        }),
      });

      if (response.ok) {
        await fetchGallery();
        setNewProduct({ image_url: '', alt_text: '' });
        setMessage({ type: 'success', text: 'Produto adicionado com sucesso!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Erro ao adicionar produto' });
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const response = await fetch(`/api/product-gallery/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: editingProduct.image_url,
          alt_text: editingProduct.alt_text,
        }),
      });

      if (response.ok) {
        await fetchGallery();
        setEditingProduct(null);
        setMessage({ type: 'success', text: 'Produto atualizado com sucesso!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Erro ao atualizar produto' });
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;

    try {
      const response = await fetch(`/api/product-gallery/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchGallery();
        setMessage({ type: 'success', text: 'Produto deletado com sucesso!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Erro ao deletar produto' });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  const handleImageUpload = (url: string, isEdit = false) => {
    if (isEdit && editingProduct) {
      setEditingProduct({ ...editingProduct, image_url: url });
    } else {
      setNewProduct({ ...newProduct, image_url: url });
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
              Galeria de Produtos
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie a galeria de produtos da landing page
            </p>
          </div>
        </div>

        {/* Gallery Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Configurações da Seção
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da Seção
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Nossos [destaque]Produtos[/destaque]"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texto do Botão
              </label>
              <input
                type="text"
                value={formData.cta_text}
                onChange={(e) => handleInputChange('cta_text', e.target.value)}
                placeholder="Ver Catálogo Completo"
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
                placeholder="Descubra a coleção exclusiva Ecko..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição do Call-to-Action
              </label>
              <textarea
                rows={2}
                value={formData.cta_description}
                onChange={(e) => handleInputChange('cta_description', e.target.value)}
                placeholder="Como lojista Ecko, você terá acesso..."
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

        {/* Add New Product */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Adicionar Produto
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL da Imagem
              </label>
              <input
                type="url"
                value={newProduct.image_url}
                onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texto Alternativo
              </label>
              <input
                type="text"
                value={newProduct.alt_text}
                onChange={(e) => setNewProduct({ ...newProduct, alt_text: e.target.value })}
                placeholder="Produto Ecko"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <ImageUploadCompressed onUpload={(url) => handleImageUpload(url, false)} />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleAddProduct}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Adicionar Produto
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Produtos ({gallery?.products?.length || 0})
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {gallery?.products?.map((product) => (
              <div key={product.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.alt_text}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Deletar
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600 text-center">
                  Posição: {product.position}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">Editar Produto</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL da Imagem
                  </label>
                  <input
                    type="url"
                    value={editingProduct.image_url}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texto Alternativo
                  </label>
                  <input
                    type="text"
                    value={editingProduct.alt_text}
                    onChange={(e) => setEditingProduct({ ...editingProduct, alt_text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <ImageUploadCompressed onUpload={(url) => handleImageUpload(url, true)} />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateProduct}
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

        {/* Highlight System Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            ✨ Sistema de Destaque
          </h3>
          
          <div className="space-y-4">
            <p className="text-gray-700">
              Você pode destacar palavras no título usando:
            </p>
            
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <code className="text-sm text-blue-800 bg-blue-100 px-2 py-1 rounded">
                [destaque]palavra[/destaque]
              </code>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Exemplo:</h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <code>Nossos [destaque]Produtos[/destaque]</code>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Resultado:</h4>
                <div className="bg-white p-3 rounded-lg text-sm border">
                  Nossos <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent font-bold">Produtos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
