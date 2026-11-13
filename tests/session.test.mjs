import { test } from 'node:test';
import assert from 'node:assert/strict';
import session, { clientAddress } from '../api/session.js';
import { describeClient } from '../src/client.ts';

test('the session endpoint uses the Vercel client header only on a trusted deployment', () => {
  const request = { headers: { 'x-forwarded-for': '203.0.113.14, 10.0.0.1' }, socket: { remoteAddress: '::ffff:127.0.0.1' } };
  assert.equal(clientAddress(request, true), '203.0.113.14');
  assert.equal(clientAddress(request, false), '127.0.0.1');
  assert.equal(clientAddress({ headers: { 'x-forwarded-for': '<script>' } }, true), null);
  assert.equal(clientAddress({ headers: { 'x-forwarded-for': '2001:db8::1' } }, true), '2001:db8::1');
});

test('session data cannot be cached and non-GET requests are rejected', () => {
  const headers = {};
  let body;
  const response = { setHeader(name, value) { headers[name] = value; }, end(value) { body = JSON.parse(value); } };
  session({ method: 'GET', headers: {}, socket: { remoteAddress: '127.0.0.1' } }, response);
  assert.equal(response.statusCode, 200);
  assert.equal(body.ip, '127.0.0.1');
  assert.equal(headers['Cache-Control'], 'private, no-store');
  assert.equal(headers['CDN-Cache-Control'], 'no-store');
  session({ method: 'POST' }, response);
  assert.equal(response.statusCode, 405);
  assert.equal(headers.Allow, 'GET');
});

test('system detection distinguishes Windows versions and mobile browsers', () => {
  assert.equal(describeClient('Windows NT 10.0 Chrome/130.0', '13.0.0'), 'Windows 11 (Chrome)');
  assert.equal(describeClient('Windows NT 10.0 Chrome/130.0', '10.0.0'), 'Windows 10 (Chrome)');
  assert.equal(describeClient('Windows NT 10.0 Chrome/130.0'), 'Windows (Chrome)');
  assert.equal(describeClient('iPhone Mac OS X CriOS/130 Safari/604'), 'iOS (Chrome)');
  assert.equal(describeClient('Android Linux Chrome/130'), 'Android (Chrome)');
  assert.equal(describeClient('Windows NT 10.0 Chrome/130 Edg/130'), 'Windows (Edge)');
});
