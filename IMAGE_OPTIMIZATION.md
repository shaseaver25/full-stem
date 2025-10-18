# Image Optimization Guide

This guide explains how to use the image optimization utilities in the project for responsive and performant image loading.

## Overview

The project includes two main approaches for optimized image loading:

1. **`OptimizedImage` Component** - Drop-in replacement for `<img>` tags
2. **`useOptimizedImage` Hook** - For custom image implementations
3. **Helper Functions** - For manual srcSet and sizes generation

## Benefits

- **Responsive Loading**: Automatically serves appropriate image sizes based on viewport
- **Performance**: Reduces bandwidth usage by loading smaller images on mobile
- **Lazy Loading**: Built-in support for lazy loading
- **srcSet Generation**: Automatic responsive image attributes
- **Easy to Use**: Drop-in replacement for standard `<img>` tags

## Usage

### 1. OptimizedImage Component (Recommended)

The easiest way to use optimized images:

```tsx
import { OptimizedImage } from '@/components/ui/OptimizedImage';

function MyComponent() {
  return (
    <OptimizedImage
      src="/lovable-uploads/my-image.png"
      alt="Description"
      className="w-full h-auto"
      sizes={{
        mobile: '100vw',
        tablet: '50vw',
        desktop: '33vw'
      }}
      widths={[320, 640, 768, 1024, 1280, 1920]}
      loading="lazy"
    />
  );
}
```

### 2. useOptimizedImage Hook

For custom implementations or when you need more control:

```tsx
import { useOptimizedImage } from '@/hooks/useOptimizedImage';

function CustomImageComponent({ src, alt }) {
  const optimized = useOptimizedImage({
    src,
    sizes: {
      mobile: '100vw',
      tablet: '768px',
      desktop: '1024px'
    },
    widths: [320, 640, 1024, 1920]
  });

  return (
    <img
      src={optimized.src}
      srcSet={optimized.srcSet}
      sizes={optimized.sizes}
      alt={alt}
      loading="lazy"
    />
  );
}
```

### 3. Helper Functions

For manual srcSet/sizes generation:

```tsx
import { generateSrcSet, generateSizes } from '@/hooks/useOptimizedImage';

const srcSet = generateSrcSet('/path/to/image.png', [320, 640, 1024]);
const sizes = generateSizes({
  mobile: '100vw',
  tablet: '50vw',
  desktop: '800px'
});

<img src="/path/to/image.png" srcSet={srcSet} sizes={sizes} alt="..." />
```

## Props & Options

### OptimizedImage Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | required | Image source path |
| `alt` | `string` | required | Alt text for accessibility |
| `sizes` | `object` | `{ mobile: '100vw', tablet: '50vw', desktop: '33vw' }` | Viewport-based size configuration |
| `widths` | `number[]` | `[320, 640, 768, 1024, 1280, 1920]` | Array of image widths to generate |
| `loading` | `'lazy' \| 'eager'` | `'lazy'` | Loading strategy |
| `className` | `string` | - | Additional CSS classes |

### Sizes Configuration

The `sizes` object defines how large the image should be at different breakpoints:

```tsx
sizes={{
  mobile: '100vw',   // Full viewport width on mobile
  tablet: '50vw',    // Half viewport width on tablet
  desktop: '800px'   // Fixed 800px on desktop
}}
```

This generates the HTML attribute:
```html
sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 800px"
```

### Width Array

The `widths` array specifies which image sizes to include in srcSet:

```tsx
widths={[320, 640, 768, 1024, 1280, 1920]}
```

Generates:
```html
srcSet="/image.png 320w, /image.png 640w, /image.png 768w, ..."
```

## Best Practices

### 1. Hero/Banner Images
```tsx
<OptimizedImage
  src="/hero-image.jpg"
  alt="Hero banner"
  sizes={{
    mobile: '100vw',
    tablet: '100vw',
    desktop: '100vw'
  }}
  widths={[640, 1024, 1920]}
  loading="eager" // Load immediately
/>
```

### 2. Content Grid Images
```tsx
<OptimizedImage
  src="/grid-item.jpg"
  alt="Grid item"
  sizes={{
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw'
  }}
  loading="lazy" // Lazy load for performance
/>
```

### 3. Thumbnail Images
```tsx
<OptimizedImage
  src="/thumbnail.jpg"
  alt="Thumbnail"
  widths={[80, 160, 240]}
  sizes={{
    mobile: '80px',
    tablet: '120px',
    desktop: '160px'
  }}
/>
```

### 4. Profile Avatars
```tsx
<OptimizedImage
  src="/avatar.jpg"
  alt="User avatar"
  widths={[64, 128, 256]}
  sizes={{
    mobile: '64px',
    tablet: '96px',
    desktop: '128px'
  }}
  className="rounded-full"
/>
```

## Performance Tips

1. **Use appropriate widths**: Don't include sizes you don't need
2. **Set explicit sizes**: Help the browser choose the right image
3. **Lazy load below fold**: Use `loading="lazy"` for images not immediately visible
4. **Eager load critical images**: Use `loading="eager"` for hero images
5. **Consider aspect ratio**: Use CSS to prevent layout shift

## External Images

For external URLs (starting with `http://` or `https://`), the hook automatically skips srcSet generation and returns the original URL:

```tsx
<OptimizedImage
  src="https://example.com/external-image.jpg"
  alt="External image"
/>
// Renders: <img src="https://example.com/external-image.jpg" alt="External image" />
```

## Browser Support

- **srcSet**: Supported in all modern browsers (IE 11+)
- **sizes**: Supported in all modern browsers (IE 11+)
- **loading**: Supported in Chrome 77+, Firefox 75+, Safari 15.4+

For older browsers, the standard `src` attribute provides fallback support.

## Migration Guide

### Before (Standard img tag)
```tsx
<img 
  src="/image.png" 
  alt="Description"
  className="w-full"
/>
```

### After (Optimized)
```tsx
<OptimizedImage
  src="/image.png"
  alt="Description"
  className="w-full"
  loading="lazy"
/>
```

## Examples in Codebase

- **Hero Logo**: `src/components/Hero.tsx` - Optimized hero logo with eager loading
- **MFA QR Code**: `src/pages/MFASetup.tsx` - Fixed-size QR code with explicit dimensions
- **Avatar Images**: Uses Radix UI Avatar component (handles optimization internally)

## Future Enhancements

Potential improvements for production:

1. **Image CDN Integration**: Serve actual resized images from a CDN
2. **WebP/AVIF Format Support**: Serve modern image formats with fallbacks
3. **Blur Placeholder**: Add blur-up placeholder while loading
4. **Art Direction**: Different crops for different viewports
5. **Automatic Width Detection**: Calculate optimal widths based on container

## Resources

- [MDN: Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [Web.dev: Serve Responsive Images](https://web.dev/serve-responsive-images/)
- [srcSet and sizes attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images#how_do_you_create_responsive_images)
