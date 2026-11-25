import crypto from 'node:crypto';

export interface MetaCapiUserDataInput {
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
  ct?: string;
  country?: string;
  external_id?: string;
  fbp?: string;
  fbc?: string;
  client_ip_address?: string;
  client_user_agent?: string;
}

export interface MetaCapiEventInput {
  event_name: string;
  event_id: string;
  event_time?: number;
  event_source_url?: string;
  action_source?: 'website';
  user_data?: MetaCapiUserDataInput;
  custom_data?: Record<string, any>;
}

/**
 * Normalizes and SHA-256 hashes a string value according to Meta CAPI guidelines.
 * If already a 64-character hex SHA-256 digest, returns it as-is.
 */
export function sha256Hash(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const cleaned = String(value).trim().toLowerCase();
  if (!cleaned) return undefined;
  if (/^[a-f0-9]{64}$/.test(cleaned)) {
    return cleaned;
  }
  return crypto.createHash('sha256').update(cleaned, 'utf8').digest('hex');
}

/**
 * Normalizes a phone number to digits-only (converting Pakistani local 03XX to 923XX)
 * and returns its SHA-256 hash for Meta CAPI `ph`.
 */
export function hashPhone(phone: string | undefined | null): string | undefined {
  if (!phone) return undefined;
  let digits = String(phone).replace(/\D/g, '');
  if (!digits) return undefined;
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = '92' + digits.slice(1);
  } else if (digits.length === 10 && digits.startsWith('3')) {
    digits = '92' + digits;
  }
  return sha256Hash(digits);
}

/**
 * Builds the Meta Conversions API `user_data` object:
 * - Hashes PII (`em`, `ph`, `fn`, `ln`, `ct`, `country`, `external_id`) via SHA-256
 * - Leaves `fbp`, `fbc`, `client_ip_address`, and `client_user_agent` unhashed
 */
export function buildMetaUserData(
  input: MetaCapiUserDataInput = {},
  fallbackIp?: string,
  fallbackUserAgent?: string
): Record<string, any> {
  const userData: Record<string, any> = {};

  const hashedEm = sha256Hash(input.em);
  if (hashedEm) userData.em = [hashedEm];

  const hashedPh = hashPhone(input.ph);
  if (hashedPh) userData.ph = [hashedPh];

  const hashedFn = sha256Hash(input.fn);
  if (hashedFn) userData.fn = [hashedFn];

  const hashedLn = sha256Hash(input.ln);
  if (hashedLn) userData.ln = [hashedLn];

  const hashedCt = sha256Hash(input.ct ? input.ct.replace(/[^a-zA-Z]/g, '') : undefined);
  if (hashedCt) userData.ct = [hashedCt];

  const hashedCountry = sha256Hash(input.country || 'pk');
  if (hashedCountry) userData.country = [hashedCountry];

  const hashedExtId = sha256Hash(input.external_id);
  if (hashedExtId) userData.external_id = [hashedExtId];

  // Unhashed fields per Meta CAPI specification
  if (input.fbp) userData.fbp = String(input.fbp).trim();
  if (input.fbc) userData.fbc = String(input.fbc).trim();

  const clientIp = input.client_ip_address || fallbackIp;
  if (clientIp) userData.client_ip_address = String(clientIp).trim();

  const clientUa = input.client_user_agent || fallbackUserAgent;
  if (clientUa) userData.client_user_agent = String(clientUa).trim();

  return userData;
}

/**
 * Dispatches an event payload to Meta Conversions API (Graph API v26.0).
 */
