import { useState } from "react";
import { LeadCreateRequest } from "@shared/leads";

export default function LeadCaptureForm() {
  const [formData, setFormData] = useState<LeadCreateRequest>({
    name: '',
    whatsapp: '',
    has_cnpj: '' as any,
    store_type: undefined,
    cep: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConsumerMessage, setShowConsumerMessage] = useState(false);

  const handleInputChange = (field: keyof LeadCreateRequest, value: string) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Reset store-specific fields when switching to consumer
      if (field === 'has_cnpj' && value === 'nao') {
        newData.store_type = undefined;
        newData.cep = '';
        setShowConsumerMessage(true);
      } else if (field === 'has_cnpj' && value === 'sim') {
        setShowConsumerMessage(false);
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't submit if user is a consumer
    if (formData.has_cnpj === 'nao') {
      return;
    }
    
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: '',
          whatsapp: '',
          has_cnpj: '' as any,
          store_type: undefined,
          cep: '',
        });
      } else {
        setError(data.error || 'Erro ao enviar formulário');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCouponClick = () => {
    window.open('https://ecko.com.br', '_blank');
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Obrigado pelo seu interesse!
        </h3>
        <p className="text-green-700 mb-4">
          Recebemos seus dados e entraremos em contato em breve.
        </p>
        <button
          onClick={() => setSubmitted(false)}
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
          onChange={(e) => handleInputChange('name', e.target.value)}
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
          onChange={(e) => handleInputChange('whatsapp', e.target.value)}
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
              checked={formData.has_cnpj === 'sim'}
              onChange={(e) => handleInputChange('has_cnpj', e.target.value)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Sim</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="has_cnpj"
              value="nao"
              checked={formData.has_cnpj === 'nao'}
              onChange={(e) => handleInputChange('has_cnpj', e.target.value)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Não, sou consumidor</span>
          </label>
        </div>
      </div>

      {/* Consumer Message */}
      {showConsumerMessage && formData.has_cnpj === 'nao' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Infelizmente este é um canal para lojistas
          </h3>
          <p className="text-yellow-700 mb-4">
            Mas não fique triste! Posso te enviar um cupom de 10% de desconto na loja Ecko oficial clicando no botão abaixo.
          </p>
          <button
            type="button"
            onClick={handleCouponClick}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02]"
          >
            Quero meu cupom de 10%
          </button>
        </div>
      )}

      {/* Store Fields - Only show if has CNPJ */}
      {formData.has_cnpj === 'sim' && (
        <>
          {/* Store Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qual o tipo da sua loja? *
            </label>
            <select
              required
              value={formData.store_type || ''}
              onChange={(e) => handleInputChange('store_type', e.target.value as any)}
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
              onChange={(e) => handleInputChange('cep', e.target.value)}
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
        disabled={submitting || formData.has_cnpj !== 'sim'}
        className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
      >
        {submitting ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Enviando...
          </div>
        ) : (
          'Quero ser Lojista Ecko'
        )}
      </button>

      {/* Privacy Notice - Only show if has CNPJ */}
      {formData.has_cnpj === 'sim' && (
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          Ao enviar este formulário, você concorda com nossa política de privacidade. 
          Seus dados serão utilizados apenas para entrar em contato sobre oportunidades de parceria.
        </p>
      )}
    </form>
  );
}
