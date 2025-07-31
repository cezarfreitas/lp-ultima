import { useState, useEffect } from "react";
import { PixelData, PixelCreateRequest, PIXEL_TYPES } from "@shared/pixels";
import AdminAuth from "../components/AdminAuth";
import AdminLayout from "../components/AdminLayout";

export default function AdminPixels() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pixels, setPixels] = useState<PixelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPixel, setEditingPixel] = useState<PixelData | null>(null);

  const [formData, setFormData] = useState<PixelCreateRequest>({
    name: "",
    type: "ga4_simple",
    code: "",
    enabled: false,
    position: "head",
    description: "",
    pixel_id: "",
    access_token: ""
  });

  useEffect(() => {
    const authenticated = localStorage.getItem("admin_authenticated") === "true";
    setIsAuthenticated(authenticated);

    if (authenticated) {
      fetchPixels();
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setLoading(true);
    fetchPixels();
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
  };

  const fetchPixels = async () => {
    try {
      const response = await fetch("/api/pixels");
      if (response.ok) {
        const data = await response.json();
        setPixels(data);
      }
    } catch (err) {
      setError("Erro ao carregar pixels");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const url = editingPixel ? `/api/pixels/${editingPixel.id}` : "/api/pixels";
      const method = editingPixel ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(editingPixel ? "Pixel atualizado com sucesso!" : "Pixel criado com sucesso!");
        setShowForm(false);
        setEditingPixel(null);
        resetForm();
        fetchPixels();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erro ao salvar pixel");
      }
    } catch (err) {
      setError("Erro ao salvar pixel");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (pixel: PixelData) => {
    setEditingPixel(pixel);
    setFormData({
      name: pixel.name,
      type: pixel.type,
      code: pixel.code,
      enabled: pixel.enabled,
      position: pixel.position,
      description: pixel.description || "",
      pixel_id: pixel.pixel_id || "",
      access_token: pixel.access_token || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este pixel?")) return;

    try {
      const response = await fetch(`/api/pixels/${id}`, { method: "DELETE" });
      if (response.ok) {
        setMessage("Pixel excluído com sucesso!");
        fetchPixels();
      }
    } catch (err) {
      setError("Erro ao excluir pixel");
    }
  };

  const handleToggle = async (id: number, enabled: boolean) => {
    try {
      const response = await fetch(`/api/pixels/${id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        setMessage(`Pixel ${enabled ? 'ativado' : 'desativado'} com sucesso!`);
        fetchPixels();
      }
    } catch (err) {
      setError("Erro ao alterar status do pixel");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "google_analytics",
      code: "",
      enabled: false,
      position: "head",
      description: ""
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPixel(null);
    resetForm();
  };

  const handleTypeChange = (type: PixelCreateRequest['type']) => {
    const pixelType = PIXEL_TYPES[type];
    setFormData(prev => ({
      ...prev,
      type,
      position: pixelType.defaultPosition,
      code: prev.code || pixelType.template
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
            <div className="animate-spin h-12 w-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Pixels e Rastreamento
                </h1>
                <p className="text-gray-600">
                  Gerencie códigos de rastreamento como Google Analytics, Meta Pixel, GTM e códigos personalizados
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                + Adicionar Pixel
              </button>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className="m-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">{message}</p>
            </div>
          )}

          {error && (
            <div className="m-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="p-8 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingPixel ? "Editar Pixel" : "Novo Pixel"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Pixel
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                      placeholder="Ex: Google Analytics - Página Principal"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Pixel
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleTypeChange(e.target.value as PixelCreateRequest['type'])}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      {Object.entries(PIXEL_TYPES).map(([key, type]) => (
                        <option key={key} value={key}>
                          {type.icon} {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Posição
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value as PixelCreateRequest['position'] }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="head">Head (Cabeçalho)</option>
                      <option value="body_start">Início do Body</option>
                      <option value="body_end">Final do Body</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.enabled}
                        onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">Pixel ativado</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código do Pixel
                  </label>
                  <textarea
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    rows={12}
                    className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
                    placeholder="Cole aqui o código de rastreamento..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Descrição do pixel e seu propósito..."
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? "Salvando..." : editingPixel ? "Atualizar" : "Criar Pixel"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Pixels List */}
          <div className="p-8">
            {pixels.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum pixel configurado
                </h3>
                <p className="text-gray-600">
                  Adicione códigos de rastreamento para monitorar conversões e comportamento dos usuários
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pixels.map((pixel) => (
                  <div key={pixel.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {PIXEL_TYPES[pixel.type]?.icon || '⚡'}
                          </span>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {pixel.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {PIXEL_TYPES[pixel.type]?.name || pixel.type} • {pixel.position}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              pixel.enabled 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {pixel.enabled ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </div>
                        {pixel.description && (
                          <p className="text-sm text-gray-600 mt-2">
                            {pixel.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleToggle(pixel.id!, !pixel.enabled)}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            pixel.enabled
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {pixel.enabled ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => handleEdit(pixel)}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(pixel.id!)}
                          className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm font-medium hover:bg-red-200 transition-colors"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
