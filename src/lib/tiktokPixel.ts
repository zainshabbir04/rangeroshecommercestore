declare global {
  interface Window {
    ttq?: {
      load: (pixelId: string, options?: Record<string, any>) => void;
      page: () => void;
      track: (
        eventName: string,
        payload?: Record<string, any>,
        options?: { event_id?: string }
      ) => void;
      identify: (userData: Record<string, any>) => void;
      instances?: any;
      _i?: Record<string, any>;
    };
    TiktokAnalyticsObject?: string;
    __RER_TIKTOK_PIXEL_ID__?: string;
  }
}

export type StandardTikTokEventName =
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'CompletePayment'
  | 'PlaceAnOrder'
  | 'Contact'
  | 'Search';

export const DEFAULT_TIKTOK_PIXEL_ID = 'DC4QQU3C77U0A5LSPG3G';

export function getTikTokPixelId(): string {
  const envId =
    (typeof import.meta !== 'undefined' &&
      ((import.meta as any).env?.NEXT_PUBLIC_TIKTOK_PIXEL_ID ||
        (import.meta as any).env?.VITE_TIKTOK_PIXEL_ID)) ||
    (typeof process !== 'undefined' &&
      (process.env?.NEXT_PUBLIC_TIKTOK_PIXEL_ID || process.env?.VITE_TIKTOK_PIXEL_ID)) ||
    '';

  if (envId && String(envId).trim()) {
    return String(envId).trim();
  }

  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryPixelId = params.get('tiktok_pixel_id');
      if (queryPixelId && queryPixelId.trim()) {
        localStorage.setItem('rer_tiktok_pixel_id', queryPixelId.trim());
        return queryPixelId.trim();
      }
      const saved = localStorage.getItem('rer_tiktok_pixel_id');
      if (saved && saved.trim()) {
        return saved.trim();
      }
    } catch {
      // ignore storage errors
    }

    if (window.__RER_TIKTOK_PIXEL_ID__ && window.__RER_TIKTOK_PIXEL_ID__.trim()) {
      return window.__RER_TIKTOK_PIXEL_ID__.trim();
    }

    const metaTag = document.querySelector('meta[name="tiktok-pixel-id"]');
    const metaContent = metaTag?.getAttribute('content')?.trim();
    if (metaContent && metaContent !== 'YOUR_TIKTOK_PIXEL_ID') {
      return metaContent;
    }
  }

  return DEFAULT_TIKTOK_PIXEL_ID;
}

export const TIKTOK_PIXEL_ID: string = getTikTokPixelId();

/**
 * Fires a TikTok Pixel PageView event (`ttq.page()`).
 */
export function ttqPageView(): void {
  if (typeof window !== 'undefined' && window.ttq && typeof window.ttq.page === 'function') {
    window.ttq.page();
  }
}

/**
 * Fires a standard TikTok Pixel e-commerce event (`ttq.track(eventName, payload, options)`).
 * Supports ViewContent, AddToCart, InitiateCheckout, and CompletePayment.
 */
export function ttqTrack(
  eventName: StandardTikTokEventName | string,
  payload: Record<string, any> = {},
  options?: { event_id?: string }
): void {
  if (typeof window !== 'undefined' && window.ttq && typeof window.ttq.track === 'function') {
    if (options && options.event_id) {
      window.ttq.track(eventName, payload, options);
    } else {
      window.ttq.track(eventName, payload);
    }
  }
}
