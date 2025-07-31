import { useState, useEffect } from "react";
import { TestimonialsSection as TestimonialsSectionType, Testimonial } from "@shared/testimonials";

interface TestimonialsSectionData extends TestimonialsSectionType {
  testimonials: Testimonial[];
}

const renderTextWithHighlights = (text: string) => {
  return text.replace(
    /\[destaque\](.*?)\[\/destaque\]/g,
    '<span class="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent font-bold">$1</span>'
  );
};

export default function TestimonialsSection() {
  const [sectionData, setSectionData] = useState<TestimonialsSectionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials');
      if (response.ok) {
        const data = await response.json();
        setSectionData(data);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const getBackgroundClasses = (backgroundType: string) => {
    switch (backgroundType) {
      case 'white':
        return 'bg-white';
      case 'gradient':
        return 'bg-gradient-to-r from-gray-50 to-gray-100';
      case 'gray':
      default:
        return 'bg-gray-50';
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

  if (!sectionData || !sectionData.testimonials || sectionData.testimonials.length === 0) {
    return null;
  }

  const visibleTestimonials = sectionData.testimonials
    .filter(testimonial => testimonial.is_active)
    .slice(0, sectionData.max_testimonials || 6);

  if (visibleTestimonials.length === 0) {
    return null;
  }

  return (
    <section className={`py-16 ${getBackgroundClasses(sectionData.background_type)}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            dangerouslySetInnerHTML={{ 
              __html: renderTextWithHighlights(sectionData.title) 
            }}
          />
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {sectionData.subtitle}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleTestimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Quote */}
              <div className="mb-6">
                <svg className="w-8 h-8 text-red-500 mb-4" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z"/>
                </svg>
                <p className="text-gray-700 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {testimonial.avatar_url ? (
                    <img
                      src={testimonial.avatar_url}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-red-600 font-medium">{testimonial.company}</p>
                </div>
              </div>

              {/* Rating */}
              {sectionData.show_ratings && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex">
                    {renderStars(testimonial.rating)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {testimonial.rating}/5
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Quer fazer parte dessa rede de sucesso?
          </p>
          <a 
            href="#form" 
            className="inline-flex items-center bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
          >
            Seja um Lojista Ecko
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
