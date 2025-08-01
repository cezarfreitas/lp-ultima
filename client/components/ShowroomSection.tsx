import { useState, useEffect } from "react";
import {
  ShowroomSection as ShowroomSectionType,
  ShowroomItem,
} from "@shared/showroom";

interface ShowroomSectionData extends ShowroomSectionType {
  items: ShowroomItem[];
}

const renderTextWithHighlights = (text: string) => {
  return text.replace(
    /\[destaque\](.*?)\[\/destaque\]/g,
    '<span class="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent font-bold">$1</span>',
  );
};

export default function ShowroomSection() {
  const [sectionData, setSectionData] = useState<ShowroomSectionData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShowroom();
  }, []);

  const fetchShowroom = async () => {
    try {
      console.log("Fetching showroom...");
      const { silentFetch } = await import("../lib/silentFetch");
      const { getApiUrl } = await import("../lib/apiUrl");
      const response = await silentFetch(getApiUrl("api/showroom"));
      console.log("Showroom Response status:", response.status);

      if (response && response.ok) {
        const data = await response.json();
        console.log("Showroom data:", data);
        setSectionData(data);
      } else if (response.status === 404) {
        // Tables don't exist yet, show fallback data
        console.log("Showroom tables not created yet, using fallback");
        setSectionData({
          id: 1,
          title: "Nosso [destaque]Showroom[/destaque]",
          subtitle:
            "Explore experiências visuais que capturam a essência da marca Ecko em diferentes contextos e estilos.",
          background_type: "dark",
          layout_type: "masonry",
          max_items: 12,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          items: [
            {
              id: 1,
              title: "Ambiente Urbano Moderno",
              description:
                "Veja como os produtos Ecko se destacam em ambientes urbanos contemporâneos com estilo e atitude.",
              media_url:
                "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              media_type: "image",
              is_featured: true,
              is_active: true,
              position: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 2,
              title: "Street Style Autêntico",
              description:
                "Looks urbanos que capturam a essência da cultura de rua com produtos Ecko em cenários reais.",
              media_url:
                "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              media_type: "image",
              is_featured: true,
              is_active: true,
              position: 2,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 3,
              title: "Lifestyle Urbano",
              description:
                "Como o estilo Ecko se integra no dia a dia de pessoas que vivem a cultura urbana intensamente.",
              media_url:
                "https://images.unsplash.com/photo-1515446482533-e1b46e73b0f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              media_type: "image",
              is_featured: false,
              is_active: true,
              position: 3,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 4,
              title: "Coleção Premium",
              description:
                "Detalhes dos produtos premium da linha Ecko com foco na qualidade e design exclusivo.",
              media_url:
                "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              media_type: "image",
              is_featured: false,
              is_active: true,
              position: 4,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 5,
              title: "Espaço de Venda Moderno",
              description:
                "Inspiração para como organizar e apresentar produtos Ecko em espaços de varejo modernos.",
              media_url:
                "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              media_type: "image",
              is_featured: false,
              is_active: true,
              position: 5,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 6,
              title: "Looks Masculinos",
              description:
                "Combinações masculinas que mostram a versatilidade e estilo dos produtos Ecko para homens.",
              media_url:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              media_type: "image",
              is_featured: false,
              is_active: true,
              position: 6,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        });
      } else {
        console.error("Error fetching showroom:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching showroom:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBackgroundClasses = (backgroundType: string) => {
    switch (backgroundType) {
      case "white":
        return "bg-white text-gray-900";
      case "gray":
        return "bg-gray-50 text-gray-900";
      case "gradient":
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900";
      case "dark":
      default:
        return "bg-gray-900 text-white";
    }
  };

  const getGridClasses = (layoutType: string) => {
    switch (layoutType) {
      case "grid":
        return "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6";
      case "carousel":
        return "flex space-x-4 md:space-x-6 overflow-x-auto pb-4";
      case "masonry":
      default:
        return "columns-2 md:columns-2 lg:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6";
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-700 rounded w-80"></div>
              <div className="h-4 bg-gray-700 rounded w-96"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!sectionData || !sectionData.items || sectionData.items.length === 0) {
    return null;
  }

  const filteredItems = sectionData.items.filter((item) => item.is_active);

  const visibleItems = filteredItems
    .sort((a, b) => {
      // Featured items first, then by position
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return a.position - b.position;
    })
    .slice(0, sectionData.max_items || 12);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <section
      className={`py-12 md:py-16 ${getBackgroundClasses(sectionData.background_type)}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4"
            dangerouslySetInnerHTML={{
              __html: renderTextWithHighlights(sectionData.title),
            }}
          />
          <p
            className={`text-base md:text-lg max-w-3xl mx-auto ${
              sectionData.background_type === "dark"
                ? "text-gray-300"
                : "text-gray-600"
            }`}
          >
            {sectionData.subtitle}
          </p>
        </div>

        {/* Items Grid */}
        <div className={getGridClasses(sectionData.layout_type)}>
          {visibleItems.map((item, index) => (
            <div
              key={item.id}
              className={`relative group overflow-hidden rounded-lg md:rounded-xl ${
                sectionData.layout_type === "masonry"
                  ? "break-inside-avoid mb-4 md:mb-6"
                  : ""
              } ${
                item.is_featured && index < 2
                  ? "md:col-span-2 lg:col-span-1"
                  : ""
              }`}
            >
              <div className="relative">
                {item.media_type === "video" ? (
                  <video
                    src={item.media_url}
                    className="w-full h-auto object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={item.media_url}
                    alt={item.title}
                    className="w-full h-auto object-cover"
                  />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-end">
                  <div className="p-3 md:p-6 text-white transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex items-center space-x-2 mb-2">
                      {item.is_featured && (
                        <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded font-medium">
                          Destaque
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm md:text-lg font-bold mb-1 md:mb-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs md:text-sm text-gray-200 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Play icon for videos */}
                {item.media_type === "video" && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-black bg-opacity-50 rounded-full p-2">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p
            className={`mb-4 ${
              sectionData.background_type === "dark"
                ? "text-gray-300"
                : "text-gray-600"
            }`}
          >
            Inspire-se e faça parte deste universo de estilo
          </p>
          <a
            href="#form"
            className="inline-flex items-center bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
          >
            Seja um Lojista Ecko
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
