import assert from 'node:assert/strict';
import { test } from 'node:test';
import { startVisitTracking } from '../src/scripts/visit-tracker.js';

function fixture({ visible = true, article = true } = {}) {
  let clock = 0;
  let top = 500;
  let heartbeat;
  const reports = [];
  const win = new EventTarget();
  Object.assign(win, {
    location: { pathname: '/posts/article/', search: '?token=secret' }, innerHeight: 800,
    setInterval: (callback, delay) => { heartbeat = callback; assert.equal(delay, 30000); return 1; },
    clearInterval: () => {},
  });
  const doc = new EventTarget();
  Object.assign(doc, {
    visibilityState: visible ? 'visible' : 'hidden',
    referrer: 'https://example.com/private?email=secret#hidden',
    querySelector: () => article ? { getBoundingClientRect: () => ({ top, height: 2000 }) } : null,
  });
  const stop = startVisitTracking({
    window: win, document: doc,
    navigator: { language: 'zh-CN', userAgent: 'Macintosh Safari', maxTouchPoints: 5 },
    now: () => clock, createId: () => 'a3669714-221b-453c-9688-4ab17d2233c7',
    fetch: (url, options) => {
      reports.push({ ...JSON.parse(options.body), options, url });
      return Promise.resolve({ ok: true });
    },
  });
  return {
    reports, win, doc, stop,
    advance: (ms) => { clock += ms; },
    tick: () => heartbeat(),
    scrollTo: (newTop) => { top = newTop; win.dispatchEvent(new Event('scroll')); },
    visibility: (state) => { doc.visibilityState = state; doc.dispatchEvent(new Event('visibilitychange')); },
  };
}

test('sends one pageview with only the page path and source origin, without cookies or URL secrets', () => {
  const f = fixture();
  const [record] = f.reports;
  assert.equal(record.type, 'pageview');
  assert.equal(record.path, '/posts/article/');
  assert.equal(record.referrer, 'https://example.com');
  assert.equal(record.language, 'zh-CN');
  assert.equal(record.tabletHint, true);
  assert.equal(record.durationSeconds, 0);
  assert.equal(record.scrollPercent, 15);
  assert.equal(record.options.credentials, 'omit');
  assert.equal(record.options.referrerPolicy, 'no-referrer');
  assert.equal(record.options.keepalive, true);
  assert.ok(!record.options.body.includes('secret'));
  f.visibility('visible');
  assert.equal(f.reports.length, 1);
});

test('does not count hidden-tab time and does not start a hidden pageview', () => {
  const f = fixture({ visible: false });
  f.advance(60000);
  f.tick();
  assert.equal(f.reports.length, 0);
  f.visibility('visible');
  f.advance(12000);
  f.visibility('hidden');
  assert.equal(f.reports.at(-1).durationSeconds, 12);
  f.advance(120000);
  f.tick();
  f.visibility('visible');
  f.advance(8000);
  f.visibility('hidden');
  assert.equal(f.reports.at(-1).durationSeconds, 20);
  assert.equal(f.reports.filter(({ type }) => type === 'pageview').length, 1);
});

test('records maximum article progress and cumulative foreground time in periodic snapshots', () => {
  const f = fixture();
  f.scrollTo(-1000);
  f.advance(30000);
  f.tick();
  assert.equal(f.reports.at(-1).scrollPercent, 90);
  assert.equal(f.reports.at(-1).durationSeconds, 30);
  f.scrollTo(500);
  f.advance(30000);
  f.tick();
  assert.equal(f.reports.at(-1).scrollPercent, 90);
  assert.equal(f.reports.at(-1).durationSeconds, 60);
  assert.ok(f.reports.every(({ visitId }) => visitId === f.reports[0].visitId));
});

test('flushes on leaving without duplicating visibility/pagehide events and resumes after bfcache restore', () => {
  const f = fixture();
  f.advance(10000);
  f.visibility('hidden');
  f.win.dispatchEvent(new Event('pagehide'));
  assert.equal(f.reports.length, 2);
  f.advance(120000);
  f.visibility('visible');
  f.win.dispatchEvent(new Event('pageshow'));
  f.advance(5000);
  f.visibility('hidden');
  assert.equal(f.reports.at(-1).durationSeconds, 15);
  assert.equal(f.reports.filter(({ type }) => type === 'pageview').length, 1);
});

test('does not claim article reading progress on non-article pages', () => {
  const f = fixture({ article: false });
  assert.equal(f.reports[0].scrollPercent, null);
  f.advance(30000);
  f.tick();
  assert.equal(f.reports[1].scrollPercent, null);
});

test('stopping a tracker removes its listeners and preserves the final measurement', () => {
  const f = fixture();
  f.advance(4000);
  f.stop();
  assert.equal(f.reports.at(-1).durationSeconds, 4);
  const count = f.reports.length;
  f.advance(30000);
  f.visibility('hidden');
  f.win.dispatchEvent(new Event('pagehide'));
  assert.equal(f.reports.length, count);
});
