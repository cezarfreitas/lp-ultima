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
        return 'bg-white';
      case 'gray':
        return 'bg-gray-50';
      case 'gradient':
        return 'bg-gradient-to-br from-gray-50 to-gray-100';
      case 'dark':
      default:
        return 'bg-gray-900';
    }
  };

  if (loading) {
    return (
      <section className="py-16 md:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
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

  const isDark = sectionData.background_type === 'dark';

  return (
    <section className={`py-16 md:py-20 lg:py-24 relative overflow-hidden ${getBackgroundClasses(sectionData.background_type)}`}>
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-40 h-40 bg-red-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-32 h-32 bg-red-600 rounded-full opacity-10 blur-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 relative">
        {/* Header */}
        <div className="text-center mb-16">
          {/* Decorative Line */}
          <div className="flex items-center justify-center mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent w-24"></div>
          </div>

          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            dangerouslySetInnerHTML={{ 
              __html: renderTextWithHighlights(sectionData.title) 
            }}
          />
          
          {sectionData.subtitle && (
            <p className={`text-xl md:text-2xl font-medium max-w-3xl mx-auto ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {sectionData.subtitle}
            </p>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center mb-16">
          {/* Content Side */}
          <div className="space-y-8">
            {/* Description */}
            <div className="space-y-6">
              <p className={`text-lg md:text-xl leading-relaxed ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {sectionData.description}
              </p>
            </div>

            {/* Button */}
            {sectionData.button_text && sectionData.button_url && (
              <div className="pt-4">
                <a
                  href={sectionData.button_url}
                  className="group inline-flex items-center bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {sectionData.button_text}
                  <svg className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
            )}
          </div>

          {/* Image Side */}
          {sectionData.image_url && (
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={sectionData.image_url}
                  alt="Sobre a Ecko"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -top-6 -right-6 bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-2xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="text-center">
                  <div className="text-2xl font-bold">25+</div>
                  <div className="text-xs uppercase tracking-wider">Anos</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        {sectionData.show_stats && activeStats.length > 0 && (
          <div className="relative">
            {/* Decorative Line */}
            <div className="flex items-center justify-center mb-12">
              <div className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent w-32"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {activeStats.map((stat, index) => (
                <div 
                  key={stat.id} 
                  className={`relative group p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${
                    isDark 
                      ? 'bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10' 
                      : 'bg-white shadow-lg hover:shadow-xl border border-gray-100'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Icon */}
                  <div className="text-4xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  
                  {/* Value */}
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    
                    {/* Title */}
                    <div className={`text-sm md:text-base font-semibold mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stat.title}
                    </div>
                    
                    {/* Description */}
                    {stat.description && (
                      <p className={`text-xs md:text-sm leading-relaxed ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {stat.description}
                      </p>
                    )}
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-600/0 group-hover:from-red-500/5 group-hover:to-red-600/5 rounded-2xl transition-all duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
