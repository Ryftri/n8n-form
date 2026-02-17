'use client';

import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { submitExpense } from '@/app/actions';

export default function TelegramForm() {
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('');
  const [jumlah, setJumlah] = useState(''); // Quantity
  const [harga, setHarga] = useState('');   // Harga Rupiah
  const [struk, setStruk] = useState<string | null>(null); // Wajib
  const [keterangan, setKeterangan] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatRupiah = (val: string) => {
    if (!val) return '';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran file (maks 4MB)
      if (file.size > 4 * 1024 * 1024) {
        WebApp.showPopup({
            title: 'File Terlalu Besar',
            message: 'Maksimal ukuran foto adalah 4MB',
        });
        e.target.value = ''; // Reset input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setStruk(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setStruk(null);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validasi: Struk sekarang WAJIB
    if (!nama || !kategori || !jumlah || !harga || !struk) {
      WebApp.showPopup({
        title: '⚠️ Data Kurang',
        message: 'Mohon lengkapi Nama, Kategori, Quantity, Harga, dan Upload Struk!',
      });
      return;
    }

    setIsLoading(true);
    WebApp.MainButton.showProgress();

    const formData = {
      nama,
      kategori,
      jumlah,
      harga,
      struk, // Pasti ada isinya karena sudah divalidasi
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
        message: 'Terjadi kesalahan saat mengirim data.',
      });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      WebApp.expand();
      WebApp.MainButton.setText("KIRIM LAPORAN");
      WebApp.MainButton.show();
      
      const handleTelegramButtonClick = () => handleSubmit();
      WebApp.MainButton.onClick(handleTelegramButtonClick);
      WebApp.setHeaderColor('secondary_bg_color');

      return () => {
        WebApp.MainButton.offClick(handleTelegramButtonClick);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nama, kategori, jumlah, harga, struk, keterangan]); 

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <header className="form-header">
        <h1 className="form-title">
          <span className="title-gradient">Input Pengeluaran</span>
          <span className="title-icon">📝</span>
        </h1>
      </header>

      <section className="form-body">
        {/* Nama Barang */}
        <div className="input-group">
          <label htmlFor="nama" className="input-label">Nama Item</label>
          <input
            id="nama"
            type="text"
            className="input-field"
            placeholder="Nama barang..."
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
        </div>

        {/* Kategori */}
        <div className="input-group">
          <label htmlFor="kategori" className="input-label">Kategori</label>
          <input
            id="kategori"
            type="text"
            className="input-field"
            placeholder="Makan, Transport, dll"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
          />
        </div>

        {/* Quantity */}
        <div className="input-group">
          <label htmlFor="jumlah" className="input-label">Quantity (Jml Barang)</label>
          <input
            id="jumlah"
            type="number"
            className="input-field"
            placeholder="1"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
          />
        </div>

        {/* Harga */}
        <div className="input-group">
          <label htmlFor="harga" className="input-label">Harga (Rp)</label>
          <input
            id="harga"
            type="number"
            className="input-field"
            placeholder="0"
            value={harga}
            onChange={(e) => setHarga(e.target.value)}
          />
          {harga && <output className="helper-text">{formatRupiah(harga)}</output>}
        </div>

        {/* Struk - WAJIB */}
        <div className="input-group">
          <label htmlFor="struk" className="input-label">Foto Struk (Wajib)</label>
          <input
            id="struk"
            type="file"
            accept="image/*"
            className="input-field"
            style={{ padding: '12px' }}
            onChange={handleFileChange}
          />
          {struk ? (
            <p className="helper-text" style={{color: 'green'}}>✅ Foto siap dikirim</p>
          ) : (
             <p className="helper-text" style={{color: '#ff3b30'}}>* Wajib diupload</p>
          )}
        </div>

        {/* Keterangan */}
        <div className="input-group">
          <label htmlFor="keterangan" className="input-label">Keterangan (Opsional)</label>
          <textarea
            id="keterangan"
            className="input-field"
            placeholder="Catatan tambahan..."
            rows={3}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            style={{ resize: 'none' }}
          />
        </div>
      </section>

      <button type="submit" style={{ display: 'none' }}>Submit</button>

      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </form>
  );
}