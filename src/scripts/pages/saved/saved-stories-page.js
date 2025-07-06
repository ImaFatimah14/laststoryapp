// Halaman untuk menampilkan daftar cerita yang disimpan user
import SavedStoriesView from '../../views/SavedStoriesView.js';

const SavedStoriesPage = {
  async render() {
    return `
      <section id="saved-stories-section">
        <h2>Cerita Tersimpan</h2>
        <div id="saved-stories-list"></div>
      </section>
    `;
  },
  async afterRender() {
    await SavedStoriesView.init();
  },
};

export default SavedStoriesPage;
