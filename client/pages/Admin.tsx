import { useState, useEffect } from "react";
import { HeroSectionData, HeroUpdateRequest } from "@shared/hero";
import AdminAuth from "../components/AdminAuth";
import AdminLayout from "../components/AdminLayout";
import AdminTabs from "../components/AdminTabs";
import ImageUpload from "../components/ImageUpload";

export default function Admin() {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <div className="max-w-4xl mx-auto">
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm p-6 space-y-6"
        >
          {/* Logo Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto do Logo
            </label>
            <input
              type="text"
              value={formData.logo_text || ""}
              onChange={(e) => handleInputChange("logo_text", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="L"
            />
            <p className="text-sm text-gray-500 mt-1">
              Texto do logo (usado apenas se não houver imagem)
            </p>
          </div>

          {/* Logo Image Upload */}
          <ImageUpload
            label="Imagem do Logo"
            currentUrl={formData.logo_image || ""}
            onUrlChange={(url) => handleInputChange("logo_image", url)}
            placeholder="https://exemplo.com/logo.png"
            previewHeight="h-20"
          />

          {/* Impact Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título Principal
            </label>
            <input
              type="text"
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
              onChange={(e) => handleInputChange("description", e.target.value)}
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
              onChange={(e) => handleInputChange("button_text", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Comece Agora"
            />
          </div>

          {/* Background Image Upload */}
          <ImageUpload
            label="Imagem de Fundo"
            currentUrl={formData.background_image || ""}
            onUrlChange={(url) => handleInputChange("background_image", url)}
            placeholder="https://images.unsplash.com/..."
            previewHeight="h-48"
          />

          {/* Save Button */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <a
              href="/"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Voltar para a homepage
            </a>
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
