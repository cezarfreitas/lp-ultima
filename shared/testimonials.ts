export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar_url?: string;
  rating: number;
  is_active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface TestimonialCreateRequest {
  name: string;
  role: string;
  company: string;
  content: string;
  avatar_url?: string;
  rating: number;
  is_active?: boolean;
  position?: number;
}

export interface TestimonialUpdateRequest {
  name?: string;
  role?: string;
  company?: string;
  content?: string;
  avatar_url?: string;
  rating?: number;
  is_active?: boolean;
  position?: number;
}

export interface TestimonialsSection {
  id: number;
  title: string;
  subtitle: string;
  background_type: 'white' | 'gray' | 'gradient';
  show_ratings: boolean;
  max_testimonials: number;
  created_at: string;
  updated_at: string;
}

export interface TestimonialsSectionUpdateRequest {
  title?: string;
  subtitle?: string;
  background_type?: 'white' | 'gray' | 'gradient';
  show_ratings?: boolean;
  max_testimonials?: number;
}

export const DEFAULT_TESTIMONIALS_DATA = [
  {
    name: "Maria Silva",
    role: "Proprietária",
    company: "Loja Urban Style",
    content: "Desde que me tornei lojista Ecko, meu faturamento triplicou! O suporte da equipe é excepcional e os produtos vendem muito bem.",
    rating: 5,
    is_active: true,
    position: 1
  },
  {
    name: "João Santos",
    role: "Empreendedor",
    company: "Fashion Point",
    content: "A parceria com a Ecko transformou minha loja. Os preços exclusivos me permitem ter margens ótimas e os clientes adoram os produtos.",
    rating: 5,
    is_active: true,
    position: 2
  },
  {
    name: "Ana Costa",
    role: "Gerente",
    company: "Mega Store Moda",
    content: "Trabalhar com a Ecko foi a melhor decisão que tomei. O atendimento é rápido, os produtos chegam no prazo e a qualidade é impecável.",
    rating: 5,
    is_active: true,
    position: 3
  }
];
