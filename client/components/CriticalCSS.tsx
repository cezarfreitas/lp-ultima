export default function CriticalCSS() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
        /* Critical CSS for initial render - Above the fold only */
        body {
          margin: 0;
          font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
          line-height: 1.5;
          font-weight: 400;
          color-scheme: light;
          color: rgba(255, 255, 255, 0.87);
          background-color: #242424;
          font-synthesis: none;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          -webkit-text-size-adjust: 100%;
        }

        .hero-section {
          min-height: 100vh;
          height: 100vh; /* Fixed height to prevent layout shift */
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        
        .hero-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(17,24,39,0.6) 100%);
        }
        
        .hero-content {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 1536px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        .hero-title {
          font-size: clamp(1.5rem, 5vw, 4rem);
          font-weight: 900;
          color: white;
          margin-bottom: 2rem;
          line-height: 1.1;
          text-transform: uppercase;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }
        
        .hero-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 1rem 2rem;
          font-weight: 700;
          color: white;
          background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
          border-radius: 9999px;
          border: 2px solid rgba(220, 38, 38, 0.4);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        
        .hero-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        
        /* Layout optimizations */
        .max-w-6xl { max-width: 72rem; }
        .max-w-7xl { max-width: 80rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
        .mb-8 { margin-bottom: 2rem; }
        .text-center { text-align: center; }
        .bg-white { background-color: rgb(255 255 255); }
        .text-gray-900 { color: rgb(17 24 39); }
        .text-gray-600 { color: rgb(75 85 99); }

        /* Hide non-critical content initially */
        .defer-load {
          opacity: 0;
          transform: translateY(20px);
        }

        .defer-load.loaded {
          opacity: 1;
          transform: translateY(0);
          transition: all 0.6s ease;
        }
        
        /* Loading spinner */
        .loading-spinner {
          display: inline-block;
          width: 3rem;
          height: 3rem;
          border: 4px solid rgba(220, 38, 38, 0.3);
          border-radius: 50%;
          border-top-color: #dc2626;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Performance optimizations */
        * {
          box-sizing: border-box;
        }

        img {
          max-width: 100%;
          height: auto;
          display: block;
        }

        /* Reduce layout shifts - Add more common classes */
        .aspect-square { aspect-ratio: 1; }
        .aspect-video { aspect-ratio: 16/9; }
        .min-h-screen { min-height: 100vh; }
        .min-h-96 { min-height: 24rem; }
        .grid { display: grid; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .space-y-8 > :not([hidden]) ~ :not([hidden]) { margin-top: 2rem; }
        .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .gap-12 { gap: 3rem; }
        .bg-gray-50 { background-color: rgb(249 250 251); }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .font-bold { font-weight: 700; }
        .mb-4 { margin-bottom: 1rem; }
        .leading-tight { line-height: 1.25; }
        .leading-relaxed { line-height: 1.625; }

        /* Form section specific */
        #form {
          min-height: 600px;
          background-color: rgb(249 250 251);
        }

        /* Responsive grid for lg screens */
        @media (min-width: 1024px) {
          .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .lg\\:gap-16 { gap: 4rem; }
        }
      `,
      }}
    />
  );
}
