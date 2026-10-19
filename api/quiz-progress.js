const json = (data, status = 200) => Response.json(data, {
  status,
  headers: {
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  },
});

const validBanks = new Set(['foundation', 'practice']);
const normalizeKey = (value) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

function validIdentity(key, bank) {
  return /^[A-Z0-9]{12}$/.test(key) && validBanks.has(bank);
}

function sanitizePayload(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const answers = {};
  for (const [id, answer] of Object.entries(value.answers || {})) {
    if (!/^\d{1,3}$/.test(id) || !Number.isInteger(answer) || answer < 0 || answer > 3) return null;
    answers[id] = answer;
  }
  const favorites = [...new Set(Array.isArray(value.favorites) ? value.favorites : [])]
    .filter((id) => Number.isInteger(id) && id > 0 && id <= 300)
    .slice(0, 300);
  const currentId = Number.isInteger(value.currentId) && value.currentId > 0 && value.currentId <= 300
    ? value.currentId
    : 1;
  const lastAnsweredId = Number.isInteger(value.lastAnsweredId) && value.lastAnsweredId > 0 && value.lastAnsweredId <= 300
    ? value.lastAnsweredId
    : null;
  const lastAnsweredAt = Number.isFinite(value.lastAnsweredAt) && value.lastAnsweredAt >= 0
    ? Math.floor(value.lastAnsweredAt)
    : 0;
  const streak = Number.isInteger(value.streak) && value.streak >= 0 ? Math.min(value.streak, 300) : 0;
  return { answers, favorites, currentId, lastAnsweredId, lastAnsweredAt, streak };
}

function redisCredentials() {
  return {
    url: process.env.UPSTASH_REDIS_REST_URL
      || process.env.KV_REST_API_URL
      || process.env.UPSTASH_REDIS_REST_KV_REST_API_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
      || process.env.KV_REST_API_TOKEN
      || process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN,
  };
}

async function redis(command) {
  const { url, token } = redisCredentials();
  if (!url || !token) throw new Error('Redis environment variables are not configured');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  const result = await response.json();
  if (!response.ok || result.error) throw new Error(result.error || `Redis HTTP ${response.status}`);
  return result.result;
}

export async function GET(request) {
  const { url, token } = redisCredentials();
  if (!url || !token) return json({ error: 'Upstash Redis is not configured' }, 503);
  const requestUrl = new URL(request.url);
  const key = normalizeKey(requestUrl.searchParams.get('key'));
  const bank = requestUrl.searchParams.get('bank') || '';
  if (!validIdentity(key, bank)) return json({ error: 'Invalid sync identity' }, 400);

  try {
    const value = await redis(['GET', `java-quiz:${key}:${bank}`]);
    if (value === null) return json({ error: 'Progress not found' }, 404);
    return json({ payload: JSON.parse(value) });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Database error' }, 500);
  }
}

export async function PUT(request) {
  const { url, token } = redisCredentials();
  if (!url || !token) return json({ error: 'Upstash Redis is not configured' }, 503);
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 50_000) return json({ error: 'Payload too large' }, 413);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const key = normalizeKey(body.key);
  const bank = String(body.bank || '');
  const payload = sanitizePayload(body.payload);
  if (!validIdentity(key, bank) || !payload) return json({ error: 'Invalid progress data' }, 400);

  try {
    await redis(['SET', `java-quiz:${key}:${bank}`, JSON.stringify(payload)]);
    return json({ ok: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Database error' }, 500);
  }
}
