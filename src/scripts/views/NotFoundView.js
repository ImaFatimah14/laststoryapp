class NotFoundView {
  async render() {
    return `
      <div class="not-found-view" style="text-align:center;padding:3rem 1rem;">
        <h2>404 - Halaman Tidak Ditemukan</h2>
        <p>Maaf, alamat yang Anda tuju tidak tersedia.</p>
        <a href="#/" class="btn-go-home" style="display:inline-block;margin-top:2rem;padding:0.75rem 1.5rem;background:#5b81ad;color:#fff;border-radius:8px;text-decoration:none;">Kembali ke Beranda</a>
      </div>
    `;
  }
}

export default NotFoundView;
