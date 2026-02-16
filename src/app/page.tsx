'use client'; // Opsional, tapi baik untuk kejelasan jika parent-nya client component

import dynamic from 'next/dynamic';
import styles from "./page.module.css";

// UBAH BAGIAN INI:
// Gunakan dynamic import dengan ssr: false
const TelegramForm = dynamic(() => import('@/components/TelegramForm'), {
  ssr: false, // Ini kuncinya: Mematikan Server-Side Rendering untuk komponen ini
  loading: () => <p>Loading Form...</p> // (Opsional) Tampilan saat loading
});

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <TelegramForm />
      </main>
    </div>
  );
}