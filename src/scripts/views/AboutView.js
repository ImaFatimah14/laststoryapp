export default class AboutView {
    getTemplate() {
      return `
        <section class="about-page about-container">
          <div class="about-content">
            <h2>Tentang Story App</h2>
            <p>
              Aplikasi Storyku dikembangkan sebagai bagian dari submission kelas Dicoding.<br>
              Tujuannya adalah untuk membagikan cerita dari pengguna ke seluruh dunia.<br>
              Dikembangkan oleh Manusia Bumi dengan ❤️.
            </p>
            <h3>Ayo Tulis Semua Ceritamu!</h3>
          </div>
        </section>
      `;
    }
    getShowMoreButton() {
      return document.querySelector('#show-more');
    }
    getExtraInfoContainer() {
      return document.querySelector('#extra-info');
    }
  }
  