// 網路優先：有網路一律抓 GitHub 上最新的檔案，離線才回退到快取。
// 因此改版後不需要再手動更新版本號，重新整理一次即為新版。
const CACHE = 'workspace-cache';
const ASSETS = [
  './index.html', './manifest.json', './styles.css',
  './state.js', './sync.js', './helpers.js', './actions.js', './render.js', './events.js',
  './icon-192.png', './icon-512.png',
  './icons/home.png','./icons/calendar.png','./icons/assets.png','./icons/stats.png',
  './icons/history.png','./icons/insurance.png','./icons/settings.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // 跨網域（字型、Firebase 等）交給瀏覽器處理

  e.respondWith(
    fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' })
      .then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return res;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
