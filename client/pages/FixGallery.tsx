import { useState } from "react";

export default function FixGallery() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFix = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/fix-gallery", {
        method: "POST",
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      setResult({ error: "Erro ao corrigir galeria" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Fix Gallery URLs</h1>
      
      <button
        onClick={handleFix}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Fixing..." : "Fix Gallery URLs"}
      </button>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
