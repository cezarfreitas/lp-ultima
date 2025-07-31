export interface ShowroomItem {
  id: number;
  title: string;
  description: string;
  media_url: string;
  media_type: "image" | "video";
  is_featured: boolean;
  is_active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ShowroomCreateRequest {
  title: string;
  description: string;
  media_url: string;
  media_type: "image" | "video";
  is_featured?: boolean;
  is_active?: boolean;
  position?: number;
}

export interface ShowroomUpdateRequest {
  title?: string;
  description?: string;
  media_url?: string;
  media_type?: "image" | "video";
  is_featured?: boolean;
  is_active?: boolean;
  position?: number;
}

export interface ShowroomSection {
  id: number;
  title: string;
  subtitle: string;
  background_type: "white" | "gray" | "gradient" | "dark";
  layout_type: "grid" | "masonry" | "carousel";
  max_items: number;
  created_at: string;
  updated_at: string;
}

export interface ShowroomSectionUpdateRequest {
  title?: string;
  subtitle?: string;
  background_type?: "white" | "gray" | "gradient" | "dark";
  layout_type?: "grid" | "masonry" | "carousel";
  max_items?: number;
}

export const DEFAULT_SHOWROOM_DATA = [
  {
    title: "Ambiente Urbano Moderno",
    description:
      "Veja como os produtos Ecko se destacam em ambientes urbanos contemporâneos com estilo e atitude.",
    media_url:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    media_type: "image" as const,
    is_featured: true,
    is_active: true,
    position: 1,
  },
  {
    title: "Street Style Autêntico",
    description:
      "Looks urbanos que capturam a essência da cultura de rua com produtos Ecko em cenários reais.",
    media_url:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    media_type: "image" as const,
    is_featured: true,
    is_active: true,
    position: 2,
  },
  {
    title: "Lifestyle Urbano",
    description:
      "Como o estilo Ecko se integra no dia a dia de pessoas que vivem a cultura urbana intensamente.",
    media_url:
      "https://images.unsplash.com/photo-1515446482533-e1b46e73b0f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    media_type: "image" as const,
    is_featured: false,
    is_active: true,
    position: 3,
  },
  {
    title: "Coleção Premium",
    description:
      "Detalhes dos produtos premium da linha Ecko com foco na qualidade e design exclusivo.",
    media_url:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    media_type: "image" as const,
    is_featured: false,
    is_active: true,
    position: 4,
  },
  {
    title: "Espaço de Venda Moderno",
    description:
      "Inspiração para como organizar e apresentar produtos Ecko em espaços de varejo modernos.",
    media_url:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    media_type: "image" as const,
    is_featured: false,
    is_active: true,
    position: 5,
  },
  {
    title: "Looks Masculinos",
    description:
      "Combinações masculinas que mostram a versatilidade e estilo dos produtos Ecko para homens.",
    media_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    media_type: "image" as const,
    is_featured: false,
    is_active: true,
    position: 6,
  },
  {
    title: "Energia das Ruas",
    description:
      "Capturando a energia e movimento da vida urbana com produtos que acompanham esse ritmo.",
    media_url:
      "https://images.unsplash.com/photo-1506629905851-d4d2a9e5d5f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    media_type: "image" as const,
    is_featured: false,
    is_active: true,
    position: 7,
  },
  {
    title: "Detalhes de Qualidade",
    description:
      "Close-ups que revelam a atenção aos detalhes e qualidade superior dos produtos Ecko.",
    media_url:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    media_type: "image" as const,
    is_featured: false,
    is_active: true,
    position: 8,
  },
];
