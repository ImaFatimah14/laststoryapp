
self.addEventListener('install', () => self.skipWaiting());
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');
workbox.core.clientsClaim();

// Precache manifest di-inject saat build
workbox.precaching.precacheAndRoute([{"revision":"aa05fe93270daa8426bf3cb97563bdab","url":"index.html"},{"revision":"21a0a0a9b1fdb78eae4c9d97f7e90078","url":"favicon.png"},{"revision":"ac73f380ba0147f4fa5951dfaba2a665","url":"images/logo.png"},{"revision":"401d815dc206b8dc1b17cd0e37695975","url":"images/marker-icon-2x.png"},{"revision":"2273e3d8ad9264b7daa5bdbf8e6b47f8","url":"images/marker-icon.png"},{"revision":"44a526eed258222515aa21eaffd14a96","url":"images/marker-shadow.png"},{"revision":"93afcc5509bebcd9d4c7ca1fb7f18cfd","url":"images/screenshot-desktop.png"},{"revision":"b7a4f64b7301edabb61cd95c69b732ac","url":"images/screenshot-mobile.png"},{"revision":"6c2738df6569705f2fd6465b8249dbb0","url":"manifest.json"},{"revision":"fdd57204685cd07d1345593e812c7b8c","url":"scripts/config.js"},{"revision":"25e3377a74267e16ef491c7c6ea4f4ee","url":"scripts/data/api.js"},{"revision":"32655917f5e92d4f5e9ab3f0b8379a02","url":"scripts/index.js"},{"revision":"77d60157198366dc3b0228ed6d3d1368","url":"scripts/pages/about/about-page.js"},{"revision":"2fa973f6bde120cdbb091f7c603d065f","url":"scripts/pages/add/add-story-page.js"},{"revision":"007ad1c51807b3d4af4c0ec977145bbd","url":"scripts/pages/app.js"},{"revision":"a2d7421e7b4bfb55e4593f7de01d4515","url":"scripts/pages/home/home-page.js"},{"revision":"c2a793fe86c276d9dc44dc63972cb3c9","url":"scripts/pages/login/login-page.js"},{"revision":"c780b8a296e26ef0a515e86c1216db02","url":"scripts/pages/register/register-page.js"},{"revision":"e8c6f705ad36a1a035e500a798eaf4fa","url":"scripts/presenters/AddStoryPresenter.js"},{"revision":"09013495431d60ec2d04989982a69d22","url":"scripts/presenters/HomePresenter.js"},{"revision":"64b3b29e9517ab416ad347fdbd859de1","url":"scripts/presenters/LoginPresenter.js"},{"revision":"f2b31a593ea03c4acd9376131767b87f","url":"scripts/presenters/RegisterPresenter.js"},{"revision":"21664e07f40ae71209eeb6d9f8c0b587","url":"scripts/routes/routes.js"},{"revision":"4f6d4988a18e60df17818913a56c271b","url":"scripts/routes/url-parser.js"},{"revision":"f684c636db40712dcfe0059ce6185c76","url":"scripts/utils/app-shell.js"},{"revision":"09866619f02b84bfe561da1fce50cd94","url":"scripts/utils/fixLeafletIcons.js"},{"revision":"c50a1cd521f030fdb0cbf1a6d0532e5e","url":"scripts/utils/idb-helper.js"},{"revision":"56493937a2ce48caddc74dbaa625391c","url":"scripts/utils/index.js"},{"revision":"e94e5b27c1ac68cb318a10c45105cfaf","url":"scripts/utils/push-notification.js"},{"revision":"5e10a4f82c09a5078d6440907ff39438","url":"scripts/utils/view-transition.js"},{"revision":"f23fa184923c04f22256fff92bd30225","url":"scripts/views/AboutView.js"},{"revision":"31a237eff18d9c729f81380debea4f10","url":"scripts/views/AddStoryView.js"},{"revision":"ffc3bfce33c539de405522e0873b0c24","url":"scripts/views/HomeView.js"},{"revision":"945b4b22f3df89b270fe7212242f337d","url":"scripts/views/LoginView.js"},{"revision":"00ad53656d708a6043844979bd49c247","url":"scripts/views/NotFoundView.js"},{"revision":"325930b498adc3b11986af6fb9a89384","url":"scripts/views/RegisterView.js"},{"revision":"5515050e556fc0d25242069731d0a213","url":"app.css"}]);

// Runtime cache untuk API
workbox.routing.registerRoute(
  ({url}) => url.origin.includes('storyapi') || url.pathname.startsWith('/api'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'api-cache',
  })
);

// Runtime cache untuk gambar
workbox.routing.registerRoute(
  ({request}) => request.destination === 'image',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'image-cache',
  })
);
