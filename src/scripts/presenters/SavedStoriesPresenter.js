// Presenter untuk halaman Cerita Tersimpan
import SavedStoriesView from '../views/SavedStoriesView.js';

const SavedStoriesPresenter = {
  async init() {
    await SavedStoriesView.init();
  },
};

export default SavedStoriesPresenter;
