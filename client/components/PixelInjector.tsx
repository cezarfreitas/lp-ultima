import { useEffect, useState } from "react";
import { silentFetchJson } from "../lib/silentFetch";

interface PixelData {
  id: number;
  name: string;
  type: string;
  code: string;
  enabled: boolean;
  position: "head" | "body_start" | "body_end";
  description?: string;
  pixel_id?: string;
  access_token?: string;
}

export default function PixelInjector() {
  const [pixels, setPixels] = useState<PixelData[]>([]);

  useEffect(() => {
    // Add a small delay to avoid immediate fetch errors on initial load
    const timer = setTimeout(() => {
      fetchEnabledPixels();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const fetchEnabledPixels = async () => {
    try {
      // Create fetch with timeout and abort controller for cleaner error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch("/api/pixels/enabled", {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setPixels(data);
      } else {
        // API not available, no pixels to inject
        setPixels([]);
      }
    } catch (error) {
      // Silently handle all fetch errors - API not available
      setPixels([]);
    }
  };

  useEffect(() => {
    if (pixels.length === 0) return;

    // Generate code for simplified pixels
    const processedPixels = pixels.map((pixel) => ({
      ...pixel,
      code: generatePixelCode(pixel),
    }));

    // Inject head pixels
    const headPixels = processedPixels.filter(
      (pixel) => pixel.position === "head",
    );
    headPixels.forEach((pixel) => {
      injectToHead(pixel);
    });

    // Inject body start pixels
    const bodyStartPixels = processedPixels.filter(
      (pixel) => pixel.position === "body_start",
    );
    bodyStartPixels.forEach((pixel) => {
      injectToBodyStart(pixel);
    });

    // Inject body end pixels
    const bodyEndPixels = processedPixels.filter(
      (pixel) => pixel.position === "body_end",
    );
    bodyEndPixels.forEach((pixel) => {
      injectToBodyEnd(pixel);
    });

    // Special handling for GTM body tag
    const gtmPixels = processedPixels.filter(
      (pixel) => pixel.type === "google_tag_manager",
    );
    gtmPixels.forEach((pixel) => {
      injectGTMBodyTag(pixel);
    });

    // Special handling for Meta Conversions API
    const metaConversionsPixels = processedPixels.filter(
      (pixel) => pixel.type === "meta_conversions",
    );
    metaConversionsPixels.forEach((pixel) => {
      setupMetaConversionsAPI(pixel);
    });
  }, [pixels]);

  const generatePixelCode = (pixel: PixelData): string => {
    if (!pixel.pixel_id) return pixel.code;

    switch (pixel.type) {
      case "ga4_simple":
        return `<!-- Google Analytics GA4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${pixel.pixel_id}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${pixel.pixel_id}');
</script>`;

      case "meta_simple":
        return `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixel.pixel_id}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${pixel.pixel_id}&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`;

      case "meta_conversions":
        return `<!-- Meta Pixel + Conversions API -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixel.pixel_id}');
fbq('track', 'PageView');

// Enhanced tracking for lead capture
window.trackMetaLead = function(email, phone) {
  fbq('track', 'Lead', {
    content_name: 'Seja um Lojista Ecko',
    content_category: 'Partnership',
    value: 100,
    currency: 'BRL'
  });

  // Send to Conversions API
  sendToConversionsAPI('Lead', {
    email: email,
    phone: phone,
    content_name: 'Seja um Lojista Ecko'
  });
};
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${pixel.pixel_id}&ev=PageView&noscript=1"
/></noscript>`;

      default:
        return pixel.code;
    }
  };

  const setupMetaConversionsAPI = (pixel: PixelData) => {
    if (!pixel.access_token || !pixel.pixel_id) return;

    // Create function to send to Conversions API
    const script = document.createElement("script");
    script.innerHTML = `
      window.sendToConversionsAPI = function(eventName, userData) {
        fetch('/api/meta-conversion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pixel_id: '${pixel.pixel_id}',
            event_name: eventName,
            user_data: userData,
            event_time: Math.floor(Date.now() / 1000)
          })
        }).catch(console.error);
      };
    `;
    document.head.appendChild(script);
  };

  const injectToHead = (pixel: PixelData) => {
    // Check if pixel is already injected
    const existingElement = document.head.querySelector(
      `[data-pixel-id="${pixel.id}"]`,
    );
    if (existingElement) return;

    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-pixel-id", pixel.id.toString());
    wrapper.setAttribute("data-pixel-name", pixel.name);
    wrapper.innerHTML = pixel.code;

    // Move all script and style elements to head
    const scripts = wrapper.querySelectorAll("script");
    const styles = wrapper.querySelectorAll("style, link");

    scripts.forEach((script) => {
      const newScript = document.createElement("script");
      if (script.src) {
        newScript.src = script.src;
        newScript.async = script.async;
        newScript.defer = script.defer;
      } else {
        newScript.textContent = script.textContent;
      }
      newScript.setAttribute("data-pixel-id", pixel.id.toString());
      document.head.appendChild(newScript);
    });

    styles.forEach((style) => {
      style.setAttribute("data-pixel-id", pixel.id.toString());
      document.head.appendChild(style);
    });

    // Handle other elements (like noscript, img, etc.)
    const otherElements = wrapper.querySelectorAll(
      "*:not(script):not(style):not(link)",
    );
    if (otherElements.length > 0) {
      const container = document.createElement("div");
      container.setAttribute("data-pixel-id", pixel.id.toString());
      container.style.display = "none";
      otherElements.forEach((el) => container.appendChild(el));
      document.head.appendChild(container);
    }
  };

  const injectToBodyStart = (pixel: PixelData) => {
    const existingElement = document.body.querySelector(
      `[data-pixel-id="${pixel.id}"]`,
    );
    if (existingElement) return;

    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-pixel-id", pixel.id.toString());
    wrapper.setAttribute("data-pixel-name", pixel.name);
    wrapper.innerHTML = pixel.code;

    // Insert at the beginning of body
    document.body.insertBefore(wrapper, document.body.firstChild);
  };

  const injectToBodyEnd = (pixel: PixelData) => {
    const existingElement = document.body.querySelector(
      `[data-pixel-id="${pixel.id}"]`,
    );
    if (existingElement) return;

    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-pixel-id", pixel.id.toString());
    wrapper.setAttribute("data-pixel-name", pixel.name);
    wrapper.innerHTML = pixel.code;

    // Append to end of body
    document.body.appendChild(wrapper);
  };

  const injectGTMBodyTag = (pixel: PixelData) => {
    // GTM requires a specific noscript tag in body
    const gtmId = extractGTMId(pixel.code);
    if (!gtmId) return;

    const existingGTMBody = document.body.querySelector(
      `[data-gtm-id="${gtmId}"]`,
    );
    if (existingGTMBody) return;

    const noscript = document.createElement("noscript");
    noscript.setAttribute("data-gtm-id", gtmId);
    noscript.setAttribute("data-pixel-id", pixel.id.toString());
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
