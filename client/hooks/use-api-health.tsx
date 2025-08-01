import { useState, useEffect, useCallback } from 'react';
import { checkApiHealth, getApiHealthStatus } from '../lib/apiHealth';
import { circuitBreaker } from '../lib/circuitBreaker';

interface UseApiHealthReturn {
  isHealthy: boolean | null;
  isChecking: boolean;
  lastCheck: Date | null;
  forceCheck: () => Promise<void>;
  circuitStats: Record<string, any>;
}

export function useApiHealth(autoCheck = true): UseApiHealthReturn {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const performHealthCheck = useCallback(async () => {
    if (isChecking) return; // Avoid multiple concurrent checks
    
    setIsChecking(true);
    try {
      const healthy = await checkApiHealth();
      setIsHealthy(healthy);
      setLastCheck(new Date());
    } catch (error) {
      setIsHealthy(false);
      setLastCheck(new Date());
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);

  const forceCheck = useCallback(async () => {
    await performHealthCheck();
  }, [performHealthCheck]);

  const getCircuitStats = useCallback(() => {
    const endpoints = ['api/hero', 'api/form-content', 'api/product-gallery', 'api/showroom'];
    const stats: Record<string, any> = {};
    
    endpoints.forEach(endpoint => {
      stats[endpoint] = circuitBreaker.getStats(endpoint);
    });
    
    return stats;
  }, []);

  useEffect(() => {
    if (!autoCheck) return;

    // Initial check
    performHealthCheck();

    // Set up periodic health checks
    const interval = setInterval(() => {
      // Only check if we haven't checked recently or if API was unhealthy
      const shouldCheck = !lastCheck || 
                         (Date.now() - lastCheck.getTime() > 30000) || 
                         !isHealthy;
      
      if (shouldCheck) {
        performHealthCheck();
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [autoCheck, performHealthCheck, lastCheck, isHealthy]);

  return {
    isHealthy,
    isChecking,
    lastCheck,
    forceCheck,
    circuitStats: getCircuitStats(),
  };
}

// Hook for components that need to react to API health changes
export function useApiHealthEffect(
  callback: (isHealthy: boolean) => void,
  deps: any[] = []
) {
  const { isHealthy } = useApiHealth();

  useEffect(() => {
    if (isHealthy !== null) {
      callback(isHealthy);
    }
  }, [isHealthy, callback, ...deps]);
}
