import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface AdminLayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

export default function AdminLayout({ children, onLogout }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      name: "Seção Hero",
      href: "/admin",
      icon: "🏠",
      description: "Configurar conteúdo principal",
    },
    {
      name: "Cores & Fontes",
      href: "/admin/design",
      icon: "🎨",
      description: "Personalizar aparência",
    },
    {
      name: "SEO",
      href: "/admin/seo",
      icon: "🚀",
      description: "Otimização para mecanismos de busca",
    },
    {
      name: "Pixels",
      href: "/admin/pixels",
      icon: "📊",
      description: "Códigos de rastreamento e analytics",
    },
    {
      name: "Leads",
      href: "/admin/leads",
      icon: "👥",
      description: "Gerenciar leads capturados",
    },
    {
      name: "Textos Formulário",
      href: "/admin/form-content",
      icon: "📝",
      description: "Editar textos da seção do formulário",
    },
    {
      name: "Galeria Produtos",
      href: "/admin/product-gallery",
      icon: "🖼️",
      description: "Gerenciar galeria de produtos",
    },
    {
      name: "Depoimentos",
      href: "/admin/testimonials",
      icon: "💬",
      description: "Gerenciar depoimentos de clientes",
    },
    {
      name: "FAQ",
      href: "/admin/faq",
      icon: "❓",
      description: "Gerenciar perguntas frequentes",
    },
    {
      name: "Showroom",
      href: "/admin/showroom",
      icon: "🎬",
      description: "Gerenciar showroom e experiências",
    },
    {
      name: "Sobre a Ecko",
      href: "/admin/about",
      icon: "🏢",
      description: "Gerenciar seção sobre a empresa",
    },
    {
      name: "Rodapé",
      href: "/admin/footer",
      icon: "🦶",
      description: "Gerenciar conteúdo do rodapé",
    },
    {
      name: "Cache",
      href: "/admin/cache",
      icon: "🗄️",
      description: "Gerenciar cache e performance",
    },
    {
      name: "Configurações",
      href: "/admin/settings",
      icon: "⚙️",
      description: "Configurações gerais",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`group flex items-start p-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-2xl mr-3">{item.icon}</span>
                <div>
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Ver Site →
            </a>
            <button
              onClick={onLogout}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:flex lg:flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700 lg:hidden"
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <span className="block w-full h-0.5 bg-current"></span>
              <span className="block w-full h-0.5 bg-current"></span>
              <span className="block w-full h-0.5 bg-current"></span>
            </div>
          </button>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Painel Administrativo</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
