import routes from '../routes/routes.js';
import { getActiveRoute } from '../routes/url-parser.js';
import { withViewTransition } from '../utils/view-transition.js';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    // this._insertSkipLink();
    this._setupDrawer();
    this._setupRouter();

    // Render halaman pertama kali (jika belum ada hash, paksa ke home)
    if (!window.location.hash) {
      window.location.hash = '#/';
    }
  }

  // _insertSkipLink() {
  //   const skipLink = document.createElement('a');
  //   skipLink.href = '#main-content';
  //   skipLink.textContent = 'Skip to content';
  //   skipLink.classList.add('skip-link');
  //   document.body.insertBefore(skipLink, document.body.firstChild);
  // }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  _setupRouter() {
    window.addEventListener('hashchange', () => this.renderPage());
    window.addEventListener('load', () => this.renderPage());
  }

  async renderPage() {
    try {
      // Cleanup halaman sebelumnya jika ada
      if (this.#currentPage && typeof this.#currentPage.cleanup === 'function') {
        await this.#currentPage.cleanup();
      }

      const url = getActiveRoute();
      const route = routes[url] || null;

      if (!route) {
        // Import NotFoundView secara dinamis agar tidak membebani initial bundle
        const NotFoundView = (await import('../views/NotFoundView.js')).default;
        const notFound = new NotFoundView();
        this.#content.innerHTML = await notFound.render();
        this.#currentPage = null;
        return;
      }

      const isLoggedIn = !!localStorage.getItem('accessToken');

      if (route.requiresAuth && !isLoggedIn) {
        window.location.hash = '#/login';
        this.#currentPage = null;
        return;
      }

      this._updateNav(isLoggedIn);

      this.#currentPage = route.page;

      const renderContent = async () => {
        this.#content.innerHTML = await route.page.render();
        if (typeof route.page.afterRender === 'function') {
          await route.page.afterRender();
        }

        // Fokuskan ke main content untuk pengguna keyboard
        const mainEl = document.querySelector('#main-content');
        if (mainEl) {
          mainEl.setAttribute('tabindex', '-1');
        }
      };

      // Jika browser mendukung View Transitions API
      await withViewTransition(async () => {
        await renderContent();
      });

    } catch (error) {
      console.error('Error saat merender halaman:', error);
      this.#content.innerHTML = '<p>Terjadi kesalahan saat memuat halaman.</p>';
      this.#currentPage = null;
    }
  }
  // Simpan referensi halaman saat ini untuk cleanup
  #currentPage = null;

  _updateNav(isLoggedIn) {
    const loginLink = document.querySelector('#loginLink');
    const logoutButton = document.querySelector('#logoutButton');
    const addStoryLink = document.querySelector('#addStoryLink');
    const savedStoriesLink = document.querySelector('#savedStoriesLink');

    if (loginLink) loginLink.style.display = isLoggedIn ? 'none' : 'inline-block';
    if (addStoryLink) addStoryLink.style.display = isLoggedIn ? 'inline-block' : 'none';
    if (logoutButton) logoutButton.style.display = isLoggedIn ? 'inline-block' : 'none';
    if (savedStoriesLink) savedStoriesLink.style.display = isLoggedIn ? 'inline-block' : 'none';

    if (logoutButton) {
      logoutButton.onclick = () => {
        localStorage.removeItem('accessToken');
        window.location.hash = '#/login';
      };
    }
  }
}

export default App;
