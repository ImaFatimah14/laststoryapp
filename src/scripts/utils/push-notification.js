// src/scripts/utils/push-notification.js
const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Gunakan path relatif agar kompatibel di GitHub Pages (subfolder)
    const swPath = window.location.pathname.includes('/StoryApp2') ? '/StoryApp2/sw.js' : '/sw.js';
    console.log('[PushNotif] Registering service worker at:', swPath);
    try {
      const reg = await navigator.serviceWorker.register(swPath);
      console.log('[PushNotif] Service worker registered:', reg);
      return reg;
    } catch (err) {
      console.error('[PushNotif] Failed to register service worker:', err);
      throw err;
    }
  }
  throw new Error('Service Worker not supported');
}


export async function subscribePushNotification(token) {
  console.log('[PushNotif] Mulai subscribe push notification...');
  await registerServiceWorker();
  if (!('PushManager' in window)) throw new Error('Push not supported');
  // Tunggu service worker benar-benar aktif
  const registration = await navigator.serviceWorker.ready;
  let subscription;
  try {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    console.log('[PushNotif] Subscription berhasil:', subscription);
  } catch (err) {
    console.error('[PushNotif] Gagal subscribe:', err);
    alert('Gagal subscribe push notification: ' + (err.message || err));
    throw err;
  }
  // Kirim subscription ke server
  try {
    const subObj = subscription.toJSON ? subscription.toJSON() : JSON.parse(JSON.stringify(subscription));
    if ('expirationTime' in subObj) delete subObj.expirationTime;
    const res = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subObj),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('[PushNotif] API subscribe gagal:', data);
      alert('Gagal subscribe ke server: ' + (data.message || res.statusText));
      throw new Error(data.message || res.statusText);
    }
    console.log('[PushNotif] Subscription ke server berhasil:', data);
  } catch (err) {
    console.error('[PushNotif] Gagal kirim subscription ke server:', err);
    alert('Gagal subscribe ke server: ' + (err.message || err));
    throw err;
  }
  return subscription;
}

export async function unsubscribePushNotification(token) {
  console.log('[PushNotif] Mulai unsubscribe push notification...');
  await registerServiceWorker();
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    // Hapus dari server
    try {
      const res = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error('[PushNotif] API unsubscribe gagal:', data);
        alert('Gagal unsubscribe ke server: ' + (data.message || res.statusText));
        throw new Error(data.message || res.statusText);
      }
      console.log('[PushNotif] Unsubscribe ke server berhasil:', data);
    } catch (err) {
      console.error('[PushNotif] Gagal kirim unsubscribe ke server:', err);
      alert('Gagal unsubscribe ke server: ' + (err.message || err));
      throw err;
    }
    // Hapus dari browser
    try {
      const unsubResult = await subscription.unsubscribe();
      console.log('[PushNotif] Unsubscribe dari browser berhasil:', unsubResult);
    } catch (err) {
      console.error('[PushNotif] Gagal unsubscribe dari browser:', err);
      alert('Gagal unsubscribe dari browser: ' + (err.message || err));
    }
    // Pastikan benar-benar unsubscribed
    const check = await registration.pushManager.getSubscription();
    if (check) {
      // Coba unsubscribe ulang jika masih ada
      try { await check.unsubscribe(); } catch {}
    }
  } else {
    console.log('[PushNotif] Tidak ada subscription yang aktif.');
  }
}

export async function isPushSubscribed() {
  if (!('serviceWorker' in navigator)) return false;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return false;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}
