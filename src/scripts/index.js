// CSS imports

import '../styles/styles.css';
import App from '../scripts/pages/app';

// Register Service Worker for Push Notification as early as possible
import('./utils/push-notification').then((pushNotif) => {
  pushNotif.registerServiceWorker().catch(() => {});
});

// PWA: Prompt install event
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  // Optionally, show a custom install button
});

document.addEventListener('DOMContentLoaded', () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  const skipLink = document.querySelector('.skip-to-content');
  const mainContent = document.querySelector('#main-content');

  if (skipLink && mainContent) {
    skipLink.addEventListener('click', (event) => {
      event.preventDefault(); 
      mainContent.setAttribute('tabindex', '-1'); 
      mainContent.focus(); 
      mainContent.scrollIntoView({ behavior: 'smooth' }); 
    });
  }

  // Push Notification Button Logic
  import('./utils/push-notification').then((pushNotif) => {
    const btn = document.getElementById('pushNotifBtn');
    if (!btn) return;

    function updateBtn(isSubscribed) {
      if (isSubscribed) {
        btn.textContent = 'Nonaktifkan Notifikasi';
        btn.classList.remove('subscribe');
        btn.classList.add('unsubscribe');
        btn.innerHTML = '<i data-feather="bell-off"></i> Nonaktifkan Notifikasi';
      } else {
        btn.textContent = 'Aktifkan Notifikasi';
        btn.classList.remove('unsubscribe');
        btn.classList.add('subscribe');
        btn.innerHTML = '<i data-feather="bell"></i> Aktifkan Notifikasi';
      }
      if (window.feather) window.feather.replace();
    }

    async function refreshBtn() {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        btn.style.display = 'none';
        return;
      }
      btn.style.display = 'inline-block';
      btn.disabled = true;
      try {
        // Pastikan service worker ready
        await navigator.serviceWorker.ready;
        const isSubscribed = await pushNotif.isPushSubscribed();
        updateBtn(isSubscribed);
        btn.disabled = false;
      } catch (err) {
        btn.disabled = true;
        updateBtn(false);
        console.error('[PushNotif] Service worker not ready:', err);
      }
    }

    btn.addEventListener('click', async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Silakan login untuk mengaktifkan notifikasi.');
        return;
      }
      btn.disabled = true;
      try {
        // Cek permission notification
        if (Notification.permission === 'denied') {
          alert('Izin notifikasi ditolak. Silakan aktifkan izin notifikasi di browser Anda.');
          btn.disabled = false;
          return;
        }
        // Pastikan service worker ready
        await navigator.serviceWorker.ready;
        const isSubscribed = await pushNotif.isPushSubscribed();
        if (isSubscribed) {
          await pushNotif.unsubscribePushNotification(token);
        } else {
          // Minta izin notifikasi jika belum
          if (Notification.permission !== 'granted') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
              alert('Izin notifikasi diperlukan untuk mengaktifkan push notification.');
              btn.disabled = false;
              return;
            }
          }
          await pushNotif.subscribePushNotification(token);
        }
      } catch (e) {
        alert('Gagal mengubah status notifikasi: ' + (e.message || e));
        console.error('[PushNotif] Error:', e);
      }
      await refreshBtn();
      btn.disabled = false;
    });

    // Perbarui tombol saat login/logout
    window.addEventListener('hashchange', refreshBtn);
    refreshBtn();
  });
});
