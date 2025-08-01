import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker after page load for better performance
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('SW registered successfully:', registration.scope);
          
          // Update on new version
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New SW available, page will refresh...');
                  // Auto-refresh for better UX (optional)
                  window.location.reload();
                }
              });
            }
          });
          
        } catch (error) {
          console.log('SW registration failed:', error);
        }
      });
    }
  }, []);

  return null; // This component doesn't render anything
}
