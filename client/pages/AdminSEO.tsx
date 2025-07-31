import { useState, useEffect } from "react";
import { SEOData, SEOUpdateRequest } from "@shared/seo";
import AdminAuth from "../components/AdminAuth";
import AdminLayout from "../components/AdminLayout";

export default function AdminSEO() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<SEOUpdateRequest>({
    title: "",
    description: "",
    keywords: "",
    canonical_url: "",
    og_title: "",
    og_description: "",
    og_image: "",
    og_type: "website",
    twitter_card: "summary_large_image",
    twitter_title: "",
    twitter_description: "",
    twitter_image: "",
    robots: "index, follow",
    author: "Ecko Brasil",
    language: "pt-BR"
  });

  useEffect(() => {
    fetchSEOData();
  }, []);

  const fetchSEOData = async () => {
    try {
      const response = await fetch("/api/seo");
      if (response.ok) {
        const data = await response.json();
        setSeoData(data);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          keywords: data.keywords || "",
          canonical_url: data.canonical_url || "",
          og_title: data.og_title || "",
          og_description: data.og_description || "",
          og_image: data.og_image || "",
          og_type: data.og_type || "website",
          twitter_card: data.twitter_card || "summary_large_image",
          twitter_title: data.twitter_title || "",
          twitter_description: data.twitter_description || "",
          twitter_image: data.twitter_image || "",
          robots: data.robots || "index, follow",
          author: data.author || "Ecko Brasil",
          language: data.language || "pt-BR"
        });
      }
    } catch (err) {
      setError("Erro ao carregar dados de SEO");
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
      const response = await fetch("/api/seo", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setSeoData(updatedData);
        setMessage("Configurações de SEO atualizadas com sucesso!");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erro ao salvar configurações");
      }
    } catch (err) {
      setError("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Configurações de SEO
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Configurações Básicas */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Configurações Básicas
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Página (máx. 150 caracteres)
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  maxLength={150}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/150 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (máx. 320 caracteres)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength={320}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/320 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Palavras-chave (separadas por vírgula)
                </label>
                <textarea
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="lojista ecko, franquia ecko, parceria ecko..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Can��nica
                </label>
                <input
                  type="url"
                  name="canonical_url"
                  value={formData.canonical_url}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="https://sejaum.lojista.ecko.com.br"
                />
              </div>
            </div>
          </div>

          {/* Open Graph */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Open Graph (Facebook/WhatsApp)
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título OG (máx. 100 caracteres)
                </label>
                <input
                  type="text"
                  name="og_title"
                  value={formData.og_title}
                  onChange={handleInputChange}
                  maxLength={100}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição OG (máx. 300 caracteres)
                </label>
                <textarea
                  name="og_description"
                  value={formData.og_description}
                  onChange={handleInputChange}
                  maxLength={300}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem OG (URL)
                </label>
                <input
                  type="url"
                  name="og_image"
                  value={formData.og_image}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="https://exemplo.com/imagem-og.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo OG
                </label>
                <select
                  name="og_type"
                  value={formData.og_type}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="website">Website</option>
                  <option value="article">Artigo</option>
                  <option value="business">Negócio</option>
                </select>
              </div>
            </div>
          </div>

          {/* Twitter */}
          <div className="bg-sky-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Twitter Cards
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Card
                </label>
                <select
                  name="twitter_card"
                  value={formData.twitter_card}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary Large Image</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título Twitter (máx. 100 caracteres)
                </label>
                <input
                  type="text"
                  name="twitter_title"
                  value={formData.twitter_title}
                  onChange={handleInputChange}
                  maxLength={100}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição Twitter (máx. 300 caracteres)
                </label>
                <textarea
                  name="twitter_description"
                  value={formData.twitter_description}
                  onChange={handleInputChange}
                  maxLength={300}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem Twitter (URL)
                </label>
                <input
                  type="url"
                  name="twitter_image"
                  value={formData.twitter_image}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="https://exemplo.com/imagem-twitter.jpg"
                />
              </div>
            </div>
          </div>

          {/* Configurações Técnicas */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Configurações Técnicas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Robots
                </label>
                <input
                  type="text"
                  name="robots"
                  value={formData.robots}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="index, follow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Autor
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="pt">Português</option>
                  <option value="en">Inglês</option>
                  <option value="es">Espanhol</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Salvando..." : "Salvar Configurações"}
            </button>
            
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Voltar
            </button>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">{message}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
