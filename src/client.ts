interface ClientHints {
  getHighEntropyValues?: (hints: string[]) => Promise<{ platformVersion?: string }>;
}

export function describeClient(ua: string, platformVersion?: string): string {
  let os = 'Unknown OS';
  if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Windows NT/i.test(ua)) os = platformVersion && Number.parseInt(platformVersion, 10) >= 13 ? 'Windows 11' : platformVersion ? 'Windows 10' : 'Windows';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Firefox\/|FxiOS\//.test(ua) ? 'Firefox' : /OPR\//.test(ua) ? 'Opera' : /Chrome\/|CriOS\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  return `${os} (${browser})`;
}

export async function detectClient(): Promise<string> {
  const hints = (navigator as Navigator & { userAgentData?: ClientHints }).userAgentData;
  try {
    const details = await hints?.getHighEntropyValues?.(['platformVersion']);
    return describeClient(navigator.userAgent, details?.platformVersion);
  } catch { return describeClient(navigator.userAgent); }
}

/** Session data comes only from our own host and is never stored in browser caches. */
export async function sessionIP(signal: AbortSignal): Promise<string> {
  const response = await fetch('/api/session', { signal, cache: 'no-store', credentials: 'omit' });
  if (!response.ok) throw new Error('Session lookup unavailable');
  const data: unknown = await response.json();
  if (!data || typeof data !== 'object' || !('ip' in data) || typeof data.ip !== 'string' || !/^[\da-f.:]{3,45}$/i.test(data.ip)) throw new Error('IP unavailable');
  return data.ip;
}
