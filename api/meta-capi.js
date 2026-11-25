import crypto from 'node:crypto';

function sha256Hash(value) {
  if (!value) return undefined;
  const cleaned = String(value).trim().toLowerCase();
  if (!cleaned) return undefined;
  if (/^[a-f0-9]{64}$/.test(cleaned)) return cleaned;
  return crypto.createHash('sha256').update(cleaned, 'utf8').digest('hex');
}

function hashPhone(phone) {
  if (!phone) return undefined;
  let digits = String(phone).replace(/\D/g, '');
  if (!digits) return undefined;
  if (digits.startsWith('00')) digits = digits.slice(2);
  else if (digits.startsWith('0') && digits.length === 11) digits = '92' + digits.slice(1);
  else if (digits.length === 10 && digits.startsWith('3')) digits = '92' + digits;
  return sha256Hash(digits);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST /api/meta-capi.' });
  }

  try {
    const body = req.body || {};
    const eventName = String(body.event_name || '').trim();
    if (!eventName) {
      return res.status(400).json({ error: 'event_name is required.' });
    }

    const eventId = String(body.event_id || `evt_${Date.now()}`).trim();
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

    const cfConnectingIp = req.headers['cf-connecting-ip'];
    const forwardedFor = req.headers['x-forwarded-for'];
    const clientIp =
      (cfConnectingIp
        ? String(cfConnectingIp)
        : Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : typeof forwardedFor === 'string'
            ? forwardedFor.split(',')[0]
            : req.headers['x-real-ip'] || req.socket?.remoteAddress || ''
      )
        ?.toString()
        .trim() || undefined;

    const userAgent =
      (req.headers['user-agent'] || body.user_data?.client_user_agent || '')
        .toString()
        .trim() || undefined;

    const inputUser = body.user_data || {};
    const userData = {};

    const em = sha256Hash(inputUser.em);
    if (em) userData.em = [em];

    const ph = hashPhone(inputUser.ph);
    if (ph) userData.ph = [ph];

    const fn = sha256Hash(inputUser.fn);
    if (fn) userData.fn = [fn];

    const ln = sha256Hash(inputUser.ln);
    if (ln) userData.ln = [ln];

    const ct = sha256Hash(inputUser.ct ? String(inputUser.ct).replace(/[^a-zA-Z]/g, '') : undefined);
    if (ct) userData.ct = [ct];

    const country = sha256Hash(inputUser.country || 'pk');
    if (country) userData.country = [country];

    const externalId = sha256Hash(inputUser.external_id);
    if (externalId) userData.external_id = [externalId];

    // Unhashed fields per Meta CAPI specification
    if (inputUser.fbp) userData.fbp = String(inputUser.fbp).trim();
    if (inputUser.fbc) userData.fbc = String(inputUser.fbc).trim();
    if (inputUser.client_ip_address || clientIp) {
      userData.client_ip_address = String(inputUser.client_ip_address || clientIp).trim();
    }
    if (userAgent) {
      userData.client_user_agent = userAgent;
    }

    const eventPayload = {
      event_name: eventName,
      event_time: Number(body.event_time) || Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      event_source_url: body.event_source_url || req.headers.referer || undefined,
      user_data: userData,
      ...(body.custom_data && Object.keys(body.custom_data).length > 0
        ? { custom_data: body.custom_data }
        : {}),
    };

    if (!pixelId || !accessToken) {
      return res.status(200).json({
        sent: false,
        skipped: true,
        reason: 'Missing NEXT_PUBLIC_FACEBOOK_PIXEL_ID or META_ACCESS_TOKEN in environment',
        event_id: eventId,
        prepared_event: eventPayload,
      });
    }

    const graphBody = {
      data: [eventPayload],
      ...(testEventCode.trim() ? { test_event_code: testEventCode.trim() } : {}),
    };

    const graphRes = await fetch(
      `https://graph.facebook.com/v26.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(graphBody),
      }
    );

    const graphData = await graphRes.json().catch(() => ({}));
    if (!graphRes.ok) {
      return res.status(graphRes.status).json({
        sent: false,
        event_id: eventId,
        error: graphData?.error?.message || `Meta CAPI HTTP ${graphRes.status}`,
        response: graphData,
      });
    }

    return res.status(200).json({
      sent: true,
      event_id: eventId,
      response: graphData,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Meta CAPI error' });
  }
}
