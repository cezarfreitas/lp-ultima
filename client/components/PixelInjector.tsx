import { useEffect, useState } from "react";

interface PixelData {
  id: number;
  name: string;
  type: string;
  code: string;
  enabled: boolean;
  position: 'head' | 'body_start' | 'body_end';
  description?: string;
}

export default function PixelInjector() {
  const [pixels, setPixels] = useState<PixelData[]>([]);

  useEffect(() => {
    fetchEnabledPixels();
  }, []);

  const fetchEnabledPixels = async () => {
    try {
      const response = await fetch("/api/pixels/enabled");
      if (response.ok) {
        const data = await response.json();
        setPixels(data);
      }
    } catch (error) {
      console.error("Error fetching pixels:", error);
    }
  };

  useEffect(() => {
    if (pixels.length === 0) return;

    // Inject head pixels
    const headPixels = pixels.filter(pixel => pixel.position === 'head');
    headPixels.forEach(pixel => {
      injectToHead(pixel);
    });

    // Inject body start pixels
    const bodyStartPixels = pixels.filter(pixel => pixel.position === 'body_start');
    bodyStartPixels.forEach(pixel => {
      injectToBodyStart(pixel);
    });

    // Inject body end pixels
    const bodyEndPixels = pixels.filter(pixel => pixel.position === 'body_end');
    bodyEndPixels.forEach(pixel => {
      injectToBodyEnd(pixel);
    });

    // Special handling for GTM body tag
    const gtmPixels = pixels.filter(pixel => pixel.type === 'google_tag_manager');
    gtmPixels.forEach(pixel => {
      injectGTMBodyTag(pixel);
    });

  }, [pixels]);

  const injectToHead = (pixel: PixelData) => {
    // Check if pixel is already injected
    const existingElement = document.head.querySelector(`[data-pixel-id="${pixel.id}"]`);
    if (existingElement) return;

    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-pixel-id', pixel.id.toString());
    wrapper.setAttribute('data-pixel-name', pixel.name);
    wrapper.innerHTML = pixel.code;

    // Move all script and style elements to head
    const scripts = wrapper.querySelectorAll('script');
    const styles = wrapper.querySelectorAll('style, link');
    
    scripts.forEach(script => {
      const newScript = document.createElement('script');
      if (script.src) {
        newScript.src = script.src;
        newScript.async = script.async;
        newScript.defer = script.defer;
      } else {
        newScript.textContent = script.textContent;
      }
      newScript.setAttribute('data-pixel-id', pixel.id.toString());
      document.head.appendChild(newScript);
    });

    styles.forEach(style => {
      style.setAttribute('data-pixel-id', pixel.id.toString());
      document.head.appendChild(style);
    });

    // Handle other elements (like noscript, img, etc.)
    const otherElements = wrapper.querySelectorAll('*:not(script):not(style):not(link)');
    if (otherElements.length > 0) {
      const container = document.createElement('div');
      container.setAttribute('data-pixel-id', pixel.id.toString());
      container.style.display = 'none';
      otherElements.forEach(el => container.appendChild(el));
      document.head.appendChild(container);
    }
  };

  const injectToBodyStart = (pixel: PixelData) => {
    const existingElement = document.body.querySelector(`[data-pixel-id="${pixel.id}"]`);
    if (existingElement) return;

    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-pixel-id', pixel.id.toString());
    wrapper.setAttribute('data-pixel-name', pixel.name);
    wrapper.innerHTML = pixel.code;
    
    // Insert at the beginning of body
    document.body.insertBefore(wrapper, document.body.firstChild);
  };

  const injectToBodyEnd = (pixel: PixelData) => {
    const existingElement = document.body.querySelector(`[data-pixel-id="${pixel.id}"]`);
    if (existingElement) return;

    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-pixel-id', pixel.id.toString());
    wrapper.setAttribute('data-pixel-name', pixel.name);
    wrapper.innerHTML = pixel.code;
    
    // Append to end of body
    document.body.appendChild(wrapper);
  };

  const injectGTMBodyTag = (pixel: PixelData) => {
    // GTM requires a specific noscript tag in body
    const gtmId = extractGTMId(pixel.code);
    if (!gtmId) return;

    const existingGTMBody = document.body.querySelector(`[data-gtm-id="${gtmId}"]`);
    if (existingGTMBody) return;

    const noscript = document.createElement('noscript');
    noscript.setAttribute('data-gtm-id', gtmId);
    noscript.setAttribute('data-pixel-id', pixel.id.toString());
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    
    document.body.insertBefore(noscript, document.body.firstChild);
  };

  const extractGTMId = (code: string): string | null => {
    const match = code.match(/GTM-[A-Z0-9]+/);
    return match ? match[0] : null;
  };

  // This component doesn't render anything visible
  return null;
}
