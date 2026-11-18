const CACHE_NAME = 'syzc-finance-v2'; // 2026-11-18 v2：清掉舊版存下來的聊天圖片快取
const ASSETS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('./index.html')));
    return;
  }
  // Cache API 只支援 GET 請求，POST/PUT 等寫入類請求（例如 Firestore 的寫入）直接跳過快取，
  // 不然 cache.put() 會丟出 "Request method 'POST' is unsupported" 這個錯誤
  if (e.request.method !== 'GET') {
    return;
  }
  // 2026-11-18：只快取自己網站的檔案。聊天室圖片／檔案（Firebase Storage）等其他網站的東西不要碰：
  // 畫面上 <img> 載入時存到的是「上鎖版」，之後轉傳／下載要用程式讀同一個網址，會拿到上鎖版而讀不出來（轉傳失敗）
  if (new URL(e.request.url).origin !== self.location.origin) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetchPromise = fetch(e.request).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
