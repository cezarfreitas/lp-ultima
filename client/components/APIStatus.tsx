import { useState, useEffect } from "react";

interface APIStatusProps {
  children: React.ReactNode;
  showNotice?: boolean;
}

export default function APIStatus({
  children,
  showNotice = false,
}: APIStatusProps) {
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAPI = async () => {
      try {
        const response = await fetch("/api/ping", {
          method: "GET",
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });
        setApiAvailable(response.ok);
      } catch (error) {
        setApiAvailable(false);
      }
    };

    // Check API availability with a small delay
    const timer = setTimeout(checkAPI, 500);
    return () => clearTimeout(timer);
  }, []);

  // Always render children, but optionally show notice
  return (
    <>
      {children}
      {showNotice && apiAvailable === false && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow-lg max-w-sm z-50">
          <div className="flex items-start space-x-2">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-medium text-sm">APIs não configuradas</p>
              <p className="text-xs mt-1">
                Execute <code>/setup-complete</code> para ativar todas as
                funcionalidades
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
