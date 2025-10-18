import { useOptimizedImage } from '@/hooks/useOptimizedImage';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes'> {
  src: string;
  alt: string;
  sizes?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  widths?: number[];
  className?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * Optimized image component with automatic srcSet generation and responsive loading
 */
export const OptimizedImage = ({
  src,
  alt,
  sizes,
  widths,
  className,
  loading = 'lazy',
  ...props
}: OptimizedImageProps) => {
  const optimized = useOptimizedImage({ src, sizes, widths });

  return (
    <img
      {...props}
      src={optimized.src}
      srcSet={optimized.srcSet}
      sizes={optimized.sizes}
      alt={alt}
      loading={loading}
      className={cn('object-cover', className)}
    />
  );
};
