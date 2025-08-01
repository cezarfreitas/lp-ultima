import { useApiHealth } from "../hooks/use-api-health";

interface APIHealthIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export default function APIHealthIndicator({
  showDetails = false,
  className = "",
}: APIHealthIndicatorProps) {
  const { isHealthy, isChecking, lastCheck, forceCheck, circuitStats } =
    useApiHealth();

  if (isChecking && !lastCheck) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        <span className="text-xs text-yellow-600">Verificando API...</span>
      </div>
    );
  }

  const healthColor = isHealthy ? "green" : "red";
  const healthText = isHealthy ? "Online" : "Offline";

  return (
    <div className={`${className}`}>
      <div className="flex items-center space-x-2">
        <div
          className={`w-2 h-2 bg-${healthColor}-400 rounded-full ${isChecking ? "animate-pulse" : ""}`}
        ></div>
        <span className={`text-xs text-${healthColor}-600`}>
          API {healthText}
        </span>
        {!isHealthy && (
          <button
            onClick={forceCheck}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
            disabled={isChecking}
          >
            {isChecking ? "Verificando..." : "Tentar novamente"}
          </button>
        )}
      </div>

      {showDetails && lastCheck && (
        <div className="mt-2 text-xs text-gray-500">
          <div>Última verificação: {lastCheck.toLocaleTimeString()}</div>

          {!isHealthy && (
            <div className="mt-1 space-y-1">
              <div className="font-medium">Status dos endpoints:</div>
              {Object.entries(circuitStats).map(
                ([endpoint, stats]: [string, any]) => (
                  <div key={endpoint} className="ml-2 flex justify-between">
                    <span>{endpoint}:</span>
                    <span
                      className={`${stats.isOpen ? "text-red-600" : "text-green-600"}`}
                    >
                      {stats.isOpen
                        ? `Bloqueado (${stats.failureCount} falhas)`
                        : "Disponível"}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
