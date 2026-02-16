'use client';

import { useState, useCallback } from 'react';
// import WebApp from '@twa-dev/sdk'; // KITA MATIKAN SEMENTARA BIAR TIDAK ERROR DI BROWSER
import { submitExpense } from '@/app/actions';

export default function TelegramForm() {
  // State untuk form input
  const [item, setItem] = useState('');
  const [category, setCategory] = useState('Material');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  
  // State untuk loading
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi submit manual (pengganti handleMainButtonClick)
  const handleManualSubmit = useCallback(async () => {
    // 1. Validasi
    if (!item || !price) {
      // Ganti WebApp.showPopup dengan alert biasa
      alert('Error: Mohon lengkapi Nama Barang dan Harga!');
      return;
    }

    // 2. UI Loading
    setIsLoading(true);

    // 3. Siapkan data form
    const formData = {
      action: "lapor_pengeluaran",
      item,
      category,
      qty,
      price
    };

    // MOCK DATA USER (Palsu)
    // Karena di browser kita tidak login Telegram, kita buat data palsu
    const telegramUser = {
        id: 999999,
        first_name: "Debug User",
        username: "debug_browser",
        is_bot: false
    };

    // 4. Panggil Server Action
    const result = await submitExpense(formData, telegramUser);

    // 5. Handle Response
    if (result.success) {
      alert("SUKSES! Laporan berhasil dikirim ke n8n.");
      // Reset form biar enak
      setItem('');
      setQty('');
      setPrice('');
    } else {
      alert(`GAGAL: ${result.message || 'Terjadi kesalahan server.'}`);
    }
    
    setIsLoading(false);
  }, [item, category, qty, price]);

  // Efek Telegram DITUTUP SEMENTARA
  /*
  useEffect(() => {
    if (typeof window !== 'undefined') {
      WebApp.expand();
      WebApp.MainButton.setText("KIRIM LAPORAN");
      WebApp.MainButton.show();
      WebApp.MainButton.onClick(handleMainButtonClick);
      return () => {
        WebApp.MainButton.offClick(handleMainButtonClick);
      };
    }
  }, [handleMainButtonClick]);
  */

  return (
    <div className="flex flex-col gap-4 w-full max-w-md p-4 bg-white dark:bg-black">
      {/* Title */}
      <h3 className="text-xl font-bold mb-2 text-center">Mode Debug Browser 🛠️</h3>

      {/* Input Nama Barang */}
      <div className="flex flex-col gap-1">
        <label className="font-bold text-sm">Nama Barang</label>
        <input
          type="text"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="Contoh: Semen"
          className="p-3 rounded-lg border border-gray-300 bg-gray-100 text-black"
        />
      </div>

      {/* Input Kategori */}
      <div className="flex flex-col gap-1">
        <label className="font-bold text-sm">Kategori</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-3 rounded-lg border border-gray-300 bg-gray-100 text-black"
        >
          <option value="Material">Material</option>
          <option value="Upah">Upah</option>
          <option value="Alat">Alat</option>
          <option value="Konsumsi">Konsumsi</option>
        </select>
      </div>

      {/* Input Jumlah */}
      <div className="flex flex-col gap-1">
        <label className="font-bold text-sm">Jumlah</label>
        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="0"
          className="p-3 rounded-lg border border-gray-300 bg-gray-100 text-black"
        />
      </div>

      {/* Input Harga */}
      <div className="flex flex-col gap-1">
        <label className="font-bold text-sm">Harga Total</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Rp 0"
          className="p-3 rounded-lg border border-gray-300 bg-gray-100 text-black"
        />
      </div>

      {/* TOMBOL HTML BIASA (PENGGANTI TOMBOL TELEGRAM) */}
      <button
        onClick={handleManualSubmit}
        disabled={isLoading}
        className="w-full mt-4 p-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
      >
        {isLoading ? 'Sedang Mengirim...' : 'KIRIM LAPORAN (TEST)'}
      </button>
      
    </div>
  );
}