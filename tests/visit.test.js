import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { POST } from '../api/visit.js';

const configNames = [
  'VERCEL', 'VISITOR_IP_REDIS_REST_URL', 'VISITOR_IP_REDIS_REST_TOKEN',
  'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN',
  'KV_REST_API_URL', 'KV_REST_API_TOKEN',
  'UPSTASH_REDIS_REST_KV_REST_API_URL', 'UPSTASH_REDIS_REST_KV_REST_API_TOKEN',
];
let previousEnv;
let messages;
let warnings;
let writes;

beforeEach((context) => {
  previousEnv = Object.fromEntries(configNames.map((name) => [name, process.env[name]]));
  for (const name of configNames) delete process.env[name];
  process.env.VERCEL = '1';
  process.env.UPSTASH_REDIS_REST_URL = 'https://visitor-ips.example.upstash.io';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-only-token';
  messages = [];
  warnings = [];
  writes = [];
  context.mock.method(console, 'info', (message) => messages.push(JSON.parse(message)));
  context.mock.method(console, 'warn', (message) => warnings.push(message));
  context.mock.method(globalThis, 'fetch', async (url, options) => {
    writes.push({ url: String(url), options });
    return Response.json({ result: writes.length });
  });
});

afterEach(() => {
  for (const name of configNames) {
    if (previousEnv[name] === undefined) delete process.env[name];
    else process.env[name] = previousEnv[name];
  }
});

function request(headers = {}, options = {}) {
  return new Request('https://www.dczhang.me/api/visit', {
    method: 'POST',
    headers: {
      origin: 'https://www.dczhang.me',
      'sec-fetch-site': 'same-origin',
      'x-vercel-forwarded-for': '203.0.113.10',
      ...headers,
    },
    ...options,
  });
}

test('records only the platform IP and server timestamp without exposing them', async () => {
  const response = await POST(request({ cookie: 'session=secret', referer: 'https://example.com/private' }));
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-visitor-ip-storage'), 'redis');
  assert.equal(await response.text(), '');
  assert.equal(messages.length, 1);
  assert.deepEqual(Object.keys(messages[0]).sort(), ['at', 'event', 'ip']);
  assert.equal(messages[0].event, 'visitor-ip');
  assert.equal(messages[0].ip, '203.0.113.10');
  assert.ok(Math.abs(Date.now() - Date.parse(messages[0].at)) < 5000);
  assert.equal(writes.length, 1);
  const { options } = writes[0];
  const command = JSON.parse(options.body);
  assert.deepEqual(command.slice(0, 2), ['LPUSH', 'visitor:ips:v1']);
  assert.equal(command.length, 3);
  assert.deepEqual(JSON.parse(command[2]), messages[0]);
  assert.equal(options.headers.authorization, 'Bearer test-only-token');
  assert.equal(options.redirect, 'error');
  assert.ok(options.signal instanceof AbortSignal);
});

test('supports native IPv6 visitors', async () => {
  assert.equal((await POST(request({ 'x-vercel-forwarded-for': '2001:db8::42' }))).status, 204);
  assert.equal(messages[0].ip, '2001:db8::42');
});

test('restores a visitor IP behind a trusted Cloudflare IPv4 or IPv6 proxy', async () => {
  for (const peer of ['104.16.1.2', '2606:4700::1234']) {
    assert.equal((await POST(request({
      'x-vercel-forwarded-for': peer,
      'cf-connecting-ip': '198.51.100.25',
    }))).status, 204);
  }
  assert.deepEqual(messages.map(({ ip }) => ip), ['198.51.100.25', '198.51.100.25']);
});

test('does not accept spoofed Cloudflare or X-Forwarded-For headers on direct requests', async () => {
  assert.equal((await POST(request({
    'cf-connecting-ip': '198.51.100.99',
    'cf-connecting-ipv6': '2001:db8::99',
    'x-forwarded-for': '198.51.100.99',
  }))).status, 204);
  assert.equal(messages[0].ip, '203.0.113.10');
});

test('uses the original IPv6 when Cloudflare overwrites its header with pseudo IPv4', async () => {
  for (const pseudoIp of ['240.1.2.3', '255.1.2.3']) {
    assert.equal((await POST(request({
      'x-vercel-forwarded-for': '104.16.1.2',
      'cf-connecting-ip': pseudoIp,
      'cf-connecting-ipv6': '2001:db8::42',
    }))).status, 204);
  }
  assert.deepEqual(messages.map(({ ip }) => ip), ['2001:db8::42', '2001:db8::42']);
});

