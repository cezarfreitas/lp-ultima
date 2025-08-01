import { useState, useRef, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
}

export default function OptimizedImage({
  src,
  alt,
  className = "",
  width,
  height,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  placeholder = "empty",
  blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px 0px", // Start loading 50px before entering viewport
      },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const generateSrcSet = (baseSrc: string, targetWidth?: number) => {
    // Handle our multi-format uploads
    if (baseSrc.includes("/uploads/")) {
      try {
        // Extract base filename from any format URL
        let baseName = "";
        if (baseSrc.includes("/uploads/thumb/")) {
          baseName = baseSrc.replace("/uploads/thumb/", "").replace("-thumb.webp", "");
        } else if (baseSrc.includes("/uploads/small/")) {
          baseName = baseSrc.replace("/uploads/small/", "").replace("-small.webp", "");
        } else if (baseSrc.includes("/uploads/medium/")) {
          baseName = baseSrc.replace("/uploads/medium/", "").replace("-medium.webp", "");
        } else if (baseSrc.includes("/uploads/large/")) {
          baseName = baseSrc.replace("/uploads/large/", "").replace("-large.webp", "");
        } else {
          // Old format - convert to base name
          baseName = baseSrc.replace("/uploads/", "").replace(/\.(jpg|jpeg|png|webp)$/i, '');
        }

        // Generate responsive srcSet with our formats
        const formats = [
          { size: "small", width: 400, url: `/uploads/small/${baseName}-small.webp` },
          { size: "medium", width: 800, url: `/uploads/medium/${baseName}-medium.webp` },
          { size: "large", width: 1200, url: `/uploads/large/${baseName}-large.webp` }
        ];

        return formats.map(f => `${f.url} ${f.width}w`).join(", ");
      } catch (error) {
        console.warn("Failed to generate srcSet for:", baseSrc);
        return undefined;
      }
    }

    if (baseSrc.includes("unsplash.com")) {
      try {
        // Use smaller, more appropriate sizes for actual display
        const baseW = targetWidth || 400;
        const w1 = Math.floor(baseW * 0.5); // 50% for mobile
        const w2 = baseW; // 100% for tablet
        const w3 = Math.floor(baseW * 1.5); // 150% for retina

        return `${baseSrc}&w=${w1} ${w1}w, ${baseSrc}&w=${w2} ${w2}w, ${baseSrc}&w=${w3} ${w3}w`;
      } catch (error) {
        console.warn("Failed to generate srcSet for:", baseSrc);
        return undefined;
      }
    }
    return undefined;
  };

  const getOptimizedSrc = (baseSrc: string, targetWidth?: number) => {
    // For now, just return the original source to fix display issues
    // TODO: Implement proper multi-format optimization later
    if (baseSrc.includes("/uploads/")) {
      return baseSrc;
    }

    if (baseSrc.includes("unsplash.com")) {
      try {
        const params = new URLSearchParams();
        if (targetWidth) params.set("w", targetWidth.toString());
        params.set("auto", "format");
        params.set("fit", "crop");
        params.set("q", "80");
        return `${baseSrc}&${params.toString()}`;
      } catch (error) {
        console.warn("Failed to optimize Unsplash URL:", baseSrc);
        return baseSrc;
      }
    }
    return baseSrc;
  };

  if (error) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <svg
          className="w-8 h-8 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }

  // Simplified for debugging - show image directly
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={(e) => {
        console.error("Image failed to load:", src);
        setError(true);
      }}
      onLoad={() => {
        console.log("Image loaded successfully:", src);
        setIsLoaded(true);
      }}
    />
  );
}
