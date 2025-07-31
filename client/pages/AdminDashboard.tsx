import { useState, useEffect } from "react";
import AdminAuth from "../components/AdminAuth";
import AdminLayout from "../components/AdminLayout";

// Import existing admin components
import AdminHeroTabbed from "./AdminHeroTabbed";
import AdminSEO from "./AdminSEO";
import AdminFormContent from "./AdminFormContent";
import AdminProductGallery from "./AdminProductGallery";
import AdminTestimonials from "./AdminTestimonials";
import AdminFAQ from "./AdminFAQ";
import AdminShowroom from "./AdminShowroom";
import AdminAbout from "./AdminAbout";
import AdminFooter from "./AdminFooter";
import AdminSettings from "./AdminSettings";
import AdminLeads from "./AdminLeads";

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  component: React.ComponentType;
  description: string;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");
  const [loading, setLoading] = useState(true);

  const navigationItems: NavigationItem[] = [
    {
      id: "hero",
      label: "Hero Section",
      icon: "🏠",
      component: AdminHeroTabbed,
      description: "Seção principal da página",
    },
    {
      id: "seo",
      label: "SEO",
      icon: "🚀",
      component: AdminSEO,
      description: "Otimização para mecanismos de busca",
    },
    {
      id: "form",
      label: "Formulário",
      icon: "📝",
      component: AdminFormContent,
      description: "Conteúdo do formulário de leads",
    },
    {
      id: "gallery",
      label: "Galeria",
      icon: "🖼️",
      component: AdminProductGallery,
      description: "Galeria de produtos",
    },
    {
      id: "testimonials",
      label: "Depoimentos",
      icon: "💬",
      component: AdminTestimonials,
      description: "Depoimentos de clientes",
    },
    {
      id: "faq",
      label: "FAQ",
      icon: "❓",
      component: AdminFAQ,
      description: "Perguntas frequentes",
    },
    {
      id: "showroom",
      label: "Showroom",
      icon: "🏪",
      component: AdminShowroom,
      description: "Showcases de produtos",
    },
    {
      id: "about",
      label: "Sobre",
      icon: "ℹ️",
      component: AdminAbout,
      description: "Seção sobre a empresa",
    },
    {
      id: "footer",
      label: "Rodapé",
      icon: "🦶",
      component: AdminFooter,
      description: "Links do rodapé",
    },
    {
      id: "leads",
      label: "Leads",
      icon: "👥",
      component: AdminLeads,
      description: "Gerenciar leads capturados",
    },
    {
      id: "settings",
      label: "Configurações",
      icon: "⚙️",
      component: AdminSettings,
      description: "Configurações gerais",
    },
  ];

  useEffect(() => {
    // Check if already authenticated
    const authenticated =
      localStorage.getItem("admin_authenticated") === "true";
    setIsAuthenticated(authenticated);
    setLoading(false);
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  const ActiveComponent =
    navigationItems.find((item) => item.id === activeTab)?.component ||
    AdminHeroTabbed;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">🎯 Admin Ecko</h1>
            <p className="text-sm text-gray-600 mt-1">
              Painel de administração
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors duration-200 group ${
                  activeTab === item.id
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "text-gray-700 hover:bg-gray-100 border border-transparent"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
            >
              🚪 Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {navigationItems.find((item) => item.id === activeTab)?.label}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {
                    navigationItems.find((item) => item.id === activeTab)
                      ?.description
                  }
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-3">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  👁️ Ver Site
                </a>

                <a
                  href="/setup-complete"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  🛠️ Setup
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* SEO Alert for new feature */}
            {activeTab === "seo" && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🚀</span>
                  <div>
                    <h3 className="font-semibold text-red-900 text-lg">
                      Novo: Otimização de SEO para "Seja um Lojista Oficial
                      Ecko"
                    </h3>
                    <p className="text-red-800 text-sm mt-1">
                      Configure meta tags, Open Graph, Twitter Cards e dados
                      estruturados otimizados para capturar lojistas
                      interessados na parceria Ecko.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Render Active Component */}
            <div className="bg-white rounded-lg shadow-sm">
              <ActiveComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