test('does not record a proxy address as a visitor when Cloudflare client data is missing', async () => {
  for (const client of ['', 'not-an-ip', '198.51.100.25, 198.51.100.26']) {
    assert.equal((await POST(request({
      'x-vercel-forwarded-for': '104.16.1.2',
      'cf-connecting-ip': client,
    }))).status, 503);
  }
  assert.equal(messages.length, 0);
});

test('rejects missing or malformed platform IPs without falling back to caller data', async () => {
  for (const peer of ['', 'invalid', '203.0.113.10, 198.51.100.25']) {
    assert.equal((await POST(request({
      'x-vercel-forwarded-for': peer,
      'x-forwarded-for': '198.51.100.99',
      'cf-connecting-ip': '198.51.100.99',
    }))).status, 503);
  }
  assert.equal(messages.length, 0);
});

test('rejects cross-site requests, including null or missing origins', async () => {
  for (const headers of [
    { origin: 'https://example.com' },
    { origin: 'null' },
    { origin: '' },
    { 'sec-fetch-site': 'cross-site' },
  ]) {
    assert.equal((await POST(request(headers))).status, 403);
  }
  const withoutOrigin = request();
  withoutOrigin.headers.delete('origin');
  assert.equal((await POST(withoutOrigin)).status, 403);
  assert.equal(messages.length, 0);
  assert.equal(writes.length, 0);
});

test('does not log read requests', async () => {
  const response = await POST(request({}, { method: 'GET' }));
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'POST');
  assert.equal(messages.length, 0);
});

test('does not trust forwarded headers outside the Vercel runtime', async () => {
  delete process.env.VERCEL;
  assert.equal((await POST(request())).status, 503);
  assert.equal(messages.length, 0);
  assert.equal(writes.length, 0);
});

test('retains every visit instead of expiring, overwriting, or trimming records', async () => {
  await Promise.all([POST(request()), POST(request()), POST(request())]);
  assert.equal(writes.length, 3);
  assert.ok(writes.every(({ options }) => JSON.parse(options.body)[0] === 'LPUSH'));
});

test('supports all existing integration prefixes and prefers visitor-specific credentials', async () => {
  for (const [url, token] of [
    ['KV_REST_API_URL', 'KV_REST_API_TOKEN'],
    ['UPSTASH_REDIS_REST_KV_REST_API_URL', 'UPSTASH_REDIS_REST_KV_REST_API_TOKEN'],
    ['VISITOR_IP_REDIS_REST_URL', 'VISITOR_IP_REDIS_REST_TOKEN'],
  ]) {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env[url] = 'https://alternate.example.upstash.io';
    process.env[token] = 'alternate-test-token';
    if (url.startsWith('VISITOR_IP_')) {
      process.env.UPSTASH_REDIS_REST_URL = 'https://old.example.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'old-test-token';
    }
    assert.equal((await POST(request())).status, 204);
    assert.equal(writes.at(-1).url, 'https://alternate.example.upstash.io/');
    assert.equal(writes.at(-1).options.headers.authorization, 'Bearer alternate-test-token');
    delete process.env[url];
    delete process.env[token];
  }
});

test('does not mix incomplete URL/token pairs from different integrations', async () => {
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  process.env.VISITOR_IP_REDIS_REST_TOKEN = 'other-integration-token';
  const response = await POST(request());
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('x-visitor-ip-storage'), 'runtime-log');
  assert.equal(writes.length, 0);
  assert.equal(messages.length, 1);
});

test('preserves a fallback log without claiming database success if storage is unconfigured', async () => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  const response = await POST(request());
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('x-visitor-ip-storage'), 'runtime-log');
  assert.equal(await response.text(), '');
  assert.equal(messages.length, 1);
  assert.equal(writes.length, 0);
  assert.equal(JSON.parse(warnings[0]).reason, 'missing-config');
});

test('rejects insecure database endpoints without sending the token', async () => {
  process.env.UPSTASH_REDIS_REST_URL = 'http://visitor-ips.example.upstash.io';
  assert.equal((await POST(request())).status, 503);
  assert.equal(writes.length, 0);
});

test('handles provider errors, quota failures, malformed responses, and timeouts safely', async (context) => {
  for (const fail of [
    async () => Response.json({ error: 'test-only-token' }, { status: 429 }),
    async () => Response.json({ error: 'test-only-token' }),
    async () => Response.json({ result: 0 }),
    async () => Response.json({ result: 'OK' }),
    async () => new Response('invalid-json'),
    async () => { throw new Error('test-only-token'); },
    async () => { throw new DOMException('test-only-token', 'TimeoutError'); },
  ]) {
    context.mock.method(globalThis, 'fetch', fail);
    const response = await POST(request());
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('x-visitor-ip-storage'), 'runtime-log');
    assert.equal(await response.text(), '');
  }
  assert.equal(messages.length, 7);
  assert.ok(warnings.every((message) => !message.includes('test-only-token')));
});

