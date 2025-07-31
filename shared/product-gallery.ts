export interface ProductGallery {
  id: number;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_description: string;
  products: ProductItem[];
  created_at: string;
  updated_at: string;
}

export interface ProductItem {
  id: number;
  gallery_id: number;
  image_url: string;
  alt_text: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ProductGalleryUpdateRequest {
  title?: string;
  subtitle?: string;
  cta_text?: string;
  cta_description?: string;
}

export interface ProductItemCreateRequest {
  image_url: string;
  alt_text: string;
  position: number;
}

export interface ProductItemUpdateRequest {
  image_url?: string;
  alt_text?: string;
  position?: number;
}

export const DEFAULT_GALLERY_DATA = {
  title: "Nossos [destaque]Produtos[/destaque]",
  subtitle:
    "Descubra a coleção exclusiva Ecko com estilo urbano autêntico e qualidade premium",
  cta_text: "Ver Catálogo Completo",
  cta_description:
    "Como lojista Ecko, você terá acesso a todos esses produtos com preços especiais",
  products: [
    {
      image_url:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt_text: "Produto Ecko",
      position: 1,
    },
    {
      image_url:
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt_text: "Produto Ecko",
      position: 2,
    },
    {
      image_url:
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt_text: "Produto Ecko",
      position: 3,
    },
    {
      image_url:
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt_text: "Produto Ecko",
      position: 4,
    },
    {
      image_url:
        "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt_text: "Produto Ecko",
      position: 5,
    },
    {
      image_url:
        "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt_text: "Produto Ecko",
      position: 6,
    },
    {
      image_url:
        "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt_text: "Produto Ecko",
      position: 7,
    },
    {
      image_url:
        "https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt_text: "Produto Ecko",
      position: 8,
    },
    {
      image_url:
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt_text: "Produto Ecko",
      position: 9,
    },
    {
      image_url:
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt_text: "Produto Ecko",
      position: 10,
    },
    {
      image_url:
        "https://images.unsplash.com/photo-1622519407650-3df9883f76a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt_text: "Produto Ecko",
      position: 11,
    },
    {
      image_url:
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt_text: "Produto Ecko",
      position: 12,
    },
  ],
};
