import { useEffect, useState } from "react";
import { HeroSectionData } from "@shared/hero";

export default function Index() {
  const [heroData, setHeroData] = useState<HeroSectionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    try {
      const response = await fetch("/api/hero");
      if (response.ok) {
        const data = await response.json();
        setHeroData(data);
      }
    } catch (error) {
      console.error("Error fetching hero data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Default fallback data if database is not available
  const data = heroData || {
    logo_text: "L",
    logo_image: "",
    impact_title: "Seja bem-vindo ao",
    impact_subtitle: "Futuro Digital",
    description: "Transforme suas ideias em realidade com nossa plataforma inovadora. Conecte-se, crie e conquiste novos horizontes.",
    button_text: "Comece Agora",
    background_image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80"
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('${data.background_image}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Dark Overlay with brand colors */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-gray-900/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full border border-red-500/30 shadow-lg mb-3">
              {data.logo_image ? (
                <img
                  src={data.logo_image}
                  alt="Logo"
                  className="w-16 h-16 object-contain rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center border border-white/20">
                  <span className="text-white font-bold text-xl">{data.logo_text}</span>
                </div>
              )}
            </div>

            {/* Logo Text Below Image */}
            {data.logo_image && data.logo_text && (
              <div className="text-white font-medium text-xs md:text-sm tracking-widest uppercase opacity-90 drop-shadow-lg text-center max-w-xs leading-relaxed">
                {data.logo_text}
              </div>
            )}
          </div>

          {/* Texto de Impacto */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 leading-tight tracking-tight">
              <span className="block mb-2 text-white drop-shadow-lg">
                {data.impact_title}
              </span>
              {data.impact_subtitle && (
                <span className="block bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent drop-shadow-sm text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                  {data.impact_subtitle}
                </span>
              )}
            </h1>

            {/* Divisor decorativo */}
            <div className="flex justify-center mt-6 mb-8">
              <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-red-700 rounded-full shadow-lg"></div>
            </div>
          </div>

          {/* Texto Descritivo */}
          <div className="mb-10 max-w-3xl mx-auto">
            <p className="text-lg md:text-xl lg:text-2xl text-gray-100 leading-relaxed tracking-wide font-light">
              <span className="drop-shadow-md">
                {data.description}
              </span>
            </p>
          </div>

          {/* Botão */}
          <div className="mt-8">
            <button className="group relative inline-flex items-center justify-center px-10 py-4 md:px-12 md:py-5 text-lg md:text-xl font-bold text-white bg-gradient-to-r from-red-600 to-red-800 rounded-full hover:from-red-700 hover:to-red-900 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-red-500/30 shadow-lg tracking-wide">
              <span className="relative z-10 drop-shadow-sm">{data.button_text}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 opacity-50"></div>
            </button>
          </div>

          {/* Indicador de Scroll */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex flex-col items-center text-white/70">
              <span className="text-sm mb-2">Role para baixo</span>
              <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-white/20 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-500"></div>
          <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-white/25 rounded-full animate-pulse delay-1500"></div>
        </div>
      </section>
    </div>
  );
}
