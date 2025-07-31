import { useEffect, useState } from "react";
import { HeroSectionData } from "@shared/hero";
import { FormContent } from "@shared/form-content";
import LeadCaptureForm from "../components/LeadCaptureForm";

export default function Index() {
  const [heroData, setHeroData] = useState<HeroSectionData | null>(null);
  const [formContent, setFormContent] = useState<FormContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroData();
    fetchFormContent();
  }, []);

  // Function to render text with highlights
  const renderTextWithHighlights = (text: string) => {
    if (!text) return text;

    // Split text by [destaque] tags
    const parts = text.split(/(\[destaque\].*?\[\/destaque\])/g);

    return parts.map((part, index) => {
      if (part.startsWith("[destaque]") && part.endsWith("[/destaque]")) {
        // Extract the highlighted text
        const highlightedText = part
          .replace(/^\[destaque\]/, "")
          .replace(/\[\/destaque\]$/, "");
        return (
          <span
            key={index}
            className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent font-bold drop-shadow-sm"
          >
            {highlightedText}
          </span>
        );
      }
      return part;
    });
  };

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

  const fetchFormContent = async () => {
    try {
      const response = await fetch("/api/form-content");
      if (response.ok) {
        const data = await response.json();
        setFormContent(data);
      }
    } catch (error) {
      console.error("Error fetching form content:", error);
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
    description:
      "Transforme suas ideias em realidade com nossa plataforma inovadora. Conecte-se, crie e conquiste novos horizontes.",
    button_text: "Comece Agora",
    background_image:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80",
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
        <div className="relative z-10 text-center max-w-6xl mx-auto px-6 md:px-8 lg:px-16 py-8">
          {/* Logo */}
          <div className="mb-12 flex flex-col items-center">
            {data.logo_image ? (
              <div className="mb-6">
                <img
                  src={data.logo_image}
                  alt="Logo"
                  className="h-20 md:h-24 lg:h-28 w-auto object-contain"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center border border-white/20 mb-6">
                <span className="text-white font-bold text-xl">
                  {data.logo_text}
                </span>
              </div>
            )}

            {/* Slogan/Tagline */}
            {data.logo_text && (
              <div className="text-center mb-8">
                <div className="text-white font-semibold text-sm md:text-base lg:text-lg tracking-wider uppercase opacity-95 leading-relaxed max-w-2xl mx-auto">
                  {data.logo_text}
                </div>
              </div>
            )}
          </div>

          {/* Texto de Impacto */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-8 leading-[1.1] tracking-tight uppercase text-center max-w-4xl mx-auto">
              <span className="block text-white drop-shadow-2xl">
                {renderTextWithHighlights(data.impact_title)}
              </span>
            </h1>

            {/* Divisor decorativo */}
            <div className="flex justify-center mb-10">
              <div className="h-1 w-16 bg-gradient-to-r from-red-500 to-red-700 rounded-full shadow-lg"></div>
            </div>
          </div>

          {/* Texto Descritivo */}
          <div className="mb-12 max-w-2xl mx-auto">
            <p className="text-base md:text-lg lg:text-xl text-gray-200 leading-relaxed tracking-wide font-normal text-center">
              <span className="drop-shadow-lg opacity-95">
                {renderTextWithHighlights(data.description)}
              </span>
            </p>
          </div>

          {/* Botão */}
          <div className="mt-10 mb-20">
            <button className="group relative inline-flex items-center justify-center px-12 py-4 md:px-16 md:py-5 text-base md:text-lg lg:text-xl font-bold text-white bg-gradient-to-r from-red-600 to-red-800 rounded-full hover:from-red-700 hover:to-red-900 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl border-2 border-red-500/40 shadow-xl tracking-wide uppercase">
              <span className="relative z-10 drop-shadow-lg">
                {data.button_text}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-full opacity-0 group-hover:opacity-25 transition-opacity duration-300"></div>

              {/* Enhanced glow effect */}
              <div className="absolute inset-0 bg-red-500/30 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-60"></div>
            </button>
          </div>
        </div>

        {/* Indicador de Scroll - Positioned at the very bottom */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center text-white/90">
            <span className="text-xs md:text-sm mb-3 font-medium tracking-widest uppercase drop-shadow-xl">
              Role para baixo
            </span>
            <div className="w-6 h-10 border-2 border-red-500/80 rounded-full flex justify-center backdrop-blur-md bg-black/20 shadow-2xl">
              <div className="w-1.5 h-3 bg-red-500 rounded-full mt-2 animate-bounce shadow-xl"></div>
            </div>

            {/* Seta decorativa */}
            <div className="mt-2 animate-bounce delay-500">
              <svg
                className="w-3 h-3 text-red-500/70"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top elements */}
          <div className="absolute top-20 left-8 w-2 h-2 bg-red-400/40 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-12 w-1 h-1 bg-white/50 rounded-full animate-pulse delay-700"></div>

          {/* Middle elements */}
          <div className="absolute top-1/2 left-16 w-3 h-3 bg-red-300/30 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-20 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse delay-300"></div>

          {/* Bottom elements */}
          <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-red-500/35 rounded-full animate-pulse delay-1500"></div>
          <div className="absolute bottom-40 right-1/3 w-2.5 h-2.5 bg-white/30 rounded-full animate-pulse delay-200"></div>
          <div className="absolute bottom-24 left-3/4 w-1 h-1 bg-red-400/45 rounded-full animate-pulse delay-1200"></div>

          {/* Geometric shapes */}
          <div className="absolute top-1/3 right-8 w-4 h-4 border border-red-500/25 rotate-45 animate-pulse delay-800"></div>
          <div className="absolute bottom-1/3 left-12 w-5 h-5 border border-white/20 rounded-full animate-pulse delay-600"></div>
        </div>
      </section>

      {/* Lead Capture Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Benefits/Reasons */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {renderTextWithHighlights(formContent?.main_title || "")}
                </h2>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  {renderTextWithHighlights(formContent?.main_subtitle || "")}
                </p>
              </div>

              <div className="space-y-6">
                {/* Benefit 1 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {renderTextWithHighlights(formContent?.benefit1_title || "")}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {renderTextWithHighlights(formContent?.benefit1_description || "")}
                    </p>
                  </div>
                </div>

                {/* Benefit 2 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {renderTextWithHighlights(formContent?.benefit2_title || "")}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {renderTextWithHighlights(formContent?.benefit2_description || "")}
                    </p>
                  </div>
                </div>

                {/* Benefit 3 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {renderTextWithHighlights(formContent?.benefit3_title || "")}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {renderTextWithHighlights(formContent?.benefit3_description || "")}
                    </p>
                  </div>
                </div>

                {/* Benefit 4 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {renderTextWithHighlights(formContent?.benefit4_title || "")}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {renderTextWithHighlights(formContent?.benefit4_description || "")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:pl-8">
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
                <div className="text-center mb-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    {renderTextWithHighlights(
                      formContent?.form_title || "Seja um Lojista Oficial",
                    )}
                  </h3>
                  <p className="text-gray-600">
                    {renderTextWithHighlights(
                      formContent?.form_subtitle ||
                        "Preencha o formulário e nossa equipe entrará em contato em até 24 horas.",
                    )}
                  </p>
                </div>

                <LeadCaptureForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
