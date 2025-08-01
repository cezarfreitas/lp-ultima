interface HeroPlaceholderProps {
  hasData: boolean;
  children?: React.ReactNode;
}

export default function HeroPlaceholder({
  hasData,
  children,
}: HeroPlaceholderProps) {
  return (
    <section className="hero-section">
      {hasData ? (
        children
      ) : (
        <div className="hero-placeholder">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-lg opacity-75">Carregando conteúdo...</p>
          </div>
        </div>
      )}
    </section>
  );
}
