export interface FooterSection {
  id: number;
  title: string;
  description: string;
  instagram_url: string;
  facebook_url: string;
  whatsapp_url: string;
  created_at: string;
  updated_at: string;
}

export interface FooterSectionUpdateRequest {
  title?: string;
  description?: string;
  instagram_url?: string;
  facebook_url?: string;
  whatsapp_url?: string;
}

export interface FooterLink {
  id: number;
  section_id: number;
  title: string;
  href: string;
  is_active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface FooterLinkCreateRequest {
  title: string;
  href: string;
  is_active?: boolean;
  position?: number;
}

export interface FooterLinkUpdateRequest {
  title?: string;
  href?: string;
  is_active?: boolean;
  position?: number;
}

export const DEFAULT_FOOTER_DATA = {
  title: "Ecko",
  description:
    "Transforme sua paixão pela moda urbana em um negócio lucrativo. Seja um lojista oficial Ecko e tenha acesso a preços e produtos exclusivos.",
  instagram_url: "#",
  facebook_url: "#",
  whatsapp_url: "#",
  links: [
    {
      title: "Nossos Produtos",
      href: "#produtos",
      is_active: true,
      position: 1,
    },
    {
      title: "Vantagens",
      href: "#vantagens",
      is_active: true,
      position: 2,
    },
    {
      title: "Depoimentos",
      href: "#testimonials",
      is_active: true,
      position: 3,
    },
    {
      title: "FAQ",
      href: "#faq",
      is_active: true,
      position: 4,
    },
    {
      title: "Showroom",
      href: "#showroom",
      is_active: true,
      position: 5,
    },
  ],
};
