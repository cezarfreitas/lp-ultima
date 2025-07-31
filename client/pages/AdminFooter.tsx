import { useState, useEffect } from "react";
import { FooterSection, FooterLink } from "@shared/footer";
import AdminAuth from "../components/AdminAuth";
import AdminLayout from "../components/AdminLayout";

type Tab = "configuracoes" | "links";

export default function AdminFooter() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("configuracoes");
  const [section, setSection] = useState<FooterSection | null>(null);
  const [links, setLinks] = useState<FooterLink[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instagram_url: "",
    facebook_url: "",
    whatsapp_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [newLink, setNewLink] = useState({
    title: "",
    href: "",
    is_active: true,
  });
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);

  useEffect(() => {
    const authenticated =
      localStorage.getItem("admin_authenticated") === "true";
    setIsAuthenticated(authenticated);

    if (authenticated) {
      fetchFooter();
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setLoading(true);
    fetchFooter();
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
  };

  const fetchFooter = async () => {
    try {
      const response = await fetch("/api/admin/footer");
      if (response.ok) {
        const data = await response.json();
        setSection(data);
        setLinks(data.links || []);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          instagram_url: data.instagram_url || "",
          facebook_url: data.facebook_url || "",
          whatsapp_url: data.whatsapp_url || "",
        });
      }
    } catch (error) {
      console.error("Error fetching footer:", error);
      setMessage({ type: "error", text: "Erro ao carregar footer" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/footer/section", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setSection((prev) => (prev ? { ...prev, ...updatedData } : null));
        setMessage({
          type: "success",
          text: "Configurações salvas com sucesso!",
        });
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text: errorData.error || "Erro ao salvar configurações",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: "error", text: "Erro ao conectar com o servidor" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddLink = async () => {
    if (!newLink.title || !newLink.href) {
      setMessage({ type: "error", text: "Título e URL são obrigatórios" });
      return;
    }

    try {
      const response = await fetch("/api/footer/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLink),
      });

      if (response.ok) {
        await fetchFooter();
        setNewLink({
          title: "",
          href: "",
          is_active: true,
        });
        setMessage({ type: "success", text: "Link adicionado com sucesso!" });
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text: errorData.error || "Erro ao adicionar link",
        });
      }
    } catch (error) {
      console.error("Error adding link:", error);
      setMessage({ type: "error", text: "Erro ao conectar com o servidor" });
    }
  };

  const handleUpdateLink = async () => {
    if (!editingLink) return;

    try {
      const response = await fetch(`/api/footer/links/${editingLink.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editingLink.title,
          href: editingLink.href,
          is_active: editingLink.is_active,
        }),
      });

      if (response.ok) {
        await fetchFooter();
        setEditingLink(null);
        setMessage({ type: "success", text: "Link atualizado com sucesso!" });
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text: errorData.error || "Erro ao atualizar link",
        });
      }
    } catch (error) {
      console.error("Error updating link:", error);
      setMessage({ type: "error", text: "Erro ao conectar com o servidor" });
    }
  };

  const handleDeleteLink = async (linkId: number) => {
    if (!confirm("Tem certeza que deseja deletar este link?")) return;

    try {
      const response = await fetch(`/api/footer/links/${linkId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchFooter();
        setMessage({ type: "success", text: "Link deletado com sucesso!" });
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text: errorData.error || "Erro ao deletar link",
        });
      }
    } catch (error) {
      console.error("Error deleting link:", error);
      setMessage({ type: "error", text: "Erro ao conectar com o servidor" });
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
              Rodapé
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie informações e links do rodapé
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("configuracoes")}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "configuracoes"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              ⚙️ Configurações
            </button>
            <button
              onClick={() => setActiveTab("links")}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "links"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              🔗 Links ({links.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "configuracoes" && (
          <div className="space-y-6">
            {/* Section Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Configurações do Rodapé
              </h3>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título da Marca
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Ecko"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição da Marca
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Transforme sua paixão pela moda urbana..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      value={formData.instagram_url}
                      onChange={(e) =>
                        handleInputChange("instagram_url", e.target.value)
                      }
                      placeholder="https://instagram.com/ecko"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      value={formData.facebook_url}
                      onChange={(e) =>
                        handleInputChange("facebook_url", e.target.value)
                      }
                      placeholder="https://facebook.com/ecko"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp URL
                    </label>
                    <input
                      type="url"
                      value={formData.whatsapp_url}
                      onChange={(e) =>
                        handleInputChange("whatsapp_url", e.target.value)
                      }
                      placeholder="https://wa.me/5511999999999"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Salvando..." : "Salvar Configurações"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "links" && (
          <div className="space-y-6">
            {/* Add New Link */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Adicionar Novo Link
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={newLink.title}
                    onChange={(e) =>
                      setNewLink({ ...newLink, title: e.target.value })
                    }
                    placeholder="Nossos Produtos"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL *
                  </label>
                  <input
                    type="text"
                    value={newLink.href}
                    onChange={(e) =>
                      setNewLink({ ...newLink, href: e.target.value })
                    }
                    placeholder="#produtos"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      checked={newLink.is_active}
                      onChange={(e) =>
                        setNewLink({ ...newLink, is_active: e.target.checked })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Link ativo (visível no rodapé)
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={handleAddLink}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Adicionar Link
                </button>
              </div>
            </div>

            {/* Links List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Links Cadastrados ({links.length})
              </h3>

              <div className="space-y-4">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">
                          {link.title}
                        </h4>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            link.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {link.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        URL: {link.href} • Posição: {link.position}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingLink(link)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {links.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🔗</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum link
                  </h3>
                  <p className="text-gray-500">
                    Comece adicionando links ao rodapé.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Link Modal */}
        {editingLink && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">Editar Link</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={editingLink.title}
                    onChange={(e) =>
                      setEditingLink({ ...editingLink, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="text"
                    value={editingLink.href}
                    onChange={(e) =>
                      setEditingLink({ ...editingLink, href: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingLink.is_active}
                      onChange={(e) =>
                        setEditingLink({
                          ...editingLink,
                          is_active: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Link ativo
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingLink(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateLink}
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
          <div
            className={`p-4 rounded-md ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
