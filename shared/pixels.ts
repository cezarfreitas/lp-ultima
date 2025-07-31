export interface PixelData {
  id?: number;
  name: string;
  type:
    | "google_analytics"
    | "meta_pixel"
    | "google_tag_manager"
    | "custom_header"
    | "custom_body"
    | "ga4_simple"
    | "meta_simple"
    | "meta_conversions";
  code: string;
  enabled: boolean;
  position: "head" | "body_start" | "body_end";
  description?: string;
  pixel_id?: string; // For simplified versions
  access_token?: string; // For Meta Conversions API
  created_at?: string;
  updated_at?: string;
}

export interface PixelCreateRequest {
  name: string;
  type:
    | "google_analytics"
    | "meta_pixel"
    | "google_tag_manager"
    | "custom_header"
    | "custom_body"
    | "ga4_simple"
    | "meta_simple"
    | "meta_conversions";
  code: string;
  enabled: boolean;
  position: "head" | "body_start" | "body_end";
  description?: string;
  pixel_id?: string;
  access_token?: string;
}

export interface PixelUpdateRequest extends PixelCreateRequest {
  id: number;
}

export const PIXEL_TYPES = {
  google_analytics: {
    name: "Google Analytics (GA4)",
    icon: "📊",
    defaultPosition: "head" as const,
    template: `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>`,
  },
  meta_pixel: {
    name: "Meta Pixel (Facebook)",
    icon: "📘",
    defaultPosition: "head" as const,
    template: `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`,
  },
  google_tag_manager: {
    name: "Google Tag Manager",
    icon: "🏷️",
    defaultPosition: "head" as const,
    template: `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->`,
  },
  custom_header: {
    name: "Código Personalizado (Head)",
    icon: "⚡",
    defaultPosition: "head" as const,
    template: `<!-- Código personalizado para o <head> -->
<script>
  // Seu código JavaScript aqui
</script>`,
  },
  custom_body: {
    name: "Código Personalizado (Body)",
    icon: "🔧",
    defaultPosition: "body_start" as const,
    template: `<!-- Código personalizado para o <body> -->
<script>
  // Seu código JavaScript aqui
</script>`,
  },
  ga4_simple: {
    name: "Google Analytics GA4 (ID Simples)",
    icon: "📈",
    defaultPosition: "head" as const,
    template: `<!-- Google Analytics GA4 - Só insira o ID -->`,
    requiresId: true,
    idLabel: "Google Analytics ID (ex: G-XXXXXXXXXX)",
  },
  meta_simple: {
    name: "Meta Pixel (ID Simples)",
    icon: "📱",
    defaultPosition: "head" as const,
    template: `<!-- Meta Pixel - Só insira o ID -->`,
    requiresId: true,
    idLabel: "Meta Pixel ID (apenas números)",
  },
  meta_conversions: {
    name: "Meta Conversions API",
    icon: "🔗",
    defaultPosition: "head" as const,
    template: `<!-- Meta Conversions API - Configuração Avançada -->`,
    requiresId: true,
    requiresToken: true,
    idLabel: "Meta Pixel ID",
    tokenLabel: "Access Token",
  },
};

export const DEFAULT_PIXELS_DATA: PixelData[] = [
  {
    name: "Google Analytics - Lojistas Ecko",
    type: "google_analytics",
    code: "",
    enabled: false,
    position: "head",
    description:
      "Rastreamento de conversões para captura de lojistas interessados",
  },
  {
    name: "Meta Pixel - Parceria Ecko",
    type: "meta_pixel",
    code: "",
    enabled: false,
    position: "head",
    description: "Pixel do Facebook para remarketing e conversões",
  },
];
