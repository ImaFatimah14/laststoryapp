// View untuk menampilkan dan menghapus cerita tersimpan
import { getAllStories, deleteStory } from '../utils/idb-helper.js';

const SavedStoriesView = {
  async init() {
    const container = document.getElementById('saved-stories-list');
    container.innerHTML = '<p>Memuat cerita tersimpan...</p>';
    const stories = await getAllStories();
    if (!stories.length) {
      container.innerHTML = '<p>Belum ada cerita yang disimpan.</p>';
      return;
    }
    container.innerHTML = `<div class="story-list">
      ${stories.map(story => `
        <article class="story-card saved-story-item" data-id="${story.id}">
          <h3>${story.name}</h3>
          <p>${story.description || ''}</p>
          <button class="delete-saved-story">Hapus</button>
        </article>
      `).join('')}
    </div>`;
    container.querySelectorAll('.delete-saved-story').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.closest('.saved-story-item').dataset.id;
        await deleteStory(id);
        this.init();
      });
    });
  }
};

export default SavedStoriesView;
