import { useEffect } from "react";

interface LazyCSSProps {
  href: string;
  media?: string;
}

export default function LazyCSS({ href, media = "all" }: LazyCSSProps) {
  useEffect(() => {
    // Check if CSS is already loaded
    const existingLink = document.querySelector(`link[href="${href}"]`);
    if (existingLink) return;

    // Create link element
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.media = "print"; // Load as non-blocking first
    link.onload = () => {
      link.media = media; // Change to actual media query when loaded
    };

    // Add to document head
    document.head.appendChild(link);

    // Cleanup function
    return () => {
      const linkToRemove = document.querySelector(`link[href="${href}"]`);
      if (linkToRemove) {
        document.head.removeChild(linkToRemove);
      }
    };
  }, [href, media]);

  return null; // This component doesn't render anything
}
