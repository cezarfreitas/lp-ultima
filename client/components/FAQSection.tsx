import { useState, useEffect } from "react";
import { FAQSection as FAQSectionType, FAQItem } from "@shared/faq";

interface FAQSectionData extends FAQSectionType {
  faqs: FAQItem[];
}

const renderTextWithHighlights = (text: string) => {
  return text.replace(
    /\[destaque\](.*?)\[\/destaque\]/g,
    '<span class="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent font-bold">$1</span>',
  );
};

export default function FAQSection() {
  const [sectionData, setSectionData] = useState<FAQSectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState<number[]>([]);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      console.log("Fetching FAQs...");
      const response = await fetch("/api/faq");
      console.log("FAQ Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("FAQ data:", data);
        setSectionData(data);
      } else if (response.status === 404) {
        // Tables don't exist yet, show fallback data
        console.log("FAQ tables not created yet, using fallback");
        setSectionData({
          id: 1,
          title: "Perguntas [destaque]Frequentes[/destaque]",
          subtitle:
            "Tire suas dúvidas sobre como se tornar um lojista Ecko e começar a lucrar com nossa marca.",
          background_type: "white",
          max_faqs: 8,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          faqs: [
            {
              id: 1,
              question: "Como posso me tornar um lojista Ecko?",
              answer:
                "Para se tornar um lojista Ecko, você precisa ter CNPJ ativo e preencher nosso formulário de cadastro. Nossa equipe comercial entrará em contato em até 24 horas para apresentar as condições e fazer a análise do seu perfil.",
              is_active: true,
              position: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 2,
              question: "Quais são os requisitos mínimos para ser aprovado?",
              answer:
                "Os requisitos básicos incluem: CNPJ ativo, experiência no setor de moda ou varejo, localização estratégica (para lojas físicas) e capacidade financeira para manter estoque mínimo. Cada caso é analisado individualmente.",
              is_active: true,
              position: 2,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 3,
              question: "Como funcionam os preços e margens de lucro?",
              answer:
                "Lojistas Ecko têm acesso a preços exclusivos com margens competitivas. Os descontos variam conforme o volume de compra e tipo de produto. Garantimos margem mínima de 40% em todos os produtos da linha principal.",
              is_active: true,
              position: 3,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 4,
              question: "Vocês oferecem suporte para marketing e vendas?",
              answer:
                "Sim! Oferecemos kit completo de marketing incluindo: materiais gráficos, treinamento de equipe, campanhas promocionais, suporte nas redes sociais e consultoria em visual merchandising. Nosso objetivo é o seu sucesso.",
              is_active: true,
              position: 4,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 5,
              question: "Como funciona a logística e entrega dos produtos?",
              answer:
                "Temos centro de distribuição próprio com entregas rápidas para todo o Brasil. Pedidos feitos até 14h são enviados no mesmo dia útil. Frete grátis para pedidos acima de R$ 500 e sistema de tracking completo.",
              is_active: true,
              position: 5,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 6,
              question: "Posso vender produtos Ecko online?",
              answer:
                "Sim! Lojistas aprovados podem vender tanto em lojas físicas quanto online (e-commerce, marketplace, redes sociais). Fornecemos suporte técnico e materiais específicos para vendas digitais.",
              is_active: true,
              position: 6,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        });
      } else {
        console.error("Error fetching FAQs:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (itemId: number) => {
    setOpenItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const getBackgroundClasses = (backgroundType: string) => {
    switch (backgroundType) {
      case "gray":
        return "bg-gray-50";
      case "gradient":
        return "bg-gradient-to-r from-gray-50 to-gray-100";
      case "white":
      default:
        return "bg-white";
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-300 rounded w-80"></div>
              <div className="h-4 bg-gray-300 rounded w-96"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!sectionData || !sectionData.faqs || sectionData.faqs.length === 0) {
    return null;
  }

  const visibleFAQs = sectionData.faqs
    .filter((faq) => faq.is_active)
    .slice(0, sectionData.max_faqs || 8);

  if (visibleFAQs.length === 0) {
    return null;
  }

  return (
    <section
      className={`py-12 md:py-16 ${getBackgroundClasses(sectionData.background_type)}`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 px-4"
            dangerouslySetInnerHTML={{
              __html: renderTextWithHighlights(sectionData.title),
            }}
          />
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            {sectionData.subtitle}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {visibleFAQs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full text-left p-4 md:p-6 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    <svg
                      className={`w-5 h-5 md:w-6 md:h-6 text-gray-400 transform transition-transform duration-200 ${
                        openItems.includes(faq.id) ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Answer */}
              <div
                className={`transition-all duration-300 ease-in-out ${
                  openItems.includes(faq.id)
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                } overflow-hidden`}
              >
                <div className="px-4 md:px-6 pb-4 md:pb-6">
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Ainda tem dúvidas? Entre em contato conosco!
          </p>
          <a
            href="#form"
            className="inline-flex items-center bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
          >
            Fale Conosco
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.001 8.001 0 01-7.747-6M3 12c0-4.418 3.582-8 8-8s8 3.582 8 8"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
