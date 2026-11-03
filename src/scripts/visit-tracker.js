// A new ID per page instance, kept only in memory; no cookies or local storage.
export function startVisitTracking({
  window: win = window,
  document: doc = document,
  navigator: nav = navigator,
  fetch: send = fetch,
  now = () => performance.now(),
  createId = () => crypto.randomUUID(),
} = {}) {
  const visitId = createId();
  let referrer = '';
  try {
    const source = new URL(doc.referrer);
    if (['http:', 'https:'].includes(source.protocol)) referrer = source.origin;
  } catch { /* Direct visits and privacy settings can leave this empty. */ }
  const metadata = {
    version: 2, visitId, path: win.location.pathname, referrer,
    language: nav.language,
    tabletHint: /Macintosh/i.test(nav.userAgent) && nav.maxTouchPoints > 1,
  };
  const prose = doc.querySelector('.post .prose');
  let started = false;
  let suspended = false;
  let activeSince = null;
  let activeMs = 0;
  let scrollPercent = prose ? 0 : null;
  let lastSnapshot = '';

  const updateScroll = () => {
    if (!prose || doc.visibilityState !== 'visible' || suspended) return;
    const rect = prose.getBoundingClientRect();
    if (rect.height <= 0) return;
    const progress = Math.floor(Math.max(0, Math.min(100, (win.innerHeight - rect.top) / rect.height * 100)));
    scrollPercent = Math.max(scrollPercent, progress);
  };
  const accountTime = () => {
    if (activeSince === null) return;
    const current = now();
    activeMs += Math.max(0, current - activeSince);
    activeSince = current;
  };
  const report = (type) => {
    if (!started) return;
    accountTime();
    updateScroll();
    const durationSeconds = Math.min(86400, Math.floor(activeMs / 1000));
    const snapshot = `${durationSeconds}:${scrollPercent}`;
    if (type === 'engagement' && snapshot === lastSnapshot) return;
    lastSnapshot = snapshot;
    try {
      void send('/api/visit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store', keepalive: true,
        body: JSON.stringify({ ...metadata, type, durationSeconds, scrollPercent }),
      }).catch(() => {});
    } catch { /* Analytics must not interrupt reading or navigation. */ }
  };
  const resume = () => {
    if (suspended || doc.visibilityState !== 'visible') return;
    if (activeSince === null) activeSince = now();
    if (!started) { started = true; report('pageview'); }
    updateScroll();
  };
  const pause = () => {
    accountTime();
    activeSince = null;
    report('engagement');
  };
  const onVisibility = () => { if (doc.visibilityState === 'visible') resume(); else pause(); };
  const onPageHide = () => { pause(); suspended = true; };
  const onPageShow = () => { suspended = false; resume(); };
  const timer = win.setInterval(() => {
    if (doc.visibilityState === 'visible' && !suspended) report('engagement');
  }, 30000);
  doc.addEventListener('visibilitychange', onVisibility);
  win.addEventListener('scroll', updateScroll, { passive: true });
  win.addEventListener('resize', updateScroll, { passive: true });
  win.addEventListener('pagehide', onPageHide);
  win.addEventListener('pageshow', onPageShow);
  resume();

  return () => {
    pause();
    win.clearInterval(timer);
    doc.removeEventListener('visibilitychange', onVisibility);
    win.removeEventListener('scroll', updateScroll);
    win.removeEventListener('resize', updateScroll);
    win.removeEventListener('pagehide', onPageHide);
    win.removeEventListener('pageshow', onPageShow);
  };
}
