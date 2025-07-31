import { useEffect, useState } from "react";
import { SEOData, DEFAULT_SEO_DATA } from "@shared/seo";

export default function SEOHead() {
  const [seoData, setSeoData] = useState<SEOData>(DEFAULT_SEO_DATA);

  useEffect(() => {
    fetchSEOData();
  }, []);

  const fetchSEOData = async () => {
    try {
      const response = await fetch("/api/seo");
      if (response.ok) {
        const data = await response.json();
        setSeoData(data);
      }
    } catch (error) {
      console.error("Error fetching SEO data:", error);
      // Use default data in case of error
    }
  };

  useEffect(() => {
    // Update document title
    document.title = seoData.title;

    // Update or create meta tags
    updateMetaTag("name", "description", seoData.description);
    updateMetaTag("name", "keywords", seoData.keywords);
    updateMetaTag("name", "robots", seoData.robots);
    updateMetaTag("name", "author", seoData.author);
    updateMetaTag("name", "language", seoData.language);

    // Canonical URL
    if (seoData.canonical_url) {
      updateLinkTag("canonical", seoData.canonical_url);
    }

    // Open Graph tags
    updateMetaTag("property", "og:title", seoData.og_title);
    updateMetaTag("property", "og:description", seoData.og_description);
    updateMetaTag("property", "og:type", seoData.og_type);
    if (seoData.og_image) {
      updateMetaTag("property", "og:image", seoData.og_image);
    }
    if (seoData.canonical_url) {
      updateMetaTag("property", "og:url", seoData.canonical_url);
    }
    updateMetaTag("property", "og:locale", seoData.language);

    // Twitter Card tags
    updateMetaTag("name", "twitter:card", seoData.twitter_card);
    updateMetaTag("name", "twitter:title", seoData.twitter_title);
    updateMetaTag("name", "twitter:description", seoData.twitter_description);
    if (seoData.twitter_image) {
      updateMetaTag("name", "twitter:image", seoData.twitter_image);
    }

    // Additional SEO meta tags
    updateMetaTag("name", "viewport", "width=device-width, initial-scale=1.0");
    updateMetaTag("charset", "", "UTF-8");
    updateMetaTag("http-equiv", "X-UA-Compatible", "IE=edge");

    // Business-specific meta tags
    updateMetaTag("name", "business:contact_data:locality", "Brasil");
    updateMetaTag("name", "business:contact_data:country_name", "Brasil");
    updateMetaTag("name", "geo.country", "BR");
    updateMetaTag("name", "geo.region", "BR");

    // Schema.org structured data
    updateStructuredData();

  }, [seoData]);

  const updateMetaTag = (attribute: string, name: string, content: string) => {
    if (!content && attribute !== "charset") return;

    let selector: string;
    if (attribute === "charset") {
      selector = `meta[charset]`;
    } else {
      selector = `meta[${attribute}="${name}"]`;
    }

    let meta = document.head.querySelector(selector) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement("meta");
      if (attribute === "charset") {
        meta.setAttribute("charset", content);
      } else {
        meta.setAttribute(attribute, name);
        meta.setAttribute("content", content);
      }
      document.head.appendChild(meta);
    } else {
      if (attribute !== "charset") {
        meta.setAttribute("content", content);
      }
    }
  };

  const updateLinkTag = (rel: string, href: string) => {
    if (!href) return;

    let link = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", rel);
      link.setAttribute("href", href);
      document.head.appendChild(link);
    } else {
      link.setAttribute("href", href);
    }
  };

  const updateStructuredData = () => {
    // Remove existing structured data
    const existingScript = document.head.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create new structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Ecko Brasil",
      "description": seoData.description,
      "url": seoData.canonical_url || "https://sejaum.lojista.ecko.com.br",
      "logo": seoData.og_image || "https://sejaum.lojista.ecko.com.br/logo.png",
      "sameAs": [
        "https://www.instagram.com/eckobrasil",
        "https://www.facebook.com/eckobrasil"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Parcerias Comerciais",
        "description": "Torne-se um lojista oficial Ecko"
      },
      "offers": {
        "@type": "Offer",
        "name": "Seja um Lojista Oficial Ecko",
        "description": "Oportunidade de parceria comercial com a marca Ecko",
        "category": "Franquia/Parceria Comercial"
      }
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  };

  // This component doesn't render anything visible
  return null;
}
