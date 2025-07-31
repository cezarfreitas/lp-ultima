import { useState, useEffect } from "react";
import { FAQSection, FAQItem } from "@shared/faq";
import AdminAuth from "../components/AdminAuth";
import AdminLayout from "../components/AdminLayout";

type Tab = 'configuracoes' | 'perguntas';

export default function AdminFAQ() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('configuracoes');
  const [section, setSection] = useState<FAQSection | null>(null);
  const [faqs, setFAQs] = useState<FAQItem[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    background_type: 'white' as 'white' | 'gray' | 'gradient',
    max_faqs: 8,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newFAQ, setNewFAQ] = useState({
    question: '',
    answer: '',
    is_active: true
  });
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);

  useEffect(() => {
    const authenticated = localStorage.getItem("admin_authenticated") === "true";
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      fetchFAQs();
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setLoading(true);
    fetchFAQs();
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
  };

  const fetchFAQs = async () => {
    try {
      const response = await fetch('/api/admin/faq');
      if (response.ok) {
        const data = await response.json();
        setSection(data);
        setFAQs(data.faqs || []);
        setFormData({
          title: data.title || '',
          subtitle: data.subtitle || '',
          background_type: data.background_type || 'white',
          max_faqs: data.max_faqs || 8,
        });
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      setMessage({ type: 'error', text: 'Erro ao carregar FAQs' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/faq/section', {
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

  const handleAddFAQ = async () => {
    if (!newFAQ.question || !newFAQ.answer) {
      setMessage({ type: 'error', text: 'Pergunta e resposta são obrigatórias' });
      return;
    }

    try {
      const response = await fetch('/api/faq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFAQ),
      });

      if (response.ok) {
        await fetchFAQs();
        setNewFAQ({
          question: '',
          answer: '',
          is_active: true
        });
        setMessage({ type: 'success', text: 'FAQ adicionada com sucesso!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Erro ao adicionar FAQ' });
      }
    } catch (error) {
      console.error('Error adding FAQ:', error);
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  const handleUpdateFAQ = async () => {
    if (!editingFAQ) return;

    try {
      const response = await fetch(`/api/faq/${editingFAQ.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: editingFAQ.question,
          answer: editingFAQ.answer,
          is_active: editingFAQ.is_active,
        }),
      });

      if (response.ok) {
        await fetchFAQs();
        setEditingFAQ(null);
        setMessage({ type: 'success', text: 'FAQ atualizada com sucesso!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Erro ao atualizar FAQ' });
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  const handleDeleteFAQ = async (faqId: number) => {
    if (!confirm('Tem certeza que deseja deletar esta FAQ?')) return;

    try {
      const response = await fetch(`/api/faq/${faqId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchFAQs();
        setMessage({ type: 'success', text: 'FAQ deletada com sucesso!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Erro ao deletar FAQ' });
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
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
              FAQ - Perguntas Frequentes
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie as perguntas e respostas mais frequentes
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
              onClick={() => setActiveTab('perguntas')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'perguntas'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ❓ Perguntas ({faqs.length})
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
                    placeholder="Perguntas [destaque]Frequentes[/destaque]"
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
                    placeholder="Tire suas dúvidas sobre como se tornar um lojista..."
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
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de FAQs
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="20"
                    value={formData.max_faqs}
                    onChange={(e) => handleInputChange('max_faqs', parseInt(e.target.value))}
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

        {activeTab === 'perguntas' && (
          <div className="space-y-6">
            {/* Add New FAQ */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Adicionar Nova FAQ
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pergunta *
                  </label>
                  <input
                    type="text"
                    value={newFAQ.question}
                    onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                    placeholder="Como posso me tornar um lojista Ecko?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resposta *
                  </label>
                  <textarea
                    rows={4}
                    value={newFAQ.answer}
                    onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                    placeholder="Para se tornar um lojista Ecko, você precisa..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newFAQ.is_active}
                      onChange={(e) => setNewFAQ({ ...newFAQ, is_active: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      FAQ ativa (visível na página)
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={handleAddFAQ}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Adicionar FAQ
                </button>
              </div>
            </div>

            {/* FAQs List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                FAQs Cadastradas ({faqs.length})
              </h3>
              
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {faq.question}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded ${
                            faq.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {faq.is_active ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{faq.answer}</p>
                        <p className="text-xs text-gray-500">Posição: {faq.position}</p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => setEditingFAQ(faq)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteFAQ(faq.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Deletar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {faqs.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">❓</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma FAQ</h3>
                  <p className="text-gray-500">Comece adicionando algumas perguntas frequentes.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit FAQ Modal */}
        {editingFAQ && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <h3 className="text-lg font-medium mb-4">Editar FAQ</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pergunta</label>
                  <input
                    type="text"
                    value={editingFAQ.question}
                    onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resposta</label>
                  <textarea
                    rows={4}
                    value={editingFAQ.answer}
                    onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingFAQ.is_active}
                      onChange={(e) => setEditingFAQ({ ...editingFAQ, is_active: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">FAQ ativa</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingFAQ(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateFAQ}
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
