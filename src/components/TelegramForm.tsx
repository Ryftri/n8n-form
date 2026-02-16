'use client';

import { useEffect, useState, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';
import { submitExpense } from '@/app/actions';

export default function TelegramForm() {
  // State untuk form input
  const [item, setItem] = useState('');
  const [category, setCategory] = useState('Material');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  
  // State untuk loading (spinner)
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi yang akan dipanggil saat tombol MainButton diklik
  const handleMainButtonClick = useCallback(async () => {
    // 1. Validasi
    if (!item || !price) {
      WebApp.showPopup({
        title: 'Error',
        message: 'Mohon lengkapi Nama Barang dan Harga!',
      });
      return;
    }

    // 2. UI Loading
    setIsLoading(true);
    WebApp.MainButton.showProgress();

    // 3. Siapkan data form
    const formData = {
      action: "lapor_pengeluaran",
      item,
      category,
      qty,
      price
    };

    // Ambil data user dari Telegram (Unsafe data cukup untuk konteks logging pengeluaran)
    const telegramUser = WebApp.initDataUnsafe?.user;

    // 4. Panggil Server Action
    const result = await submitExpense(formData, telegramUser);

    // 5. Handle Response
    if (result.success) {
      WebApp.MainButton.hideProgress();
      WebApp.close(); // Tutup aplikasi jika sukses
    } else {
      WebApp.MainButton.hideProgress();
      setIsLoading(false);
      WebApp.showPopup({
        title: 'Gagal',
        message: 'Terjadi kesalahan saat menghubungi n8n.',
      });
    }
  }, [item, category, qty, price]);

  // Efek untuk Inisialisasi Telegram SDK
  useEffect(() => {
    // Cek apakah kode dijalankan di client dan di dalam Telegram
    if (typeof window !== 'undefined') {
      
      // Expand agar full screen
      WebApp.expand();

      // Setup Tombol Utama (Native Telegram Button)
      WebApp.MainButton.setText("KIRIM LAPORAN");
      WebApp.MainButton.show(); // INI KUNCINYA: Hanya muncul di Telegram App

      // Pasang Event Listener
      WebApp.MainButton.onClick(handleMainButtonClick);

      // Cleanup saat component di-unmount (penting di React!)
      return () => {
        WebApp.MainButton.offClick(handleMainButtonClick);
      };
    }
  }, [handleMainButtonClick]);

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      {/* Title */}
      <h3 className="text-xl font-bold mb-2">Catat Pengeluaran 📝</h3>

      {/* Input Nama Barang */}
      <div className="flex flex-col gap-1">
        <label className="font-bold text-sm">Nama Barang</label>
        <input
          type="text"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="Contoh: Semen"
          className="p-3 rounded-lg border border-gray-300 bg-gray-100 text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />
      </div>

      {/* Input Kategori */}
      <div className="flex flex-col gap-1">
        <label className="font-bold text-sm">Kategori</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-3 rounded-lg border border-gray-300 bg-gray-100 text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
          className="p-3 rounded-lg border border-gray-300 bg-gray-100 text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
          className="p-3 rounded-lg border border-gray-300 bg-gray-100 text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />
      </div>

      {/* Loader Manual (Opsional, karena Telegram punya MainButton.showProgress) */}
      {isLoading && (
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* NOTE: Tidak ada tombol <button>Submit</button> HTML di sini.
         Tombolnya dikendalikan oleh WebApp.MainButton dari SDK.
      */}
    </div>
  );
}