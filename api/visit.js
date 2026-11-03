import { BlockList, isIP } from 'node:net';

// Cloudflare's published proxy networks, checked on 2026-11-03:
// https://www.cloudflare.com/ips-v4 and https://www.cloudflare.com/ips-v6
const cloudflare = new BlockList();
const cloudflareNetworks = [
  '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22',
  '103.31.4.0/22', '141.101.64.0/18', '108.162.192.0/18',
  '190.93.240.0/20', '188.114.96.0/20', '197.234.240.0/22',
  '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13',
  '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
  '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32',
  '2405:b500::/32', '2405:8100::/32', '2a06:98c0::/29',
  '2c0f:f248::/32',
];

for (const network of cloudflareNetworks) {
  const [address, prefix] = network.split('/');
  cloudflare.addSubnet(address, Number(prefix), isIP(address) === 6 ? 'ipv6' : 'ipv4');
}

function validIp(value) {
  const ip = value?.trim();
  return ip && isIP(ip) ? ip : null;
}

function visitorIp(headers) {
  // Only trust the client address set by Vercel, not a body/query parameter
  // or an arbitrary X-Forwarded-For supplied by a caller.
  const peer = validIp(headers.get('x-vercel-forwarded-for'));
  if (!peer) return null;

  if (!cloudflare.check(peer, isIP(peer) === 6 ? 'ipv6' : 'ipv4')) return peer;

  // Accept Cloudflare's client header only when the trusted peer is Cloudflare.
  const client = validIp(headers.get('cf-connecting-ip'));
  if (!client) return null;
  const ipv6 = validIp(headers.get('cf-connecting-ipv6'));
  const pseudoIpv4 = isIP(client) === 4 && Number(client.split('.')[0]) >= 240;
  return pseudoIpv4 && ipv6 && isIP(ipv6) === 6 ? ipv6 : client;
}

function emptyResponse(status, headers = {}) {
  return new Response(null, {
    status,
    headers: { 'cache-control': 'no-store', ...headers },
  });
}

export function POST(request) {
  if (request.method !== 'POST') return emptyResponse(405, { allow: 'POST' });

  // This endpoint relies on Vercel's sanitized request headers. Do not trust
  // forwarded IP headers when calling the handler on an arbitrary local server.
  if (process.env.VERCEL !== '1') return emptyResponse(503);

  const origin = request.headers.get('origin');
  if (origin !== new URL(request.url).origin
    || request.headers.get('sec-fetch-site') === 'cross-site') {
    return emptyResponse(403);
  }

  const ip = visitorIp(request.headers);
  if (!ip) {
    console.warn('visitor-ip-unavailable');
    return emptyResponse(503);
  }

  // Private runtime logs only: no public read endpoint and no IP in the response.
  console.info(JSON.stringify({ event: 'visitor-ip', at: new Date().toISOString(), ip }));
  return emptyResponse(204);
}
