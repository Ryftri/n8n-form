import TelegramForm from "@/components/TelegramForm";
import styles from "./page.module.css"; // Menggunakan style bawaan create-next-app

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Kita render komponen form di sini */}
        <TelegramForm />
      </main>
    </div>
  );
}