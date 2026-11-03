import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { POST } from '../api/visit.js';

let previousVercel;
let messages;

beforeEach((context) => {
  previousVercel = process.env.VERCEL;
  process.env.VERCEL = '1';
  messages = [];
  context.mock.method(console, 'info', (message) => messages.push(JSON.parse(message)));
  context.mock.method(console, 'warn', () => {});
});

afterEach(() => {
  if (previousVercel === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = previousVercel;
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
  const response = POST(request({ cookie: 'session=secret', referer: 'https://example.com/private' }, {
    body: JSON.stringify({ ip: '198.51.100.99', path: '/private?token=secret' }),
  }));
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(await response.text(), '');
  assert.equal(messages.length, 1);
  assert.deepEqual(Object.keys(messages[0]).sort(), ['at', 'event', 'ip']);
  assert.equal(messages[0].event, 'visitor-ip');
  assert.equal(messages[0].ip, '203.0.113.10');
  assert.ok(Math.abs(Date.now() - Date.parse(messages[0].at)) < 5000);
});

test('supports native IPv6 visitors', () => {
  assert.equal(POST(request({ 'x-vercel-forwarded-for': '2001:db8::42' })).status, 204);
  assert.equal(messages[0].ip, '2001:db8::42');
});

test('restores a visitor IP behind a trusted Cloudflare IPv4 or IPv6 proxy', () => {
  for (const peer of ['104.16.1.2', '2606:4700::1234']) {
    assert.equal(POST(request({
      'x-vercel-forwarded-for': peer,
      'cf-connecting-ip': '198.51.100.25',
    })).status, 204);
  }
  assert.deepEqual(messages.map(({ ip }) => ip), ['198.51.100.25', '198.51.100.25']);
});

test('does not accept spoofed Cloudflare or X-Forwarded-For headers on direct requests', () => {
  assert.equal(POST(request({
    'cf-connecting-ip': '198.51.100.99',
    'cf-connecting-ipv6': '2001:db8::99',
    'x-forwarded-for': '198.51.100.99',
  })).status, 204);
  assert.equal(messages[0].ip, '203.0.113.10');
});

test('uses the original IPv6 when Cloudflare overwrites its header with pseudo IPv4', () => {
  for (const pseudoIp of ['240.1.2.3', '255.1.2.3']) {
    assert.equal(POST(request({
      'x-vercel-forwarded-for': '104.16.1.2',
      'cf-connecting-ip': pseudoIp,
      'cf-connecting-ipv6': '2001:db8::42',
    })).status, 204);
  }
  assert.deepEqual(messages.map(({ ip }) => ip), ['2001:db8::42', '2001:db8::42']);
});

test('does not record a proxy address as a visitor when Cloudflare client data is missing', () => {
  for (const client of ['', 'not-an-ip', '198.51.100.25, 198.51.100.26']) {
    assert.equal(POST(request({
      'x-vercel-forwarded-for': '104.16.1.2',
      'cf-connecting-ip': client,
    })).status, 503);
  }
  assert.equal(messages.length, 0);
});

test('rejects missing or malformed platform IPs without falling back to caller data', () => {
  for (const peer of ['', 'invalid', '203.0.113.10, 198.51.100.25']) {
    assert.equal(POST(request({
      'x-vercel-forwarded-for': peer,
      'x-forwarded-for': '198.51.100.99',
      'cf-connecting-ip': '198.51.100.99',
    })).status, 503);
  }
  assert.equal(messages.length, 0);
});

test('rejects cross-site requests, including null or missing origins', () => {
  for (const headers of [
    { origin: 'https://example.com' },
    { origin: 'null' },
    { origin: '' },
    { 'sec-fetch-site': 'cross-site' },
  ]) {
    assert.equal(POST(request(headers)).status, 403);
  }
  const withoutOrigin = request();
  withoutOrigin.headers.delete('origin');
  assert.equal(POST(withoutOrigin).status, 403);
  assert.equal(messages.length, 0);
});

test('does not log read requests', () => {
  const response = POST(request({}, { method: 'GET' }));
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'POST');
  assert.equal(messages.length, 0);
});

test('does not trust forwarded headers outside the Vercel runtime', () => {
  delete process.env.VERCEL;
  assert.equal(POST(request()).status, 503);
  assert.equal(messages.length, 0);
});
