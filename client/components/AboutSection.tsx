import { useState, useEffect } from "react";
import { AboutSection as AboutSectionType, AboutStat, DEFAULT_ABOUT_DATA } from "@shared/about";

interface AboutSectionData extends AboutSectionType {
  stats: AboutStat[];
}

const renderTextWithHighlights = (text: string) => {
  return text.replace(
    /\[destaque\](.*?)\[\/destaque\]/g,
    '<span class="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent font-bold">$1</span>'
  );
};

export default function AboutSection() {
  const [sectionData, setSectionData] = useState<AboutSectionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      console.log("Fetching about...");
      const response = await fetch('/api/about');
      console.log("About Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("About data:", data);
        setSectionData(data);
      } else if (response.status === 404) {
        // Tables don't exist yet, show fallback data
        console.log("About tables not created yet, using fallback");
        setSectionData({
          id: 1,
          title: DEFAULT_ABOUT_DATA.title,
          subtitle: DEFAULT_ABOUT_DATA.subtitle,
          description: DEFAULT_ABOUT_DATA.description,
          background_type: DEFAULT_ABOUT_DATA.background_type,
          image_url: DEFAULT_ABOUT_DATA.image_url,
          button_text: DEFAULT_ABOUT_DATA.button_text,
          button_url: DEFAULT_ABOUT_DATA.button_url,
          show_stats: DEFAULT_ABOUT_DATA.show_stats,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          stats: DEFAULT_ABOUT_DATA.stats.map((stat, index) => ({
            id: index + 1,
            section_id: 1,
            title: stat.title,
            value: stat.value,
            description: stat.description,
            icon: stat.icon,
            is_active: stat.is_active,
            position: stat.position,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))
        });
      } else {
        console.error("Error fetching about:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching about:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBackgroundClasses = (backgroundType: string) => {
    switch (backgroundType) {
      case 'white':
        return 'bg-white text-gray-900';
      case 'gray':
        return 'bg-gray-50 text-gray-900';
      case 'gradient':
        return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900';
      case 'dark':
      default:
        return 'bg-gray-900 text-white';
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-300 rounded w-80"></div>
              <div className="h-4 bg-gray-300 rounded w-96"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!sectionData) {
    return null;
  }

  const activeStats = sectionData.stats
    .filter(stat => stat.is_active)
    .sort((a, b) => a.position - b.position);

  return (
    <section className={`py-16 ${getBackgroundClasses(sectionData.background_type)}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <div className="space-y-6">
            {/* Title */}
            <h2 
              className="text-3xl md:text-4xl font-bold"
              dangerouslySetInnerHTML={{ 
                __html: renderTextWithHighlights(sectionData.title) 
              }}
            />

            {/* Subtitle */}
            {sectionData.subtitle && (
              <h3 className={`text-xl md:text-2xl font-semibold ${
                sectionData.background_type === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {sectionData.subtitle}
              </h3>
            )}

            {/* Description */}
            <p className={`text-lg leading-relaxed ${
              sectionData.background_type === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {sectionData.description}
            </p>

            {/* Statistics */}
            {sectionData.show_stats && activeStats.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
                {activeStats.map((stat) => (
                  <div key={stat.id} className="text-center">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-2xl md:text-3xl font-bold text-red-600 mb-1">
                      {stat.value}
                    </div>
                    <div className={`text-sm font-medium mb-1 ${
                      sectionData.background_type === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {stat.title}
                    </div>
                    {stat.description && (
                      <div className={`text-xs ${
                        sectionData.background_type === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {stat.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Button */}
            {sectionData.button_text && sectionData.button_url && (
              <div className="pt-4">
                <a
                  href={sectionData.button_url}
                  className="inline-flex items-center bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                >
                  {sectionData.button_text}
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
            )}
          </div>

          {/* Image Side */}
          {sectionData.image_url && (
            <div className="relative">
              <div className="aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={sectionData.image_url}
                  alt="Sobre a Ecko"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-red-600 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-red-500 rounded-full opacity-30 blur-lg"></div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
