import { useState, useEffect } from "react";

export default function TestTestimonials() {
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testAPI();
  }, []);

  const testAPI = async () => {
    try {
      const res = await fetch("/api/testimonials");
      const text = await res.text();

      console.log("Response status:", res.status);
      console.log("Response text:", text);

      if (res.ok) {
        try {
          const data = JSON.parse(text);
          setResponse(data);
        } catch (e) {
          setError(`JSON parse error: ${text}`);
        }
      } else {
        setError(`HTTP ${res.status}: ${text}`);
      }
    } catch (err) {
      setError(`Network error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Test API Depoimentos</h1>

        <div className="space-y-4">
          <button
            onClick={testAPI}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Testando..." : "Testar API"}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <h3 className="font-medium mb-2">Erro:</h3>
              <pre className="text-sm whitespace-pre-wrap">{error}</pre>
            </div>
          )}

          {response && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <h3 className="font-medium mb-2">Resposta da API:</h3>
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-center space-x-4">
            <a
              href="/migrate-testimonials"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Executar Migração
            </a>
            <a
              href="/admin/testimonials"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Admin Depoimentos
            </a>
            <a href="/" className="text-gray-600 hover:text-gray-800 underline">
              Voltar Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
