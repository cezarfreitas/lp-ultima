export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  is_active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface FAQCreateRequest {
  question: string;
  answer: string;
  is_active?: boolean;
  position?: number;
}

export interface FAQUpdateRequest {
  question?: string;
  answer?: string;
  is_active?: boolean;
  position?: number;
}

export interface FAQSection {
  id: number;
  title: string;
  subtitle: string;
  background_type: "white" | "gray" | "gradient";
  max_faqs: number;
  created_at: string;
  updated_at: string;
}

export interface FAQSectionUpdateRequest {
  title?: string;
  subtitle?: string;
  background_type?: "white" | "gray" | "gradient";
  max_faqs?: number;
}

export const DEFAULT_FAQ_DATA = [
  {
    question: "Como posso me tornar um lojista Ecko?",
    answer:
      "Para se tornar um lojista Ecko, você precisa ter CNPJ ativo e preencher nosso formulário de cadastro. Nossa equipe comercial entrará em contato em até 24 horas para apresentar as condições e fazer a análise do seu perfil.",
    is_active: true,
    position: 1,
  },
  {
    question: "Quais são os requisitos mínimos para ser aprovado?",
    answer:
      "Os requisitos básicos incluem: CNPJ ativo, experiência no setor de moda ou varejo, localização estratégica (para lojas físicas) e capacidade financeira para manter estoque mínimo. Cada caso é analisado individualmente.",
    is_active: true,
    position: 2,
  },
  {
    question: "Qual é o investimento inicial necessário?",
    answer:
      "O investimento varia conforme o tipo de loja e região. Oferecemos diferentes modalidades de parceria, desde pequenos investimentos para lojas online até parcerias para grandes pontos físicos. Consulte nossa equipe para um orçamento personalizado.",
    is_active: true,
    position: 3,
  },
  {
    question: "Como funcionam os preços e margens de lucro?",
    answer:
      "Lojistas Ecko têm acesso a preços exclusivos com margens competitivas. Os descontos variam conforme o volume de compra e tipo de produto. Garantimos margem mínima de 40% em todos os produtos da linha principal.",
    is_active: true,
    position: 4,
  },
  {
    question: "Vocês oferecem suporte para marketing e vendas?",
    answer:
      "Sim! Oferecemos kit completo de marketing incluindo: materiais gráficos, treinamento de equipe, campanhas promocionais, suporte nas redes sociais e consultoria em visual merchandising. Nosso objetivo é o seu sucesso.",
    is_active: true,
    position: 5,
  },
  {
    question: "Como funciona a logística e entrega dos produtos?",
    answer:
      "Temos centro de distribuição próprio com entregas rápidas para todo o Brasil. Pedidos feitos até 14h são enviados no mesmo dia útil. Frete grátis para pedidos acima de R$ 500 e sistema de tracking completo.",
    is_active: true,
    position: 6,
  },
  {
    question: "Posso vender produtos Ecko online?",
    answer:
      "Sim! Lojistas aprovados podem vender tanto em lojas físicas quanto online (e-commerce, marketplace, redes sociais). Fornecemos suporte técnico e materiais específicos para vendas digitais.",
    is_active: true,
    position: 7,
  },
  {
    question: "Existe exclusividade territorial?",
    answer:
      "Dependendo da região e tipo de loja, oferecemos exclusividade territorial limitada. Isso garante que você tenha espaço para desenvolver seu negócio sem concorrência direta de outros lojistas Ecko na mesma área.",
    is_active: true,
    position: 8,
  },
];
