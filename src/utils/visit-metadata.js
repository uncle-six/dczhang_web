const MAX_BODY_BYTES = 4096;

export async function readVisitPayload(request) {
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) {
    throw Object.assign(new Error('body-too-large'), { status: 413 });
  }
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw Object.assign(new Error('body-too-large'), { status: 413 });
    }
    chunks.push(value);
  }
  if (!size) return null; // Compatible with the original empty pageview request.
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

function clientSoftware(userAgent, tabletHint) {
  const ua = userAgent || '';
  const tablet = /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))
    || (tabletHint === true && /Macintosh/i.test(ua));
  let browser = 'Unknown';
  for (const [pattern, name] of [
    [/MicroMessenger/i, 'WeChat'], [/Edg(?:e|A|iOS)?\//i, 'Edge'],
    [/OPR\/|Opera/i, 'Opera'], [/Firefox\/|FxiOS\//i, 'Firefox'],
    [/Chrome\/|CriOS\//i, 'Chrome'], [/Safari\//i, 'Safari'],
  ]) { if (pattern.test(ua)) { browser = name; break; } }
  let os = 'Unknown';
  for (const [matches, name] of [
    [/iPhone|iPad|iPod/i.test(ua) || (tablet && /Macintosh/i.test(ua)), 'iOS'],
    [/Android/i.test(ua), 'Android'], [/Windows/i.test(ua), 'Windows'],
    [/CrOS/i.test(ua), 'ChromeOS'], [/Macintosh|Mac OS X/i.test(ua), 'macOS'],
    [/Linux/i.test(ua), 'Linux'],
  ]) { if (matches) { os = name; break; } }
  const device = tablet ? 'tablet' : /Mobi|iPhone|iPod/i.test(ua) ? 'mobile'
    : os === 'Unknown' ? 'unknown' : 'desktop';
  return { browser, os, device };
}

export function visitMetadata(payload, request) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)
    || payload.version !== 2
    || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.visitId)
    || !['pageview', 'engagement'].includes(payload.type)
    || typeof payload.path !== 'string' || payload.path.length > 1024
    || !payload.path.startsWith('/') || payload.path.startsWith('//')
    || /[\\\x00-\x20]/.test(payload.path)) throw new Error('invalid-visit');

  const page = new URL(payload.path, request.url);
  if (page.origin !== new URL(request.url).origin) throw new Error('invalid-path');

  let referrer = null;
  if (typeof payload.referrer === 'string' && payload.referrer.length <= 1024) {
    try {
      const source = new URL(payload.referrer);
      if (['http:', 'https:'].includes(source.protocol)) referrer = source.hostname;
    } catch { /* A referrer may be absent or restricted by the browser. */ }
  }
  const language = typeof payload.language === 'string' && payload.language.length <= 35
    && /^[a-z]{2,8}(?:-[a-z0-9]{1,8})*$/i.test(payload.language) ? payload.language : null;
  const durationSeconds = typeof payload.durationSeconds === 'number' && Number.isFinite(payload.durationSeconds)
    ? Math.max(0, Math.min(86400, Math.floor(payload.durationSeconds))) : 0;
  const scrollPercent = typeof payload.scrollPercent === 'number' && Number.isFinite(payload.scrollPercent)
    ? Math.max(0, Math.min(100, Math.floor(payload.scrollPercent))) : null;

  return {
    event: payload.type === 'pageview' ? 'visitor-pageview' : 'visitor-engagement',
    visitId: payload.visitId,
    path: page.pathname,
    referrer,
    ...clientSoftware(request.headers.get('user-agent'), payload.tabletHint),
    language,
    durationSeconds,
    scrollPercent,
  };
}
