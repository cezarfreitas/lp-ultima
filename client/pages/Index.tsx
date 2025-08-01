import { useEffect, useState, lazy, Suspense } from "react";
import { HeroSectionData } from "@shared/hero";
import { FormContent } from "@shared/form-content";
import { ProductGallery } from "@shared/product-gallery";
import { silentFetchJson } from "../lib/silentFetch";
import { getApiUrl } from "../lib/apiUrl";
import { checkApiHealth, getApiHealthStatus } from "../lib/apiHealth";
import LeadCaptureForm from "../components/LeadCaptureForm";
import SEOHead from "../components/SEOHead";
import PixelInjector from "../components/PixelInjector";
import CriticalCSS from "../components/CriticalCSS";
import LazySection from "../components/LazySection";
import OptimizedImage from "../components/OptimizedImage";
import APIStatus from "../components/APIStatus";

// Lazy load non-critical components
const TestimonialsSection = lazy(
  () => import("../components/TestimonialsSection"),
);
const ShowroomSection = lazy(() => import("../components/ShowroomSection"));
const FAQSection = lazy(() => import("../components/FAQSection"));
const AboutSection = lazy(() => import("../components/AboutSection"));
const Footer = lazy(() => import("../components/Footer"));

export default function Index() {
  const [heroData, setHeroData] = useState<HeroSectionData | null>(null);
  const [formContent, setFormContent] = useState<FormContent | null>(null);
  const [productGallery, setProductGallery] = useState<ProductGallery | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add delay to avoid immediate fetch errors on initial load
    const timer = setTimeout(async () => {
      // Check API health first
      const isHealthy = await checkApiHealth();

      if (isHealthy) {
        fetchHeroData();
        fetchFormContent();
        fetchProductGallery();
      } else {
        // API is not responding, set loading to false and continue with default data
        console.log('API not available, using default data');
        setLoading(false);

        // Try again later
        setTimeout(() => {
          fetchHeroData();
          fetchFormContent();
          fetchProductGallery();
        }, 10000); // Try again in 10 seconds
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Function to optimize image URLs (only for Unsplash)
  const getOptimizedImageUrl = (url: string, width = 1920, quality = 75) => {
    if (!url) return url;

    if (url.includes("unsplash.com")) {
      return `${url}&w=${width}&auto=format&fit=crop&q=${quality}`;
    }

    return url;
  };

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
          <span key={index} className="text-primary font-bold drop-shadow-sm">
            {highlightedText}
          </span>
        );
      }
      return part;
    });
  };

  const fetchHeroData = async () => {
    try {
      const data = await silentFetchJson<HeroSectionData>(
        getApiUrl("api/hero"),
        {},
        15000,
      );
      if (data) {
        setHeroData(data);
      }
    } catch (error) {
      // silentFetch handles errors silently
    } finally {
      setLoading(false);
    }
  };

  const fetchFormContent = async () => {
    try {
      const data = await silentFetchJson<FormContent>(
        getApiUrl("api/form-content"),
        {},
        15000,
      );
      if (data) {
        setFormContent(data);
      }
    } catch (error) {
      // silentFetch handles errors silently
    }
  };

  const fetchProductGallery = async (retryCount = 0) => {
    try {
      // Check API health before attempting fetch
      if (retryCount === 0) {
        const isHealthy = await checkApiHealth();
        if (!isHealthy && getApiHealthStatus() === 'unhealthy') {
          console.log('API unhealthy, skipping product gallery fetch');
          return;
        }
      }

      const data = await silentFetchJson<ProductGallery>(
        getApiUrl("api/product-gallery"),
        {},
        20000, // 20 second timeout for product gallery
      );

      if (data) {
        setProductGallery(data);
      } else if (retryCount < 1) {
        // Reduced retries - only retry once
        setTimeout(
          () => {
            fetchProductGallery(retryCount + 1);
          },
          5000, // 5 second delay
        );
      }
    } catch (error) {
      // silentFetch handles errors silently
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-200">Carregando...</p>
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
    <APIStatus showNotice={true}>
      <div className="min-h-screen">
        {/* Critical CSS */}
        <CriticalCSS />

        {/* SEO Head Management */}
        <SEOHead />

        {/* Pixel Injection */}
        <PixelInjector />

        {/* Hero Section with Background Image */}
        <section className="hero-section">
          {/* Background Image */}
          <div
            className="hero-bg"
            style={{
              backgroundImage: `url('${getOptimizedImageUrl(data.background_image, 1600, 70)}')`,
            }}
          >
            {/* Dark Overlay with brand colors */}
            <div className="hero-overlay"></div>
          </div>

          {/* Content */}
          <div className="hero-content">
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
                <div className="text-center mb-6 md:mb-8">
                  <div className="text-white font-semibold text-xs sm:text-sm md:text-base lg:text-lg tracking-wider uppercase opacity-95 leading-relaxed max-w-2xl mx-auto px-4">
                    {data.logo_text}
                  </div>
                </div>
              )}
            </div>

            {/* Texto de Impacto */}
            <div className="mb-8 md:mb-12">
              <h1 className="hero-title">
                {renderTextWithHighlights(data.impact_title)}
              </h1>

              {/* Divisor decorativo */}
              <div className="flex justify-center mb-6 md:mb-10">
                <div className="h-1 w-12 md:w-16 bg-gradient-to-r from-red-500 to-red-700 rounded-full shadow-lg"></div>
              </div>
            </div>

            {/* Texto Descritivo */}
            <div className="mb-8 md:mb-12 max-w-2xl mx-auto px-4">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 leading-relaxed tracking-wide font-normal text-center">
                <span className="drop-shadow-lg opacity-95">
                  {renderTextWithHighlights(data.description)}
                </span>
              </p>
            </div>

            {/* Botão */}
            <div className="mt-6 md:mt-10 mb-12 md:mb-20">
              <a href="#form" className="hero-btn">
                {data.button_text}
              </a>
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

        {/* Product Gallery Section */}
        <section className="py-12 md:py-16 lg:py-20 xl:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            {/* Section Header */}
            <div className="text-center mb-8 md:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight px-4">
                {renderTextWithHighlights(
                  productGallery?.title ||
                    "Nossos [destaque]Produtos[/destaque]",
                )}
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto px-4">
                {renderTextWithHighlights(
                  productGallery?.subtitle ||
                    "Descubra a coleção exclusiva Ecko com estilo urbano autêntico e qualidade premium",
                )}
              </p>
              <div className="flex justify-center mt-4 md:mt-8">
                <div className="h-1 w-12 md:w-16 bg-gradient-to-r from-red-500 to-red-700 rounded-full shadow-lg"></div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {productGallery?.products
                ?.sort((a, b) => a.position - b.position)
                .map((product, index) => (
                  <div
                    key={product.id}
                    className="group relative bg-white rounded-lg md:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 md:hover:-translate-y-2 overflow-hidden"
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg md:rounded-xl overflow-hidden">
                      <OptimizedImage
                        src={product.image_url}
                        alt={product.alt_text}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        width={300}
                        height={300}
                        priority={index < 4}
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 300px"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Call to Action */}
            <div className="text-center mt-8 md:mt-12 lg:mt-16 px-4">
              <p className="text-base md:text-lg text-gray-600 mb-4 md:mb-6">
                {renderTextWithHighlights(
                  productGallery?.cta_description ||
                    "Como lojista Ecko, você terá acesso a todos esses produtos com preços especiais",
                )}
              </p>
              <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base md:text-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg">
                {productGallery?.cta_text || "Ver Catálogo Completo"}
              </button>
            </div>
          </div>
        </section>

        {/* Lead Capture Section */}
        <section
          id="form"
          className="py-12 md:py-16 lg:py-20 xl:py-24 bg-gray-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Column - Benefits/Reasons */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                    {renderTextWithHighlights(formContent?.main_title || "")}
                  </h2>
                  <p className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed">
                    {renderTextWithHighlights(formContent?.main_subtitle || "")}
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Benefit 1 */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 md:w-6 md:h-6 text-red-600"
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
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">
                        {renderTextWithHighlights(
                          formContent?.benefit1_title || "",
                        )}
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                        {renderTextWithHighlights(
                          formContent?.benefit1_description || "",
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Benefit 2 */}
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 md:w-6 md:h-6 text-red-600"
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
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">
                        {renderTextWithHighlights(
                          formContent?.benefit2_title || "",
                        )}
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                        {renderTextWithHighlights(
                          formContent?.benefit2_description || "",
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Benefit 3 */}
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 md:w-6 md:h-6 text-red-600"
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
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">
                        {renderTextWithHighlights(
                          formContent?.benefit3_title || "",
                        )}
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                        {renderTextWithHighlights(
                          formContent?.benefit3_description || "",
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Benefit 4 */}
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 md:w-6 md:h-6 text-red-600"
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
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">
                        {renderTextWithHighlights(
                          formContent?.benefit4_title || "",
                        )}
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                        {renderTextWithHighlights(
                          formContent?.benefit4_description || "",
                        )}
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
                      {renderTextWithHighlights(formContent?.form_title || "")}
                    </h3>
                    <p className="text-gray-600">
                      {renderTextWithHighlights(
                        formContent?.form_subtitle || "",
                      )}
                    </p>
                  </div>

                  <LeadCaptureForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Showroom Section */}
        <Suspense
          fallback={<div className="min-h-96 bg-gray-100 animate-pulse" />}
        >
          <LazySection>
            <ShowroomSection />
          </LazySection>
        </Suspense>

        {/* Testimonials Section */}
        <Suspense
          fallback={<div className="min-h-96 bg-gray-50 animate-pulse" />}
        >
          <LazySection>
            <TestimonialsSection />
          </LazySection>
        </Suspense>

        {/* FAQ Section */}
        <Suspense
          fallback={<div className="min-h-96 bg-white animate-pulse" />}
        >
          <LazySection>
            <FAQSection />
          </LazySection>
        </Suspense>

        {/* About Section */}
        <Suspense
          fallback={<div className="min-h-96 bg-gray-50 animate-pulse" />}
        >
          <LazySection>
            <AboutSection />
          </LazySection>
        </Suspense>

        {/* Footer */}
        <Suspense
          fallback={<div className="min-h-48 bg-gray-900 animate-pulse" />}
        >
          <LazySection>
            <Footer />
          </LazySection>
        </Suspense>
      </div>
    </APIStatus>
  );
}
