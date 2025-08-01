import { useState } from "react";

export default function ProcessImages() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/process-existing-images", {
        method: "POST",
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      setResult({ error: "Erro ao processar imagens" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Process Existing Images</h1>

      <div className="mb-4 p-4 bg-blue-50 rounded">
        <p className="text-blue-800">
          Isso irá processar todas as imagens existentes em /uploads/ e criar
          versões otimizadas em 4 formatos (thumbnail, small, medium, large) com
          crop quadrado ideal para a galeria.
        </p>
      </div>

      <button
        onClick={handleProcess}
        disabled={loading}
        className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Processando..." : "Processar Imagens Existentes"}
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
