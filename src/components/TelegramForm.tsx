'use client';

import { useEffect, useState, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';
import { submitExpense } from '@/app/actions';

export default function TelegramForm() {
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi submit yang dipicu oleh onSubmit form
  const handleSubmit = async (e?: React.FormEvent) => {
    // Mencegah reload halaman
    if (e) e.preventDefault();

    // Validasi: Nama, Kategori, dan Jumlah wajib diisi
    if (!nama || !kategori || !jumlah) {
      WebApp.showPopup({
        title: '⚠️ Data Kurang',
        message: 'Mohon isi Nama, Kategori, dan Jumlah (Rp)!',
      });
      return;
    }

    setIsLoading(true);
    WebApp.MainButton.showProgress();

    const formData = {
      nama,
      kategori,
      jumlah,
      keterangan: keterangan || "-"
    };

    const telegramUser = WebApp.initDataUnsafe?.user;
    const result = await submitExpense(formData, telegramUser, WebApp.initDataUnsafe);

    if (result.success) {
      WebApp.MainButton.hideProgress();
      WebApp.close();
    } else {
      WebApp.MainButton.hideProgress();
      setIsLoading(false);
      WebApp.showPopup({
        title: 'Gagal',
        message: 'Koneksi bermasalah atau terjadi error.',
      });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      WebApp.expand();
      WebApp.MainButton.setText("KIRIM LAPORAN");
      WebApp.MainButton.show();
      // Menghubungkan MainButton Telegram ke fungsi handleSubmit
      const handleTelegramButtonClick = () => handleSubmit();
      
      WebApp.MainButton.onClick(handleTelegramButtonClick);
      WebApp.setHeaderColor('secondary_bg_color');

      return () => {
        WebApp.MainButton.offClick(handleTelegramButtonClick);
      };
    }
  }, [nama, kategori, jumlah, keterangan]); // Dependencies diperbarui agar data terbaru terbaca saat tombol diklik

  const formatRupiah = (val: string) => {
    if (!val) return '';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val));
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <header className="form-header">
        <h1 className="form-title">
          <span className="title-gradient">Input Data Baru</span>
          <span className="title-icon">📝</span>
        </h1>
        <p className="form-subtitle">Silakan lengkapi form di bawah</p>
      </header>

      <section className="form-body">
        <div className="input-group">
          <label htmlFor="nama" className="input-label">Nama</label>
          <input
            id="nama"
            name="nama"
            type="text"
            className="input-field"
            placeholder="Masukkan Nama..."
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="kategori" className="input-label">Kategori</label>
          <input
            id="kategori"
            name="kategori"
            type="text"
            className="input-field"
            placeholder="Contoh: Transport, Makan, dll"
            required
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="jumlah" className="input-label">Jumlah (Rp)</label>
          <input
            id="jumlah"
            name="jumlah"
            type="number"
            className="input-field"
            placeholder="0"
            required
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
          />
          {jumlah && <output className="helper-text">{formatRupiah(jumlah)}</output>}
        </div>

        <div className="input-group">
          <label htmlFor="keterangan" className="input-label">Keterangan (Opsional)</label>
          <textarea
            id="keterangan"
            name="keterangan"
            className="input-field"
            placeholder="Catatan tambahan (boleh dikosongkan)"
            rows={3}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            style={{ resize: 'none', fontFamily: 'inherit' }}
          />
        </div>
      </section>

      {/* Button cadangan jika user menekan 'Enter' pada keyboard di browser */}
      <button type="submit" style={{ display: 'none' }}>Submit</button>

      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </form>
  );
}