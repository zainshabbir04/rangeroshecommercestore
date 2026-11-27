import React, { Suspense, useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { getTikTokPixelId, ttqPageView } from '../../lib/tiktokPixel';

const TikTokPixelRouteTracker: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const loadedPixelRef = useRef<string | null>(null);
  const firstPageFiredRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ttq) return;
    const pixelId = getTikTokPixelId();
    if (pixelId && loadedPixelRef.current !== pixelId) {
      const alreadyLoadedInHead = Boolean(window.ttq._i && window.ttq._i[pixelId]);
      if (!alreadyLoadedInHead) {
        window.ttq.load(pixelId);
      }
      loadedPixelRef.current = pixelId;
    }
  }, [location.pathname, searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ttq) return;
    // The initial ttq.page() is triggered in index.html <head>; fire on route changes
    if (!firstPageFiredRef.current) {
      firstPageFiredRef.current = true;
      return;
    }
    ttqPageView();
  }, [location.pathname, searchParams]);

  return null;
};

export const TikTokPixel: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <TikTokPixelRouteTracker />
    </Suspense>
  );
};

export default TikTokPixel;