export async function sendMetaCapiEvent(
  eventInput: MetaCapiEventInput,
  requestMeta: { ip?: string; userAgent?: string; referer?: string } = {}
): Promise<{
  sent: boolean;
  skipped?: boolean;
  reason?: string;
  event_id: string;
  response?: any;
}> {
  const pixelId =
    process.env.NEXT_PUBLIC_META_PIXEL_ID ||
    process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID ||
    process.env.VITE_META_PIXEL_ID ||
    process.env.VITE_FACEBOOK_PIXEL_ID ||
    process.env.FACEBOOK_PIXEL_ID ||
    '2635132979997484';
  const accessToken =
    process.env.META_CAPI_ACCESS_TOKEN ||
    process.env.META_ACCESS_TOKEN ||
    '';
  const testEventCode = process.env.META_TEST_EVENT_CODE || '';

  const eventId = eventInput.event_id || `evt_${Date.now()}`;

  if (!pixelId || !accessToken) {
    return {
      sent: false,
      skipped: true,
      reason: 'Missing NEXT_PUBLIC_FACEBOOK_PIXEL_ID or META_ACCESS_TOKEN in environment',
      event_id: eventId,
    };
  }

  const userData = buildMetaUserData(
    eventInput.user_data,
    requestMeta.ip,
    requestMeta.userAgent
  );

  const eventPayload: Record<string, any> = {
    event_name: eventInput.event_name,
    event_time: eventInput.event_time || Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: 'website',
    event_source_url: eventInput.event_source_url || requestMeta.referer || undefined,
    user_data: userData,
  };

  if (eventInput.custom_data && Object.keys(eventInput.custom_data).length > 0) {
    eventPayload.custom_data = eventInput.custom_data;
  }

  const graphBody: Record<string, any> = {
    data: [eventPayload],
  };

  if (testEventCode.trim()) {
    graphBody.test_event_code = testEventCode.trim();
  }

  const endpoint = `https://graph.facebook.com/v26.0/${encodeURIComponent(
    pixelId
  )}/events?access_token=${encodeURIComponent(accessToken)}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(graphBody),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      sent: false,
      reason: data?.error?.message || `Meta CAPI HTTP ${res.status}`,
      event_id: eventId,
      response: data,
    };
  }

  return {
    sent: true,
    event_id: eventId,
    response: data,
  };
}

function escapeCsvCell(val: string | number | undefined | null): string {
  const str = String(val ?? '').replace(/\r?\n|\r/g, ' ').trim();
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates a Meta Commerce Manager CSV product catalog feed for https://rangerosh.com.
 * Columns: id, title, description, availability, condition, price, link, image_link, brand
 */
export function buildMetaCatalogCsv(products: any[], siteOrigin = 'https://rangerosh.com'): string {
  const origin = siteOrigin.replace(/\/+$/, '');
  const header = [
    'id',
    'title',
    'description',
    'availability',
    'condition',
    'price',
    'link',
    'image_link',
    'brand',
  ].join(',');

  const rows = (products || [])
    .filter((p) => p && p.is_published !== false && p.is_published !== 0)
    .map((p) => {
      const id = String(p.sku || p.id || '').trim();
      const title = String(p.title || p.name || '').trim();
      const description = String(
        p.overview || p.fabric_details || `${title} — Rang e Rosh Ladies Stitched Suit`
      ).trim();
      const availStock = Number(p.inventory?.available_stock ?? p.available_stock ?? 14);
      const availability = availStock > 0 ? 'in stock' : 'out of stock';
      const condition = 'new';
      const numPrice = Math.round(
        Number(p.effective_price ?? p.discounted_price ?? p.regular_price ?? 4699)
      );
      const price = `${numPrice} PKR`;
      const slug = String(p.slug || p.id || '').trim();
      const link = `${origin}/product/${encodeURIComponent(slug)}`;
      const rawImg = String(p.primary_image || '').trim();
      const imageLink = rawImg.startsWith('http')
        ? rawImg
        : `${origin}${rawImg.startsWith('/') ? '' : '/'}${encodeURI(rawImg)}`;
      const brand = 'Rang e Rosh';

      return [
        escapeCsvCell(id),
        escapeCsvCell(title),
        escapeCsvCell(description),
        escapeCsvCell(availability),
        escapeCsvCell(condition),
        escapeCsvCell(price),
        escapeCsvCell(link),
        escapeCsvCell(imageLink),
        escapeCsvCell(brand),
      ].join(',');
    });

  return [header, ...rows].join('\n');
}
