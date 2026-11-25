declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export const FB_PIXEL_ID: string =
  (typeof import.meta !== 'undefined' &&
    ((import.meta as any).env?.NEXT_PUBLIC_FACEBOOK_PIXEL_ID ||
      (import.meta as any).env?.VITE_FACEBOOK_PIXEL_ID)) ||
  (typeof process !== 'undefined' &&
    (process.env?.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || process.env?.VITE_FACEBOOK_PIXEL_ID)) ||
  '';

/**
 * Triggers a standard Meta Pixel PageView event.
 */
export const pageview = (eventId?: string): void => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function' && FB_PIXEL_ID) {
    if (eventId) {
      window.fbq('track', 'PageView', {}, { eventID: eventId });
    } else {
      window.fbq('track', 'PageView');
    }
  }
};

/**
 * Triggers a standard or custom Meta Pixel event with optional deduplication eventID.
 *https://developers.facebook.com/docs/facebook-pixel/advanced/
 */
export const event = (
  name: string,
  options: Record<string, any> = {},
  eventId?: string
): void => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function' && FB_PIXEL_ID) {
    if (eventId) {
      window.fbq('track', name, options, { eventID: eventId });
    } else {
      window.fbq('track', name, options);
    }
  }
};
