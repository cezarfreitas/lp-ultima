import { useState, useEffect } from "react";
import { TestimonialsSection, Testimonial } from "@shared/testimonials";
import AdminAuth from "../components/AdminAuth";
import AdminLayout from "../components/AdminLayout";
import ImageUploadCompressed from "../components/ImageUploadCompressed";

type Tab = "configuracoes" | "depoimentos";

export default function AdminTestimonials() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("configuracoes");
  const [section, setSection] = useState<TestimonialsSection | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    background_type: "gray" as "white" | "gray" | "gradient",
    show_ratings: true,
    max_testimonials: 6,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    role: "",
    company: "",
    content: "",
    avatar_url: "",
    rating: 5,
    is_active: true,
  });
  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);

  useEffect(() => {
    const authenticated =
      localStorage.getItem("admin_authenticated") === "true";
    setIsAuthenticated(authenticated);

    if (authenticated) {
      fetchTestimonials();
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setLoading(true);
    fetchTestimonials();
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
  };

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/admin/testimonials");
      if (response.ok) {
        const data = await response.json();
        setSection(data);
        setTestimonials(data.testimonials || []);
        setFormData({
          title: data.title || "",
          subtitle: data.subtitle || "",
          background_type: data.background_type || "gray",
          show_ratings: data.show_ratings ?? true,
          max_testimonials: data.max_testimonials || 6,
        });
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      setMessage({ type: "error", text: "Erro ao carregar depoimentos" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | boolean | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/testimonials/section", {
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

  const handleAddTestimonial = async () => {
    if (
      !newTestimonial.name ||
      !newTestimonial.role ||
      !newTestimonial.company ||
      !newTestimonial.content
    ) {
      setMessage({ type: "error", text: "Todos os campos são obrigatórios" });
      return;
    }

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTestimonial),
      });

      if (response.ok) {
        await fetchTestimonials();
        setNewTestimonial({
          name: "",
          role: "",
          company: "",
          content: "",
          avatar_url: "",
          rating: 5,
          is_active: true,
        });
        setMessage({
          type: "success",
          text: "Depoimento adicionado com sucesso!",
        });
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text: errorData.error || "Erro ao adicionar depoimento",
        });
      }
    } catch (error) {
      console.error("Error adding testimonial:", error);
      setMessage({ type: "error", text: "Erro ao conectar com o servidor" });
    }
  };

  const handleUpdateTestimonial = async () => {
    if (!editingTestimonial) return;

    try {
      const response = await fetch(
        `/api/testimonials/${editingTestimonial.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editingTestimonial.name,
            role: editingTestimonial.role,
            company: editingTestimonial.company,
            content: editingTestimonial.content,
            avatar_url: editingTestimonial.avatar_url,
            rating: editingTestimonial.rating,
            is_active: editingTestimonial.is_active,
          }),
        },
      );

      if (response.ok) {
        await fetchTestimonials();
        setEditingTestimonial(null);
        setMessage({
          type: "success",
          text: "Depoimento atualizado com sucesso!",
        });
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text: errorData.error || "Erro ao atualizar depoimento",
        });
      }
    } catch (error) {
      console.error("Error updating testimonial:", error);
      setMessage({ type: "error", text: "Erro ao conectar com o servidor" });
    }
  };

  const handleDeleteTestimonial = async (testimonialId: number) => {
    if (!confirm("Tem certeza que deseja deletar este depoimento?")) return;

    try {
      const response = await fetch(`/api/testimonials/${testimonialId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchTestimonials();
        setMessage({
          type: "success",
          text: "Depoimento deletado com sucesso!",
        });
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text: errorData.error || "Erro ao deletar depoimento",
        });
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      setMessage({ type: "error", text: "Erro ao conectar com o servidor" });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
      >
        ★
      </span>
    ));
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
              Depoimentos
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie os depoimentos da seção de parceiros
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
              ⚙️ Configurações da Seção
            </button>
            <button
              onClick={() => setActiveTab("depoimentos")}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "depoimentos"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              💬 Depoimentos ({testimonials.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "configuracoes" && (
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
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="O que nossos [destaque]Parceiros[/destaque] dizem"
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
                    onChange={(e) =>
                      handleInputChange("subtitle", e.target.value)
                    }
                    placeholder="Veja os depoimentos de quem já faz parte..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Fundo
                  </label>
                  <select
                    value={formData.background_type}
                    onChange={(e) =>
                      handleInputChange("background_type", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="white">Fundo Branco</option>
                    <option value="gray">Fundo Cinza</option>
                    <option value="gradient">Fundo Gradiente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de Depoimentos
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="12"
                    value={formData.max_testimonials}
                    onChange={(e) =>
                      handleInputChange(
                        "max_testimonials",
                        parseInt(e.target.value),
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.show_ratings}
                      onChange={(e) =>
                        handleInputChange("show_ratings", e.target.checked)
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Mostrar avaliações em estrelas
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
                  {saving ? "Salvando..." : "Salvar Configurações"}
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Preview da Seção
              </h3>
              <div
                className={`rounded-lg p-8 ${
                  formData.background_type === "white"
                    ? "bg-white"
                    : formData.background_type === "gray"
                      ? "bg-gray-50"
                      : "bg-gradient-to-r from-gray-50 to-gray-100"
                }`}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {formData.title.includes("[destaque]") ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: formData.title.replace(
                            /\[destaque\](.*?)\[\/destaque\]/g,
                            '<span class="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">$1</span>',
                          ),
                        }}
                      />
                    ) : (
                      formData.title
                    )}
                  </h2>
                  <p className="text-lg text-gray-600">{formData.subtitle}</p>
                </div>

                {testimonials
                  .slice(0, Math.min(3, formData.max_testimonials))
                  .map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="bg-white rounded-lg shadow-sm p-6 mb-4"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {testimonial.avatar_url ? (
                            <img
                              src={testimonial.avatar_url}
                              alt={testimonial.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 font-medium text-lg">
                                {testimonial.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 mb-3">
                            "{testimonial.content}"
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {testimonial.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {testimonial.role} - {testimonial.company}
                              </p>
                            </div>
                            {formData.show_ratings && (
                              <div className="flex">
                                {renderStars(testimonial.rating)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "depoimentos" && (
          <div className="space-y-6">
            {/* Add New Testimonial */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Adicionar Novo Depoimento
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={newTestimonial.name}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        name: e.target.value,
                      })
                    }
                    placeholder="Nome da pessoa"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo *
                  </label>
                  <input
                    type="text"
                    value={newTestimonial.role}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        role: e.target.value,
                      })
                    }
                    placeholder="Proprietário, Gerente, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa *
                  </label>
                  <input
                    type="text"
                    value={newTestimonial.company}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        company: e.target.value,
                      })
                    }
                    placeholder="Nome da empresa"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avaliação
                  </label>
                  <select
                    value={newTestimonial.rating}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        rating: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 estrelas)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 estrelas)</option>
                    <option value={3}>⭐⭐⭐ (3 estrelas)</option>
                    <option value={2}>⭐⭐ (2 estrelas)</option>
                    <option value={1}>⭐ (1 estrela)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Depoimento *
                  </label>
                  <textarea
                    rows={3}
                    value={newTestimonial.content}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        content: e.target.value,
                      })
                    }
                    placeholder="Conte sobre a experiência com a Ecko..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <ImageUploadCompressed
                    label="Foto (opcional)"
                    currentUrl={newTestimonial.avatar_url}
                    onUrlChange={(url) =>
                      setNewTestimonial({ ...newTestimonial, avatar_url: url })
                    }
                    previewHeight="h-24"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newTestimonial.is_active}
                      onChange={(e) =>
                        setNewTestimonial({
                          ...newTestimonial,
                          is_active: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Depoimento ativo (visível na página)
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={handleAddTestimonial}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Adicionar Depoimento
                </button>
              </div>
            </div>

            {/* Testimonials List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Depoimentos Cadastrados ({testimonials.length})
              </h3>

              <div className="space-y-4">
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {testimonial.avatar_url ? (
                            <img
                              src={testimonial.avatar_url}
                              alt={testimonial.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 font-medium">
                                {testimonial.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {testimonial.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {testimonial.role} - {testimonial.company}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {renderStars(testimonial.rating)}
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                testimonial.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {testimonial.is_active ? "Ativo" : "Inativo"}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">
                          "{testimonial.content}"
                        </p>
                        <p className="text-xs text-gray-500">
                          Posição: {testimonial.position}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => setEditingTestimonial(testimonial)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteTestimonial(testimonial.id)
                          }
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Deletar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {testimonials.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum depoimento
                  </h3>
                  <p className="text-gray-500">
                    Comece adicionando alguns depoimentos de clientes.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Testimonial Modal */}
        {editingTestimonial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <h3 className="text-lg font-medium mb-4">Editar Depoimento</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={editingTestimonial.name}
                    onChange={(e) =>
                      setEditingTestimonial({
                        ...editingTestimonial,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={editingTestimonial.role}
                    onChange={(e) =>
                      setEditingTestimonial({
                        ...editingTestimonial,
                        role: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={editingTestimonial.company}
                    onChange={(e) =>
                      setEditingTestimonial({
                        ...editingTestimonial,
                        company: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avaliação
                  </label>
                  <select
                    value={editingTestimonial.rating}
                    onChange={(e) =>
                      setEditingTestimonial({
                        ...editingTestimonial,
                        rating: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 estrelas)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 estrelas)</option>
                    <option value={3}>⭐⭐⭐ (3 estrelas)</option>
                    <option value={2}>⭐⭐ (2 estrelas)</option>
                    <option value={1}>⭐ (1 estrela)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Depoimento
                  </label>
                  <textarea
                    rows={3}
                    value={editingTestimonial.content}
                    onChange={(e) =>
                      setEditingTestimonial({
                        ...editingTestimonial,
                        content: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <ImageUploadCompressed
                    label="Foto"
                    currentUrl={editingTestimonial.avatar_url || ""}
                    onUrlChange={(url) =>
                      setEditingTestimonial({
                        ...editingTestimonial,
                        avatar_url: url,
                      })
                    }
                    previewHeight="h-24"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingTestimonial.is_active}
                      onChange={(e) =>
                        setEditingTestimonial({
                          ...editingTestimonial,
                          is_active: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Depoimento ativo
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingTestimonial(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateTestimonial}
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
