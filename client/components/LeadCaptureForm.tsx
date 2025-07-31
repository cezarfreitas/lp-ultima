import { useState } from "react";
import { LeadCreateRequest } from "@shared/leads";

export default function LeadCaptureForm() {
  const [formData, setFormData] = useState<LeadCreateRequest>({
    name: "",
    whatsapp: "",
    has_cnpj: "" as any,
    store_type: undefined,
    cep: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isConsumerSubmission, setIsConsumerSubmission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConsumerMessage, setShowConsumerMessage] = useState(false);

  const handleInputChange = (field: keyof LeadCreateRequest, value: string) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Reset store-specific fields when switching to consumer
      if (field === "has_cnpj" && value === "nao") {
        newData.store_type = undefined;
        newData.cep = "";
        setShowConsumerMessage(true);
      } else if (field === "has_cnpj" && value === "sim") {
        setShowConsumerMessage(false);
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      if (formData.has_cnpj === "nao") {
        // Consumer flow - send to consumer webhook
        await fetch("/api/consumer-webhook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            whatsapp: formData.whatsapp,
          }),
        });

        // Reset form and show success for consumer
        setIsConsumerSubmission(true);
        setSubmitted(true);
        setFormData({
          name: "",
          whatsapp: "",
          has_cnpj: "" as any,
          store_type: undefined,
          cep: "",
        });
      } else {
        // Lojista flow - send to leads
        const response = await fetch("/api/leads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          setIsConsumerSubmission(false);
          setSubmitted(true);

          // Track conversion events
          trackConversion();

          setFormData({
            name: "",
            whatsapp: "",
            has_cnpj: "" as any,
            store_type: undefined,
            cep: "",
          });
        } else {
          setError(data.error || "Erro ao enviar formulário");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Erro ao conectar com o servidor");
    } finally {
      setSubmitting(false);
    }
  };

  const trackConversion = () => {
    // Track with Google Analytics if available
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "conversion", {
        send_to: "AW-CONVERSION_ID/CONVERSION_LABEL", // Replace with actual conversion ID
        value: 100.0,
        currency: "BRL",
        transaction_id: Date.now().toString(),
      });

      (window as any).gtag("event", "generate_lead", {
        currency: "BRL",
        value: 100.0,
      });
    }

    // Track with Meta Pixel if available
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Lead", {
        content_name: "Seja um Lojista Oficial Ecko",
        content_category: "Partnership",
        value: 100,
        currency: "BRL",
      });
    }

    // Track with Meta Conversions API if available
    if (typeof window !== "undefined" && (window as any).trackMetaLead) {
      (window as any).trackMetaLead(
        formData.name + "@example.com", // Generate email or use actual if collected
        formData.whatsapp,
      );
    }

    // Track custom events for other platforms
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: "lead_form_submission",
        event_category: "Partnership",
        event_label: "Seja um Lojista Ecko",
        value: 100,
        currency: "BRL",
        has_cnpj: formData.has_cnpj,
        store_type: formData.store_type,
      });
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          {isConsumerSubmission
            ? "Cupom enviado!"
            : "Obrigado pelo seu interesse!"}
        </h3>
        <p className="text-green-700 mb-4">
          {isConsumerSubmission
            ? "Vamos enviar uma mensagem no seu WhatsApp com o cupom de desconto de 10%."
            : "Recebemos seus dados e entraremos em contato em breve."}
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setIsConsumerSubmission(false);
          }}
          className="text-green-600 hover:text-green-700 font-medium text-sm underline"
        >
          Enviar outro formulário
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nome Completo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome Completo *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
          placeholder="Seu nome completo"
        />
      </div>

      {/* WhatsApp */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          WhatsApp *
        </label>
        <input
          type="tel"
          required
          value={formData.whatsapp}
          onChange={(e) => handleInputChange("whatsapp", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
          placeholder="(11) 99999-9999"
        />
      </div>

      {/* CNPJ Question */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sua loja possui CNPJ? *
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="has_cnpj"
              value="sim"
              checked={formData.has_cnpj === "sim"}
              onChange={(e) => handleInputChange("has_cnpj", e.target.value)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Sim</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="has_cnpj"
              value="nao"
              checked={formData.has_cnpj === "nao"}
              onChange={(e) => handleInputChange("has_cnpj", e.target.value)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">
              Não, sou consumidor
            </span>
          </label>
        </div>
      </div>

      {/* Consumer Notice */}
      {formData.has_cnpj === "nao" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Este é um canal para lojistas
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Mas não fique triste! Você pode ganhar um cupom de 10% de
                  desconto na loja Ecko oficial.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Store Fields - Only show if has CNPJ */}
      {formData.has_cnpj === "sim" && (
        <>
          {/* Store Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qual o tipo da sua loja? *
            </label>
            <select
              required
              value={formData.store_type || ""}
              onChange={(e) =>
                handleInputChange("store_type", e.target.value as any)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
            >
              <option value="">Selecione o tipo da sua loja</option>
              <option value="fisica">Física</option>
              <option value="online">Online</option>
              <option value="fisica_online">Física e Online</option>
              <option value="midias_sociais">Mídias Sociais</option>
            </select>
          </div>

          {/* CEP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qual seu CEP? *
            </label>
            <input
              type="text"
              required
              value={formData.cep}
              onChange={(e) => handleInputChange("cep", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              placeholder="00000-000"
              maxLength={9}
            />
          </div>
        </>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={
          submitting ||
          !formData.has_cnpj ||
          !formData.name ||
          !formData.whatsapp ||
          (formData.has_cnpj === "sim" &&
            (!formData.store_type || !formData.cep))
        }
        className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
      >
        {submitting ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Enviando...
          </div>
        ) : formData.has_cnpj === "nao" ? (
          "Quero meu cupom de 10%"
        ) : formData.has_cnpj === "sim" ? (
          "Quero ser Lojista Ecko"
        ) : (
          "Enviar"
        )}
      </button>

      {/* Privacy Notice - Only show if has CNPJ */}
      {formData.has_cnpj === "sim" && (
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          Ao enviar este formulário, você concorda com nossa política de
          privacidade. Seus dados serão utilizados apenas para entrar em contato
          sobre oportunidades de parceria.
        </p>
      )}
    </form>
  );
}
