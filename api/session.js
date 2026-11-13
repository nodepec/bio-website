import { isIP } from 'node:net';

export function clientAddress(request, trustVercel = process.env.VERCEL === '1') {
  // Vercel overwrites this header at its edge. Local servers use the actual socket.
  const forwarded = trustVercel ? request.headers['x-forwarded-for'] : undefined;
  const candidate = (typeof forwarded === 'string' ? forwarded.split(',')[0] : request.socket?.remoteAddress)?.trim() ?? '';
  const address = candidate.startsWith('::ffff:') ? candidate.slice(7) : candidate;
  return isIP(address) ? address : null;
}

export default function session(request, response) {
  response.setHeader('Cache-Control', 'private, no-store');
  response.setHeader('CDN-Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.statusCode = 405;
    response.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }
  response.statusCode = 200;
  response.end(JSON.stringify({ ip: clientAddress(request) }));
}
