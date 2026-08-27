/* 尚益資產 PWA — 推播通知背景 Service Worker
   這支檔案要放在跟 index.html 「同一層」(repo 根目錄)，路徑必須是 /firebase-messaging-sw.js
   跟原本的 sw.js 是兩支不同的 Service Worker，用不同 scope 註冊，不會互相衝突，
   完全不用動到原本的 sw.js 內容。 */

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB527mQtDRdH4BYW4WIB0lDOOqHUpff2Ws",
  authDomain: "shangyiloan-financial.firebaseapp.com",
  projectId: "shangyiloan-financial",
  storageBucket: "shangyiloan-financial.firebasestorage.app",
  messagingSenderId: "622583676341",
  appId: "1:622583676341:web:5b6c7d405cb3b98d6b2dfc"
});

const messaging = firebase.messaging();

// APP完全沒開、或分頁在背景/手機螢幕鎖定時，收到推播會在這裡被觸發，跳出系統通知
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || '尚益資產';
  const body = (payload.notification && payload.notification.body) || (payload.data && payload.data.body) || '';
  self.registration.showNotification(title, {
    body,
    icon: './icon-192.png',
    badge: './icon-192.png',
    data: payload.data || {},
    tag: (payload.data && payload.data.tag) || 'xj-push'
  });
});

// 點擊系統通知：把使用者帶回APP（如果APP已經開著一個分頁，就切過去那個分頁，而不是重開新分頁）
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = self.location.href.replace('firebase-messaging-sw.js', '');
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
