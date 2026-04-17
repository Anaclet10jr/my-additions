/**
 * Performance utilities for low-bandwidth Rwanda optimization
 * - Lazy loading hook
 * - Network quality detector
 * - Data saver mode
 * - Image quality adaptor
 */
import { useEffect, useState, useRef, useCallback } from 'react';

// ─── Intersection Observer lazy load ─────────────────────
export function useLazyLoad(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px', ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// ─── Network quality detector ─────────────────────────────
export function useNetworkQuality() {
  const [quality, setQuality] = useState('unknown'); // 'slow', 'medium', 'fast', 'unknown'
  const [dataSaver, setDataSaver] = useState(false);

  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return;

    const update = () => {
      const { effectiveType, saveData, downlink } = connection;
      setDataSaver(saveData);

      if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
        setQuality('slow');
      } else if (effectiveType === '3g' || downlink < 2) {
        setQuality('medium');
      } else {
        setQuality('fast');
      }
    };

    update();
    connection.addEventListener('change', update);
    return () => connection.removeEventListener('change', update);
  }, []);

  return { quality, dataSaver, isSlow: quality === 'slow', isMedium: quality === 'medium' };
}

// ─── Adaptive image quality ───────────────────────────────
export function useAdaptiveImage(src, highQuality = true) {
  const { quality, dataSaver } = useNetworkQuality();

  if (!src) return src;

  // For Cloudinary URLs: modify quality parameter
  if (src.includes('res.cloudinary.com')) {
    const q = dataSaver ? 30 : quality === 'slow' ? 40 : quality === 'medium' ? 65 : highQuality ? 85 : 75;
    const f = dataSaver || quality === 'slow' ? 'f_webp' : 'f_auto';

    // Insert or replace quality/format transform
    if (src.includes('/upload/')) {
      return src.replace('/upload/', `/upload/q_${q},${f},c_fill/`);
    }
  }

  return src;
}

// ─── Debounced search ─────────────────────────────────────
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// ─── Infinite scroll ──────────────────────────────────────
export function useInfiniteScroll(onLoadMore, hasMore) {
  const loaderRef = useRef(null);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onLoadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(loader);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore]);

  return loaderRef;
}

// ─── Low bandwidth mode banner ────────────────────────────
export function LowBandwidthBanner() {
  const { quality, dataSaver } = useNetworkQuality();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || (quality !== 'slow' && !dataSaver)) return null;

  return (
    <div
      style={{
        background: 'var(--accent-gold)',
        color: '#3D2B00',
        padding: '0.5rem 1rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
      }}
    >
      <span>📶 Slow connection detected — images optimized for your speed</span>
      <button
        onClick={() => setDismissed(true)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#3D2B00' }}
      >
        ×
      </button>
    </div>
  );
}

// ─── Optimized property card image ───────────────────────
export function AdaptiveImage({ src, alt, width, height, style, ...props }) {
  const adaptedSrc = useAdaptiveImage(src);
  const { ref, isVisible } = useLazyLoad();

  return (
    <div ref={ref} style={{ ...style, overflow: 'hidden', background: 'var(--bg-secondary)' }}>
      {isVisible ? (
        <img
          src={adaptedSrc}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s ease' }}
          {...props}
        />
      ) : (
        <div className="skeleton" style={{ width: '100%', height: '100%' }} />
      )}
    </div>
  );
}
