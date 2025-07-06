// Sinkronisasi pending stories ke server (hanya jika ada photoFile)
async function syncPendingStories() {
  const pendingStories = await getAllPendingStories();
  if (!pendingStories.length) {
    console.log('[SYNC] Tidak ada pending stories untuk disinkronkan.');
    return false;
  }
  let anySynced = false;
  for (const story of pendingStories) {
    // Hanya sinkron jika ada photoFile (karena API butuh File, bukan string kosong)
    if (!story.photoFile) {
      console.warn('[SYNC] Pending story tidak punya photoFile, tidak bisa dikirim ke server:', story);
      // Hapus dari pending agar tidak menumpuk (atau bisa juga biarkan jika ingin retry manual)
      await deletePendingStory(story.localId);
      continue;
    }
    try {
      console.log('[SYNC] Mengirim pending story ke API:', story);
      const result = await API.addStory({
        description: story.description,
        lat: story.lat,
        lon: story.lon,
        photoFile: story.photoFile,
      });
      console.log('[SYNC] Berhasil menambah story ke server:', result);
      await deletePendingStory(story.localId);
      anySynced = true;
    } catch (e) {
      console.error('[SYNC] Gagal mengirim pending story:', story, e);
      // Jika gagal, biarkan tetap di pending
    }
  }
  return anySynced;
}
// File: src/scripts/presenters/HomePresenter.js
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fixLeafletIcons } from '../utils/fixLeafletIcons';

import API from '../data/api.js';
import HomeView from '../views/HomeView.js';
import { saveStories as saveStoriesIDB, getAllStories as getAllStoriesIDB, deleteStory as deleteStoryIDB, getAllPendingStories, deletePendingStory } from '../utils/idb-helper.js';

const HomePresenter = {
  async init() {
    // Sinkronisasi jika online
    async function trySyncAndReload() {
      if (navigator.onLine) {
        const synced = await syncPendingStories();
        if (synced) {
          // Jika ada yang tersinkron, refresh data dari API
          await HomePresenter.init();
          return true;
        }
      }
      return false;
    }

    // Event listener: saat online, coba sync
    window.addEventListener('online', () => {
      trySyncAndReload();
    });
    fixLeafletIcons();
    const container = HomeView.getStoryListContainer();
    const mapElement = HomeView.getMapElement();
    let map = null;

    // Defensive: jika container tidak ditemukan, jangan lanjut
    if (!container) {
      // Bisa juga tampilkan pesan error di main-content jika ingin
      return;
    }

    // Helper untuk render offline stories (gabung dengan pending)
    async function renderOfflineStories() {
      if (!container) return;
      const offlineStories = await getAllStoriesIDB();
      const pendingStories = await getAllPendingStories();
      // Gabungkan, pendingStories tanpa id API, beri id unik lokal
      const merged = [
        ...pendingStories.map((s) => ({
          ...s,
          id: 'pending-' + s.localId,
          name: s.name || 'Offline User',
          photoUrl: s.photoUrl || '',
          createdAt: s.createdAt || Date.now(),
        })),
        ...offlineStories,
      ];
      HomeView.clearLoading(container);
      HomeView.renderStories(container, merged, {
        offline: true,
        onDelete: async (id) => {
          if (id.startsWith('pending-')) {
            await deletePendingStory(Number(id.replace('pending-', '')));
          } else {
            await deleteStoryIDB(id);
          }
          renderOfflineStories();
        },
      });
    }


    // Cek koneksi
    if (!navigator.onLine) {
      await renderOfflineStories();
      return;
    }

    // Sinkronisasi pending stories sebelum fetch API
    const synced = await trySyncAndReload();
    if (synced) return;

    try {
      const stories = await API.getAllStories();
      // Simpan ke IndexedDB untuk offline
      await saveStoriesIDB(stories);

      const renderContent = () => {
        if (!container) return;
        HomeView.clearLoading(container);
        HomeView.renderStories(container, stories, {
          onSave: async (story) => {
            // Simpan story ke IndexedDB jika belum ada
            const savedStories = await getAllStoriesIDB();
            if (!savedStories.find(s => s.id === story.id)) {
              await saveStoriesIDB([story]);
              alert('Cerita berhasil disimpan!');
            } else {
              alert('Cerita sudah ada di daftar tersimpan.');
            }
          }
        });
      };
      HomeView.runViewTransition(renderContent);

      // Inisialisasi peta
      if (mapElement) {
        map = L.map(mapElement).setView([-2.5489, 118.0149], 4);
        const baseOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        });
        const baseTopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenTopoMap contributors',
        });
        baseOSM.addTo(map);
        L.control.layers(
          { 'OpenStreetMap': baseOSM, 'OpenTopoMap': baseTopo },
          {},
          { collapsed: false }
        ).addTo(map);
        HomeView.addStoryMarkers(map, stories);
      }
    } catch (error) {
      // Jika gagal fetch API, tampilkan data offline
      await renderOfflineStories();
      if (map) map.remove();
    }
  },
};

export default HomePresenter;
