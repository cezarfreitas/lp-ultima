export interface AboutSection {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  background_type: "white" | "gray" | "gradient" | "dark";
  image_url: string;
  button_text: string;
  button_url: string;
  show_stats: boolean;
  created_at: string;
  updated_at: string;
}

export interface AboutSectionUpdateRequest {
  title?: string;
  subtitle?: string;
  description?: string;
  background_type?: "white" | "gray" | "gradient" | "dark";
  image_url?: string;
  button_text?: string;
  button_url?: string;
  show_stats?: boolean;
}

export interface AboutStat {
  id: number;
  section_id: number;
  title: string;
  value: string;
  description: string;
  icon: string;
  is_active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface AboutStatCreateRequest {
  title: string;
  value: string;
  description: string;
  icon: string;
  is_active?: boolean;
  position?: number;
}

export interface AboutStatUpdateRequest {
  title?: string;
  value?: string;
  description?: string;
  icon?: string;
  is_active?: boolean;
  position?: number;
}

export const DEFAULT_ABOUT_DATA = {
  title: "Sobre a [destaque]Ecko[/destaque]",
  subtitle: "Mais de 25 anos transformando a moda urbana brasileira",
  description:
    "A Ecko Unlimited chegou ao Brasil para revolucionar a moda urbana. Com produtos autênticos, design exclusivo e qualidade premium, oferecemos aos nossos lojistas uma oportunidade única de fazer parte de uma marca consolidada mundialmente. Nossa missão é empoderar empreendedores através da moda urbana, proporcionando produtos que expressam personalidade e atitude.",
  background_type: "gray" as const,
  image_url:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  button_text: "Seja um Lojista",
  button_url: "#form",
  show_stats: true,
  stats: [
    {
      title: "Anos de Mercado",
      value: "25+",
      description: "Experiência consolidada no mercado global",
      icon: "🏆",
      is_active: true,
      position: 1,
    },
    {
      title: "Lojistas Parceiros",
      value: "500+",
      description: "Rede de parceiros em todo o Brasil",
      icon: "🤝",
      is_active: true,
      position: 2,
    },
    {
      title: "Produtos Exclusivos",
      value: "1000+",
      description: "Variedade de produtos urbanos autênticos",
      icon: "👕",
      is_active: true,
      position: 3,
    },
    {
      title: "Cidades Atendidas",
      value: "200+",
      description: "Presença em todo território nacional",
      icon: "🌎",
      is_active: true,
      position: 4,
    },
  ],
};
