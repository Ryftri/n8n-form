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
  
  // State untuk loading
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi saat tombol MainButton diklik
  const handleMainButtonClick = useCallback(async () => {
    if (!item || !price) {
      WebApp.showPopup({
        title: '⚠️ Data Tidak Lengkap',
        message: 'Mohon lengkapi Nama Barang dan Harga!',
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
      price
    };

    const telegramUser = WebApp.initDataUnsafe?.user;

    const result = await submitExpense(formData, telegramUser);

    if (result.success) {
      WebApp.MainButton.hideProgress();
      WebApp.close(); 
    } else {
      WebApp.MainButton.hideProgress();
      setIsLoading(false);
      WebApp.showPopup({
        title: 'Gagal',
        message: 'Terjadi kesalahan koneksi.',
      });
    }
  }, [item, category, qty, price]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      WebApp.expand();
      WebApp.MainButton.setText("KIRIM LAPORAN");
      WebApp.MainButton.show();
      WebApp.MainButton.onClick(handleMainButtonClick);
      
      // Mengatur warna header Telegram agar sesuai tema
      WebApp.setHeaderColor('secondary_bg_color'); 

      return () => {
        WebApp.MainButton.offClick(handleMainButtonClick);
      };
    }
  }, [handleMainButtonClick]);

  // Helper untuk format rupiah visual (opsional)
  const formatRupiah = (val: string) => {
    if (!val) return '';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val));
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 shadow-lg text-white">
        <h3 className="text-2xl font-bold mb-1">Catat Pengeluaran 📝</h3>
        <p className="text-blue-100 text-sm opacity-90">Input data proyek dengan mudah.</p>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 flex flex-col gap-5">
        
        {/* Input Nama Barang */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1">
            📦 Nama Barang
          </label>
          <input
            type="text"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="Contoh: Semen Tiga Roda"
            className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white placeholder-gray-400"
          />
        </div>

        {/* Input Kategori */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1">
            🏷️ Kategori
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3.5 appearance-none rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            >
              <option value="Material">🧱 Material</option>
              <option value="Upah">👷 Upah Tukang</option>
              <option value="Alat">🔧 Sewa Alat</option>
              <option value="Konsumsi">☕ Konsumsi</option>
              <option value="Lainnya">📄 Lain-lain</option>
            </select>
            {/* Custom Arrow Icon */}
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
            </div>
          </div>
        </div>

        {/* Grid Layout untuk Qty & Price */}
        <div className="grid grid-cols-2 gap-4">
          {/* Input Jumlah */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1">
              🔢 Jumlah
            </label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0"
              className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            />
          </div>

          {/* Input Harga */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1">
              💰 Harga Total
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Rp"
              className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            />
          </div>
        </div>
        
        {/* Preview Harga (Optional: Tampilkan format rupiah biar user yakin) */}
        {price && (
          <div className="text-right text-xs font-medium text-blue-600 dark:text-blue-400">
            Terbaca: {formatRupiah(price)}
          </div>
        )}

      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-full shadow-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      )}

      <p className="text-center mt-8 text-xs text-gray-400">
        Data akan dikirim ke Spreadsheet n8n
      </p>
    </div>
  );
}