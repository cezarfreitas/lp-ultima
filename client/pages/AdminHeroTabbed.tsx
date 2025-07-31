import { useState, useEffect } from "react";
import { HeroSectionData, HeroUpdateRequest } from "@shared/hero";
import AdminAuth from "../components/AdminAuth";
import AdminLayout from "../components/AdminLayout";
import AdminTabs from "../components/AdminTabs";
import ImageUploadCompressed from "../components/ImageUploadCompressed";

export default function AdminHeroTabbed() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [heroData, setHeroData] = useState<HeroSectionData | null>(null);
  const [formData, setFormData] = useState<HeroUpdateRequest>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    // Check if already authenticated
    const authenticated =
      localStorage.getItem("admin_authenticated") === "true";
    setIsAuthenticated(authenticated);

    if (authenticated) {
      fetchHeroData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setLoading(true);
    fetchHeroData();
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
  };

  const fetchHeroData = async () => {
    try {
      const response = await fetch("/api/hero");
      if (response.ok) {
        const data = await response.json();
        setHeroData(data);
        setFormData({
          logo_text: data.logo_text,
          logo_image: data.logo_image,
          impact_title: data.impact_title,
          impact_subtitle: data.impact_subtitle,
          description: data.description,
          button_text: data.button_text,
          background_image: data.background_image,
        });
      }
    } catch (error) {
      console.error("Error fetching hero data:", error);
      setMessage({ type: "error", text: "Erro ao carregar dados" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/hero", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Check if response has content to read
      const contentType = response.headers.get("content-type");

      if (response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const responseData = await response.json();
          setHeroData(responseData);
        }
        setMessage({ type: "success", text: "Dados salvos com sucesso!" });
      } else {
        let errorMessage = "Erro ao salvar dados";

        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // If JSON parsing fails, use default message
          }
        }

        setMessage({ type: "error", text: errorMessage });
      }
    } catch (error) {
      console.error("Error updating hero data:", error);
      setMessage({ type: "error", text: "Erro ao salvar dados" });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof HeroUpdateRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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

  const tabs = [
    {
      id: "content",
      label: "Conteúdo",
      icon: "📝",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Impact Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título Principal
              </label>
              <textarea
                rows={3}
                value={formData.impact_title || ""}
                onChange={(e) =>
                  handleInputChange("impact_title", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Seja bem-vindo ao [destaque]Ecko[/destaque]"
              />
              <p className="text-sm text-gray-500 mt-1">
                Use{" "}
                <code className="bg-gray-100 px-1 rounded">
                  [destaque]palavra[/destaque]
                </code>{" "}
                para destacar palavras específicas
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                rows={4}
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Transforme suas ideias com a [destaque]Ecko[/destaque]..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Use{" "}
                <code className="bg-gray-100 px-1 rounded">
                  [destaque]palavra[/destaque]
                </code>{" "}
                para destacar palavras com gradiente vermelho
              </p>
            </div>

            {/* Button Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texto do Botão
              </label>
              <input
                type="text"
                value={formData.button_text || ""}
                onChange={(e) =>
                  handleInputChange("button_text", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Comece Agora"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "branding",
      label: "Marca & Imagens",
      icon: "🎨",
      content: (
        <div className="space-y-8">
          {/* Logo Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Logo</h3>
            <div className="space-y-6">
              {/* Logo Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto do Logo
                </label>
                <input
                  type="text"
                  value={formData.logo_text || ""}
                  onChange={(e) =>
                    handleInputChange("logo_text", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Transforme seu amor pela Ecko em negócios"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Texto que aparece abaixo do logo
                </p>
              </div>

              {/* Logo Image Upload */}
              <ImageUploadCompressed
                label="Imagem do Logo"
                currentUrl={formData.logo_image || ""}
                onUrlChange={(url) => handleInputChange("logo_image", url)}
                placeholder="https://exemplo.com/logo.png"
                previewHeight="h-24"
                maxWidth={400}
                quality={0.9}
              />
            </div>
          </div>

          {/* Background Image */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Imagem de Fundo
            </h3>
            <ImageUploadCompressed
              label="Imagem de Fundo da Hero"
              currentUrl={formData.background_image || ""}
              onUrlChange={(url) => handleInputChange("background_image", url)}
              placeholder="https://images.unsplash.com/..."
              previewHeight="h-48"
              maxWidth={1920}
              quality={0.8}
            />
          </div>
        </div>
      ),
    },
    {
      id: "preview",
      label: "Preview",
      icon: "👁️",
      content: (
        <div className="space-y-6">
          <div
            className="bg-gray-900 rounded-lg overflow-hidden"
            style={{ minHeight: "400px" }}
          >
            <div
              className="relative h-96 flex items-center justify-center"
              style={{
                backgroundImage: formData.background_image
                  ? `url('${formData.background_image}')`
                  : "linear-gradient(135deg, #dc2626 0%, #7c2d12 100%)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/50"></div>

              {/* Content Preview */}
              <div className="relative z-10 text-center max-w-4xl mx-auto px-6 text-white">
                {/* Logo Preview */}
                {formData.logo_image && (
                  <div className="mb-6">
                    <img
                      src={formData.logo_image}
                      alt="Logo Preview"
                      className="h-16 w-auto object-contain mx-auto"
                    />
                  </div>
                )}

                {/* Logo Text Preview */}
                {formData.logo_text && (
                  <div className="mb-8">
                    <div className="text-white font-semibold text-sm tracking-wider uppercase opacity-95">
                      {formData.logo_text}
                    </div>
                  </div>
                )}

                {/* Title Preview */}
                {formData.impact_title && (
                  <h1 className="text-2xl md:text-3xl font-black text-white mb-4 uppercase">
                    {formData.impact_title.replace(
                      /\[destaque\](.*?)\[\/destaque\]/g,
                      "$1",
                    )}
                  </h1>
                )}

                {/* Description Preview */}
                {formData.description && (
                  <p className="text-sm text-gray-200 mb-6 max-w-xl mx-auto">
                    {formData.description.replace(
                      /\[destaque\](.*?)\[\/destaque\]/g,
                      "$1",
                    )}
                  </p>
                )}

                {/* Button Preview */}
                {formData.button_text && (
                  <button className="bg-red-600 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide">
                    {formData.button_text}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="text-center">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
            >
              Ver página completa →
            </a>
          </div>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout onLogout={handleLogout}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-8 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seção Hero</h1>
          <p className="text-gray-600">
            Configure o conteúdo da seção principal da landing page
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form with Tabs */}
        <form onSubmit={handleSubmit}>
          <AdminTabs tabs={tabs} />

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
