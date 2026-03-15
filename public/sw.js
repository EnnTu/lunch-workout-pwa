// 午间铁馆 - Service Worker
const CACHE_NAME = 'lunch-workout-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/types/index.js',
  '/src/data/exercises.js',
  '/src/utils/trainingPlan.js',
  '/src/utils/oneRM.js',
  '/src/utils/storage.js',
  '/src/utils/voice.js',
  '/src/utils/charts.js',
  '/manifest.json'
];

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 拦截请求并提供缓存
self.addEventListener('fetch', (event) => {
  // 跳过非 GET 请求
  if (event.request.method !== 'GET') return;

  // 跳过钉钉/飞书 API 请求
  if (event.request.url.includes('dingtalk') ||
      event.request.url.includes('feishu')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // 返回缓存或发起网络请求
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // 更新缓存
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // 网络失败时返回缓存（离线支持）
        return cached;
      });

      return cached || fetchPromise;
    })
  );
});

// 后台同步（用于离线时记录训练数据）
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-workout-data') {
    event.waitUntil(syncWorkoutData());
  }
});

// 推送通知（休息提醒等）
self.addEventListener('push', (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: data.tag,
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || []
    })
  );
});

// 通知点击处理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'start-rest') {
    event.waitUntil(
      self.clients.openWindow('/?action=rest-timer')
    );
  } else {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

async function syncWorkoutData() {
  // 同步离线时存储的训练数据
  const db = await openDB('workout-db', 1);
  const pendingData = await db.getAll('pending-sync');

  for (const data of pendingData) {
    try {
      // 发送到服务器
      await fetch('/api/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      // 删除已同步的数据
      await db.delete('pending-sync', data.id);
    } catch (error) {
      console.error('同步失败:', error);
    }
  }
}

// IndexedDB 辅助函数
function openDB(name, version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
