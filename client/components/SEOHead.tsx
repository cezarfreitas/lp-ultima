import { useSEO } from "../hooks/use-seo";

export default function SEOHead() {
  // Use the custom SEO hook that handles all SEO updates automatically
  useSEO();

  // This component doesn't render anything visible
  return null;
}
