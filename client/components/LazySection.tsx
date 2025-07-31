import { useState, useEffect, useRef, ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  fallback?: ReactNode;
  delay?: number;
}

export default function LazySection({
  children,
  className = '',
  threshold = 0.1,
  rootMargin = '100px 0px',
  fallback = <div className="min-h-96 bg-gray-100 animate-pulse rounded-lg" />,
  delay = 0
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, delay]);

  return (
    <div 
      ref={sectionRef} 
      className={`transition-all duration-600 ${
        isLoaded ? 'opacity-100 transform-none' : 'opacity-0 transform translate-y-8'
      } ${className}`}
    >
      {isLoaded ? children : fallback}
    </div>
  );
}
