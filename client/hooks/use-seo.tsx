import { useEffect, useState } from "react";
import { SEOData, DEFAULT_SEO_DATA } from "@shared/seo";
import { silentFetchJson } from "../lib/silentFetch";
import { getApiUrl } from "../lib/apiUrl";

export function useSEO() {
  const [seoData, setSeoData] = useState<SEOData>(DEFAULT_SEO_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add a larger delay to avoid immediate fetch errors on initial load
    const timer = setTimeout(() => {
      fetchSEOData();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const fetchSEOData = async (retryCount = 0) => {
    try {
      const data = await silentFetchJson<SEOData>(getApiUrl("api/seo"), {}, 15000);

      if (data) {
        setSeoData(data);
        updatePageSEO(data);
      } else if (retryCount < 2) {
        // Retry up to 2 times with exponential backoff
        setTimeout(() => {
          fetchSEOData(retryCount + 1);
        }, Math.pow(2, retryCount) * 1000);
        return;
      } else {
        // API not available after retries, use default data
        updatePageSEO(DEFAULT_SEO_DATA);
      }
    } finally {
      // Only set loading to false if we're not retrying
      if (retryCount >= 2) {
        setLoading(false);
      }
    }
  };

  const updatePageSEO = (data: SEOData) => {
    // Update document title
    document.title = data.title;

    // Update or create meta tags
    updateMetaTag("name", "description", data.description);
    updateMetaTag("name", "keywords", data.keywords);
    updateMetaTag("name", "robots", data.robots);
    updateMetaTag("name", "author", data.author);

    // Canonical URL
    if (data.canonical_url) {
      updateLinkTag("canonical", data.canonical_url);
    }

    // Open Graph tags
    updateMetaTag("property", "og:title", data.og_title);
    updateMetaTag("property", "og:description", data.og_description);
    updateMetaTag("property", "og:type", data.og_type);
    updateMetaTag("property", "og:locale", data.language);

    if (data.og_image) {
      updateMetaTag("property", "og:image", data.og_image);
    }
    if (data.canonical_url) {
      updateMetaTag("property", "og:url", data.canonical_url);
    }

    // Twitter Card tags
    updateMetaTag("name", "twitter:card", data.twitter_card);
    updateMetaTag("name", "twitter:title", data.twitter_title);
    updateMetaTag("name", "twitter:description", data.twitter_description);
    if (data.twitter_image) {
      updateMetaTag("name", "twitter:image", data.twitter_image);
    }

    // Business-specific meta tags
    updateMetaTag("name", "business:contact_data:locality", "Brasil");
    updateMetaTag("name", "business:contact_data:country_name", "Brasil");
    updateMetaTag("name", "geo.country", "BR");
    updateMetaTag("name", "geo.region", "BR");

    // Schema.org structured data
    updateStructuredData(data);
  };

  const updateMetaTag = (attribute: string, name: string, content: string) => {
    if (!content) return;

    const selector = `meta[${attribute}="${name}"]`;
    let meta = document.head.querySelector(selector) as HTMLMetaElement;

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(attribute, name);
      meta.setAttribute("content", content);
      document.head.appendChild(meta);
    } else {
      meta.setAttribute("content", content);
    }
  };

  const updateLinkTag = (rel: string, href: string) => {
    if (!href) return;

    let link = document.head.querySelector(
      `link[rel="${rel}"]`,
    ) as HTMLLinkElement;

    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", rel);
      link.setAttribute("href", href);
      document.head.appendChild(link);
    } else {
      link.setAttribute("href", href);
    }
  };

  const updateStructuredData = (data: SEOData) => {
    // Remove existing structured data
    const existingScript = document.head.querySelector(
      'script[type="application/ld+json"]',
    );
    if (existingScript) {
      existingScript.remove();
    }

    // Create new structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Ecko Brasil",
      description: data.description,
      url: data.canonical_url || "https://sejaum.lojista.ecko.com.br",
      logo: data.og_image || "https://sejaum.lojista.ecko.com.br/logo.png",
      sameAs: [
        "https://www.instagram.com/eckobrasil",
        "https://www.facebook.com/eckobrasil",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Parcerias Comerciais",
        description: "Torne-se um lojista oficial Ecko",
      },
      offers: {
        "@type": "Offer",
        name: "Seja um Lojista Oficial Ecko",
        description: "Oportunidade de parceria comercial com a marca Ecko",
        category: "Franquia/Parceria Comercial",
        businessFunction: "http://purl.org/goodrelations/v1#Sell",
        eligibleRegion: {
          "@type": "Country",
          name: "Brasil",
        },
      },
      potentialAction: {
        "@type": "Action",
        name: "Candidatar-se para ser Lojista Ecko",
        description: "Envie seus dados para se tornar um parceiro oficial",
      },
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  };

  return {
    seoData,
    loading,
    updatePageSEO: (data: SEOData) => {
      setSeoData(data);
      updatePageSEO(data);
    },
  };
}
