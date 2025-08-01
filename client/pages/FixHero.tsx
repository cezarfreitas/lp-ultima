import { useState } from "react";

export default function FixHero() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFix = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/fix-hero-urls", {
        method: "POST",
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      setResult({ error: "Erro ao corrigir URLs do hero" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Fix Hero URLs</h1>
      
      <div className="mb-4 p-4 bg-yellow-50 rounded">
        <p className="text-yellow-800">
          Isso irá corrigir URLs quebradas do hero que apontam para formatos multi-size
          que não existem, substituindo por URLs de imagens originais disponíveis.
        </p>
      </div>
      
      <button
        onClick={handleFix}
        disabled={loading}
        className="bg-orange-600 text-white px-6 py-3 rounded hover:bg-orange-700 disabled:opacity-50"
      >
        {loading ? "Corrigindo..." : "Corrigir URLs do Hero"}
      </button>

      {result && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Resultado:</h2>
          <div className="p-4 bg-gray-100 rounded max-h-96 overflow-y-auto">
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
