'use client';

import dynamic from 'next/dynamic';
import styles from "./page.module.css";

// PENTING: Gunakan dynamic import dengan ssr: false
// Ini mencegah Next.js merender komponen ini di server
const TelegramForm = dynamic(() => import('@/components/TelegramForm'), {
  ssr: false,
  loading: () => <p className="p-4 text-center">Memuat Form...</p>
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