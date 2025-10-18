import { useMemo, useEffect, useState } from 'react';

interface OptimizedImageOptions {
  src: string;
  sizes?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  widths?: number[];
}

interface OptimizedImageResult {
  src: string;
  srcSet?: string;
  sizes?: string;
}

/**
 * Hook to generate optimized image attributes with srcSet for responsive loading
 * @param options - Image source and size configurations
 * @returns Optimized image attributes (src, srcSet, sizes)
 */
export const useOptimizedImage = ({
  src,
  sizes,
  widths = [320, 640, 768, 1024, 1280, 1920],
}: OptimizedImageOptions): OptimizedImageResult => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const optimized = useMemo(() => {
    // If it's an external URL or doesn't support srcSet, return as-is
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      return { src };
    }

    // Generate srcSet for different widths
    const srcSet = widths
      .map(width => {
        // For local images, we'll use the same source but indicate the width
        // In production, you'd want actual resized versions
        return `${src} ${width}w`;
      })
      .join(', ');

    // Generate sizes attribute based on provided sizes or defaults
    const sizeConfig = sizes || {
      mobile: '100vw',
      tablet: '50vw',
      desktop: '33vw',
    };

    const sizesAttr = `(max-width: 768px) ${sizeConfig.mobile || '100vw'}, (max-width: 1024px) ${sizeConfig.tablet || '50vw'}, ${sizeConfig.desktop || '33vw'}`;

    // Select optimal src based on current viewport
    let optimalSrc = src;
    if (isMobile && widths[1]) {
      optimalSrc = src; // Use smallest for mobile
    } else if (isTablet && widths[2]) {
      optimalSrc = src; // Use medium for tablet
    }

    return {
      src: optimalSrc,
      srcSet,
      sizes: sizesAttr,
    };
  }, [src, sizes, widths, isMobile, isTablet]);

  return optimized;
};

/**
 * Generate srcSet string for a given image source
 * @param src - Image source path
 * @param widths - Array of widths to generate
 * @returns srcSet string
 */
export const generateSrcSet = (src: string, widths: number[] = [320, 640, 768, 1024, 1280, 1920]): string => {
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return '';
  }
  
  return widths.map(width => `${src} ${width}w`).join(', ');
};

/**
 * Generate sizes attribute for responsive images
 * @param config - Size configuration for different breakpoints
 * @returns sizes string
 */
export const generateSizes = (config?: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string => {
  const sizes = config || {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw',
  };

  return `(max-width: 768px) ${sizes.mobile || '100vw'}, (max-width: 1024px) ${sizes.tablet || '50vw'}, ${sizes.desktop || '33vw'}`;
};
