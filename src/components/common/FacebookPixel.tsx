import React, { Suspense, useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { FB_PIXEL_ID, pageview } from '../../lib/fpixel';

const FacebookPixelRouteTracker: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initializedRef = useRef(false);

  // Inject fbevents.js script after interactive mount
  useEffect(() => {
    if (!FB_PIXEL_ID || typeof window === 'undefined') return;

    if (!window.fbq) {
      const n: any = (window.fbq = function (...args: any[]) {
        if (n.callMethod) {
          n.callMethod.apply(n, args);
        } else {
          n.queue.push(args);
        }
      });
      if (!window._fbq) window._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      script.dataset.metaPixel = FB_PIXEL_ID;
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }

      window.fbq('init', FB_PIXEL_ID);
    }
  }, []);

  // Fire PageView on initial load and every route / query change
  useEffect(() => {
    if (!FB_PIXEL_ID) return;
    if (!initializedRef.current) {
      initializedRef.current = true;
    }
    pageview();
  }, [location.pathname, searchParams]);

  if (!FB_PIXEL_ID) return null;

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${encodeURIComponent(FB_PIXEL_ID)}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
};

export const FacebookPixel: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <FacebookPixelRouteTracker />
    </Suspense>
  );
};

export default FacebookPixel;
