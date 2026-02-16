'use client';

import { useEffect, useState, useCallback } from 'react';
import Script from 'next/script';
import { submitExpense } from '@/app/actions';

// Definisi tipe window agar TS tidak error saat akses window.Telegram
declare global {
  interface Window {
    Telegram: any;
  }
}

export default function TelegramForm() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State Form
  const [item, setItem] = useState('');
  const [category, setCategory] = useState('Material');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');

  // Handle Submit ke Server Action
  const handleSubmit = useCallback(async () => {
    const tg = window.Telegram.WebApp;

    // 1. Validasi
    if (!item || !price) {
      tg.showPopup({ title: "Error", message: "Mohon lengkapi Nama Barang dan Harga!" });
      return;
    }

    // 2. UI Loading
    setLoading(true);
    tg.MainButton.showProgress();

    // 3. Ambil data user dari Telegram
    const user = tg.initDataUnsafe?.user;
    
    // Data form
    const formData = {
        item,
        category,
        qty,
        price
    };

    // 4. Panggil Server Action (Authentication terjadi di sini)
    const result = await submitExpense(formData, user);

    // 5. Handle Response
    setLoading(false);
    tg.MainButton.hideProgress();

    if (result.success) {
        tg.close(); // Tutup Mini App jika sukses
    } else {
        tg.showPopup({
            title: "Gagal",
            message: result.message || "Terjadi kesalahan saat menghubungi n8n."
        });
    }
  }, [item, category, qty, price]);

  // Efek saat Script Telegram dimuat
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram) {
      const tg = window.Telegram.WebApp;
      tg.expand();

      // Setup Tombol Utama
      tg.MainButton.setText("KIRIM LAPORAN");
      tg.MainButton.show();
      
      // Bersihkan event listener lama sebelum pasang baru
      tg.MainButton.offClick(handleSubmit);
      tg.MainButton.onClick(handleSubmit);

      setMounted(true);
    }
    
    // Cleanup
    return () => {
        if (typeof window !== 'undefined' && window.Telegram) {
            window.Telegram.WebApp.MainButton.offClick(handleSubmit);
        }
    };
  }, [handleSubmit]);

  return (
    <>
      <Script 
        src="https://telegram.org/js/telegram-web-app.js" 
        strategy="beforeInteractive"
      />

      <div style={{
        backgroundColor: 'var(--tg-theme-bg-color, #fff)',
        color: 'var(--tg-theme-text-color, #000)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        minHeight: '100vh', // Agar full screen
        fontFamily: 'sans-serif'
      }}>
        
        <h3 style={{ margin: '10px 0' }}>Catat Pengeluaran 📝</h3>

        {/* Form Inputs */}
        <label style={labelStyle}>Nama Barang</label>
        <input 
          type="text" 
          placeholder="Contoh: Semen"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Kategori</label>
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={inputStyle}
        >
          <option value="Material">Material</option>
          <option value="Upah">Upah</option>
          <option value="Alat">Alat</option>
          <option value="Konsumsi">Konsumsi</option>
        </select>

        <label style={labelStyle}>Jumlah</label>
        <input 
          type="number" 
          placeholder="0"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Harga Total</label>
        <input 
          type="number" 
          placeholder="Rp 0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={inputStyle}
        />

        {/* Loader CSS Custom */}
        {loading && (
          <div className="loader"></div>
        )}

        <style jsx global>{`
          .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: spin 2s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </>
  );
}

// Styling Objects (untuk kerapian)
const inputStyle: React.CSSProperties = {
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)',
  color: 'var(--tg-theme-text-color, #000)',
  fontSize: '16px'
};

const labelStyle: React.CSSProperties = {
  fontWeight: 'bold',
  fontSize: '14px',
  marginBottom: '-10px',
  marginTop: '5px'
};