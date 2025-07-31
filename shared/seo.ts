export interface SEOData {
  id?: number;
  title: string;
  description: string;
  keywords: string;
  canonical_url?: string;
  og_title: string;
  og_description: string;
  og_image?: string;
  og_type: string;
  twitter_card: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image?: string;
  robots: string;
  author: string;
  language: string;
  created_at?: string;
  updated_at?: string;
}

export interface SEOUpdateRequest {
  title: string;
  description: string;
  keywords: string;
  canonical_url?: string;
  og_title: string;
  og_description: string;
  og_image?: string;
  og_type: string;
  twitter_card: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image?: string;
  robots: string;
  author: string;
  language: string;
}

export const DEFAULT_SEO_DATA: SEOData = {
  title: "Seja um Lojista Oficial Ecko - Parceria Exclusiva | Ecko Brasil",
  description:
    "🏪 Torne-se um lojista oficial Ecko! Acesso a produtos exclusivos, preços especiais e suporte completo. Junte-se à maior rede de streetwear do Brasil. Cadastre-se agora!",
  keywords:
    "lojista ecko, franquia ecko, parceria ecko, revenda ecko, streetwear brasil, roupas urbanas, moda jovem, distribuidor ecko, negócio próprio, empreendedorismo, marca famosa",
  canonical_url: "https://sejaum.lojista.ecko.com.br",
  og_title: "Seja um Lojista Oficial Ecko - Oportunidade Única de Negócio",
  og_description:
    "💰 Descubra como se tornar um lojista oficial Ecko. Produtos exclusivos, margem atrativa e suporte completo para seu negócio crescer no mercado de streetwear. Cadastre-se gratuitamente!",
  og_image: "https://sejaum.lojista.ecko.com.br/images/og-lojista-ecko.jpg",
  og_type: "website",
  twitter_card: "summary_large_image",
  twitter_title: "Seja um Lojista Oficial Ecko - Parceria Exclusiva",
  twitter_description:
    "🚀 Torne-se parceiro oficial Ecko. Acesso a produtos exclusivos, preços especiais e suporte completo para seu negócio decolar!",
  twitter_image:
    "https://sejaum.lojista.ecko.com.br/images/twitter-lojista-ecko.jpg",
  robots:
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  author: "Ecko Brasil",
  language: "pt-BR",
};
