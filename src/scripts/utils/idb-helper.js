// IndexedDB Helper for StoryApp2
// Menyimpan, menampilkan, dan menghapus data story offline

const DB_NAME = 'storyapp2-db';

const DB_VERSION = 2;
const STORE_NAME = 'stories';
const PENDING_STORE = 'pendingStories';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(PENDING_STORE)) {
        db.createObjectStore(PENDING_STORE, { keyPath: 'localId', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
// Pending Stories (offline add)
export async function addPendingStory(story) {
  const db = await openDB();
  const tx = db.transaction(PENDING_STORE, 'readwrite');
  const store = tx.objectStore(PENDING_STORE);
  await store.add(story);
  await tx.complete;
  db.close();
}

export async function getAllPendingStories() {
  const db = await openDB();
  const tx = db.transaction(PENDING_STORE, 'readonly');
  const store = tx.objectStore(PENDING_STORE);
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function deletePendingStory(localId) {
  const db = await openDB();
  const tx = db.transaction(PENDING_STORE, 'readwrite');
  const store = tx.objectStore(PENDING_STORE);
  await store.delete(localId);
  await tx.complete;
  db.close();
}

export async function saveStories(stories) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  for (const story of stories) {
    store.put(story);
  }
  await tx.complete;
  db.close();
}

export async function getAllStories() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function deleteStory(id) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.delete(id);
  await tx.complete;
  db.close();
}
