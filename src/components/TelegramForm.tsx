'use client';

import { useEffect, useState, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';
import { submitExpense } from '@/app/actions';

export default function TelegramForm() {
  const [item, setItem] = useState('');
  const [category, setCategory] = useState('Material');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Logic cek apakah kategori 'Upah' dipilih
  const isUpah = category === 'Upah';

  const handleMainButtonClick = useCallback(async () => {
    // 1. Validasi Dinamis
    // Jika BUKAN upah, butuh item & price. Jika Upah, cukup item (dan qty opsional)
    const isValid = isUpah ? !!item : (item && price);

    if (!isValid) {
      WebApp.showPopup({
        title: '⚠️ Data Kurang',
        message: isUpah ? 'Mohon isi detail keterangan!' : 'Mohon isi Nama Barang dan Harga!',
      });
      return;
    }

    setIsLoading(true);
    WebApp.MainButton.showProgress();

    const formData = {
      action: "lapor_pengeluaran",
      item,
      category,
      qty,
      price: isUpah ? '0' : price // Kirim 0 atau kosong jika Upah (karena field di-hide)
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
        message: 'Koneksi bermasalah.',
      });
    }
  }, [item, category, qty, price, isUpah]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      WebApp.expand();
      WebApp.MainButton.setText("KIRIM LAPORAN");
      WebApp.MainButton.show();
      WebApp.MainButton.onClick(handleMainButtonClick);
      WebApp.setHeaderColor('secondary_bg_color');

      return () => {
        WebApp.MainButton.offClick(handleMainButtonClick);
      };
    }
  }, [handleMainButtonClick]);

  const formatRupiah = (val: string) => {
    if (!val) return '';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val));
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1 className="form-title">Catat Pengeluaran 📝</h1>
        <p className="form-subtitle">Lapor data proyek harian</p>
      </div>

      <div className="form-body">
        
        {/* Item Name */}
        <div className="input-group">
          <label className="input-label">
            {isUpah ? 'Keterangan Tukang' : 'Nama Barang / Jasa'}
          </label>
          <input
            type="text"
            className="input-field"
            placeholder={isUpah ? "Contoh: Pak Budi & Tim" : "Contoh: Semen Gresik"}
            value={item}
            onChange={(e) => setItem(e.target.value)}
          />
        </div>

        {/* Category - UPDATED OPTIONS */}
        <div className="input-group">
          <label className="input-label">Kategori</label>
          <div className="select-wrapper">
            <select
              className="select-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Material">🧱 Material</option>
              <option value="Konsumsi">☕ Konsumsi</option>
              <option value="Gaji Tukang">👷 Upah Tukang</option>
            </select>
          </div>
        </div>

        {/* LOGIC LAYOUT:
           Jika 'isUpah' true -> Hapus class 'form-row' agar input Jumlah jadi full width.
           Jika false -> Pakai 'form-row' agar Jumlah & Harga berdampingan.
        */}
        <div className={isUpah ? "" : "form-row"}>
          
          {/* Input Jumlah */}
          <div className="input-group">
            <label className="input-label">
              {isUpah ? 'Jumlah' : 'Jumlah (Qty)'}
            </label>
            <input
              type="number"
              className="input-field"
              placeholder="0"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>

          {/* Input Harga (Hanya muncul jika BUKAN Upah) */}
          {!isUpah && (
            <div className="input-group">
              <label className="input-label">Total Harga</label>
              <input
                type="number"
                className="input-field"
                placeholder="Rp"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              {price && <span className="helper-text">{formatRupiah(price)}</span>}
            </div>
          )}
        </div>

      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}