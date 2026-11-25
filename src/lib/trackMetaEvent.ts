import { event as fbPixelEvent, FB_PIXEL_ID } from './fpixel';

export type StandardMetaEventName =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'
  | 'Lead'
  | 'Search'
  | 'Contact';

export interface MetaTrackingUserInfo {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  city?: string;
  country?: string;
  externalId?: string;
}

export interface TrackMetaEventOptions {
  eventName: StandardMetaEventName | string;
  eventId?: string;
  orderId?: string | number;
  customData?: Record<string, any>;
  userData?: MetaTrackingUserInfo;
  eventSourceUrl?: string;
}

const CLOUD_API_ORIGIN = 'https://rangeroshecommercestore.vercel.app';

/**
 * Reads a browser cookie by name (used for `_fbp` and `_fbc`).
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined' || !document.cookie) return undefined;
  const escaped = name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * Builds `_fbc` from the URL `fbclid` query parameter if `_fbc` cookie is not yet set.
 */
export function getFbpAndFbc(): { fbp?: string; fbc?: string } {
  const fbp = getCookie('_fbp');
  let fbc = getCookie('_fbc');

  if (!fbc && typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      const fbclid = params.get('fbclid');
      if (fbclid) {
        fbc = `fb.1.${Date.now()}.${fbclid}`;
      }
    } catch {
      // ignore URL parse errors
    }
  }

  return { fbp, fbc };
}

/**
 * Generates a deterministic `order_${orderId}` event ID for purchases or a unique UUID for other events
 * so browser Meta Pixel (`eventID`) and server Meta CAPI (`event_id`) deduplicate cleanly.
 */
export function generateMetaEventId(
  eventName: string,
  explicitEventId?: string,
  orderId?: string | number
): string {
  if (explicitEventId && explicitEventId.trim()) {
    return explicitEventId.trim();
  }
  if (eventName === 'Purchase' && orderId !== undefined && orderId !== null && String(orderId).trim()) {
    return `order_${String(orderId).trim()}`;
  }
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${eventName.toLowerCase()}_${crypto.randomUUID()}`;
  }
  return `${eventName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Splits a full name into `fn` (first name) and `ln` (last name) for Meta CAPI matching.
 */
function splitFullName(fullName?: string): { fn?: string; ln?: string } {
  if (!fullName || !fullName.trim()) return {};
  const parts = fullName.trim().split(/\s+/);
  const fn = parts[0];
  const ln = parts.length > 1 ? parts.slice(1).join(' ') : undefined;
  return { fn, ln };
}

/**
 * Fires both the client-side Meta Pixel (`fbq('track', eventName, customData, { eventID })`)
 * and the server-side Meta Conversions API (`POST /api/meta-capi` with `keepalive: true`)
 * using the exact same `event_id` for automatic Meta event deduplication.
 */
export async function trackMetaEvent(options: TrackMetaEventOptions): Promise<{
  eventId: string;
  pixelFired: boolean;
  capiSent: boolean;
}> {
  const { eventName, customData = {}, userData = {}, eventSourceUrl } = options;
  const eventId = generateMetaEventId(eventName, options.eventId, options.orderId);

  // 1. Fire client-side Meta Pixel with matching eventID
  let pixelFired = false;
  if (typeof window !== 'undefined' && typeof window.fbq === 'function' && FB_PIXEL_ID) {
    fbPixelEvent(eventName, customData, eventId);
    pixelFired = true;
  }

  // 2. Prepare server-side Meta CAPI payload with _fbp, _fbc, and customer PII
  const { fbp, fbc } = getFbpAndFbc();
  const splitName = splitFullName(userData.fullName);
  const fn = userData.firstName || splitName.fn;
  const ln = userData.lastName || splitName.ln;
  const sourceUrl =
    eventSourceUrl || (typeof window !== 'undefined' ? window.location.href : undefined);

  const capiBody = {
    event_name: eventName,
    event_id: eventId,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: sourceUrl,
    action_source: 'website' as const,
    custom_data: customData,
    user_data: {
      em: userData.email,
      ph: userData.phone,
      fn,
      ln,
      ct: userData.city,
      country: userData.country || 'pk',
      external_id: userData.externalId || (options.orderId ? String(options.orderId) : undefined),
      fbp,
      fbc,
      client_user_agent:
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    },
  };

  let capiSent = false;
  if (typeof fetch !== 'undefined') {
    try {
      let res = await fetch('/api/meta-capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(capiBody),
        keepalive: true,
      });

      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        // Fallback to cloud serverless API when running on static custom domain (rangerosh.com)
        res = await fetch(`${CLOUD_API_ORIGIN}/api/meta-capi`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(capiBody),
          keepalive: true,
        });
      }
      capiSent = res.ok;
    } catch {
      // Fail silently so storefront UX is never blocked by ad blockers or network drops
    }
  }

  return { eventId, pixelFired, capiSent };
}