function details(overrides = {}) {
  return {
    version: 2, visitId: 'a3669714-221b-453c-9688-4ab17d2233c7', type: 'pageview',
    path: '/posts/article/?token=secret#private',
    referrer: 'https://example.com/private?email=secret#hidden',
    language: 'zh-CN', durationSeconds: 0, scrollPercent: 10,
    ...overrides,
  };
}

const safari = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1';

test('stores all visitor fields while stripping URL secrets and ignoring client-supplied identity', async () => {
  const response = await POST(request({ 'user-agent': safari }, {
    body: JSON.stringify(details({ ip: '198.51.100.99', at: 'yesterday', browser: 'Forged', name: 'private', latitude: 30 })),
  }));
  assert.equal(response.status, 204);
  const record = JSON.parse(JSON.parse(writes[0].options.body)[2]);
  assert.deepEqual(record, {
    event: 'visitor-pageview', at: messages[0].at, ip: '203.0.113.10',
    visitId: 'a3669714-221b-453c-9688-4ab17d2233c7', path: '/posts/article/',
    referrer: 'example.com', browser: 'Safari', os: 'iOS', device: 'mobile',
    language: 'zh-CN', durationSeconds: 0, scrollPercent: 10,
  });
  assert.equal(await response.text(), '');
  assert.ok(!writes[0].options.body.includes('secret'));
});

test('persists engagement snapshots correlated to the same page visit', async () => {
  await POST(request({ 'user-agent': safari }, { body: JSON.stringify(details()) }));
  await POST(request({ 'user-agent': safari }, {
    body: JSON.stringify(details({ type: 'engagement', durationSeconds: 48, scrollPercent: 75 })),
  }));
  const records = writes.map(({ options }) => JSON.parse(JSON.parse(options.body)[2]));
  assert.equal(records[0].visitId, records[1].visitId);
  assert.equal(records[1].event, 'visitor-engagement');
  assert.equal(records[1].durationSeconds, 48);
  assert.equal(records[1].scrollPercent, 75);
});

test('recognizes browser, OS, and approximate device families without retaining raw user agents', async () => {
  for (const [ua, tabletHint, browser, os, device] of [
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/132.0 Safari/537.36 Edg/132.0', false, 'Edge', 'Windows', 'desktop'],
    ['Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/132.0 Mobile Safari/537.36', false, 'Chrome', 'Android', 'mobile'],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1 Version/18.0 Safari/605.1', true, 'Safari', 'iOS', 'tablet'],
    ['Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0', false, 'Firefox', 'Linux', 'desktop'],
    ['ExampleBot/1.0', false, 'Unknown', 'Unknown', 'unknown'],
  ]) {
    assert.equal((await POST(request({ 'user-agent': ua }, { body: JSON.stringify(details({ tabletHint })) }))).status, 204);
    assert.deepEqual([messages.at(-1).browser, messages.at(-1).os, messages.at(-1).device], [browser, os, device]);
    assert.ok(!('userAgent' in messages.at(-1)));
  }
});

test('normalizes absent sources and invalid measurements without saving arbitrary values', async () => {
  await POST(request({}, { body: JSON.stringify(details({
    referrer: 'javascript:alert(1)', language: '<private>', durationSeconds: -2, scrollPercent: 300,
  })) }));
  assert.equal(messages[0].referrer, null);
  assert.equal(messages[0].language, null);
  assert.equal(messages[0].durationSeconds, 0);
  assert.equal(messages[0].scrollPercent, 100);
  await POST(request({}, { body: JSON.stringify(details({ durationSeconds: 9999999, scrollPercent: null })) }));
  assert.equal(messages[1].durationSeconds, 86400);
  assert.equal(messages[1].scrollPercent, null);
});

test('rejects malformed metadata before storing any records', async () => {
  for (const body of [
    '{broken', '[]', JSON.stringify(details({ version: 3 })),
    JSON.stringify(details({ visitId: 'not-an-id' })),
    JSON.stringify(details({ type: 'something-else' })),
    JSON.stringify(details({ path: '//example.com/private' })),
    JSON.stringify(details({ path: '/\\example.com/private' })),
    JSON.stringify(details({ path: 'https://example.com/private' })),
  ]) assert.equal((await POST(request({}, { body }))).status, 400);
  assert.equal(writes.length, 0);
  assert.equal(messages.length, 0);
});

test('enforces the actual body-size limit even without Content-Length', async () => {
  assert.equal((await POST(request({}, { body: 'x'.repeat(4097) }))).status, 413);
  assert.equal((await POST(request({ 'content-length': '5000' }, { body: '{}' }))).status, 413);
  assert.equal(writes.length, 0);
});
