'use server'

import { generateN8nToken } from '@/lib/n8n-auth';

// Pastikan URL ini sudah benar atau gunakan process.env
const N8N_WEBHOOK_URL = "https://n8n.frienddev.tech/webhook-test/a0b4587c-0876-44c3-bad3-f5c752aace10";

// Fungsi helper untuk format tanggal Indonesia (TIDAK DIUBAH)
function getFormattedDateWIB() {
  const now = new Date();
  const jakartaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  
  const hari = days[jakartaTime.getDay()];
  const tanggal = jakartaTime.getDate();
  const bulan = String(jakartaTime.getMonth() + 1).padStart(2, '0');
  const tahun = jakartaTime.getFullYear();

  return `${hari}, ${tanggal}-${bulan}-${tahun}`;
}

// Interface opsional untuk type safety (bisa diabaikan jika ingin pakai 'any')
interface ExpenseFormData {
  nama: string;
  kategori: string;
  jumlah: string; // Quantity
  harga: string;  // Rupiah
  struk: string;  // Base64 Image
  keterangan: string;
}

export async function submitExpense(formData: ExpenseFormData, telegramUser: any, initDataUnsafe: any) {
  try {
    const token = await generateN8nToken();
    
    // Generate tanggal format khusus (Logic tetap)
    const tanggalFormatted = getFormattedDateWIB();

    const payload = {
      update_id: Date.now(),
      initDataUnsafe,
      // Tanggal format khusus di root payload (sesuai request lama)
      formatted_date: tanggalFormatted, 
      callback_query: {
        id: "webapp_" + Date.now(),
        from: telegramUser || { id: 0, first_name: "Anonymous (Browser)" },
        message: {
          message_id: 0,
          date: Math.floor(Date.now() / 1000),
          chat: {
            id: telegramUser?.id || 0,
            type: "private",
            first_name: telegramUser?.first_name || "Unknown"
          }
        },
        // Data form yang baru
        data: {
            nama: formData.nama,
            kategori: formData.kategori,
            jumlah: formData.jumlah, // Sekarang Quantity
            harga: formData.harga,   // Sekarang Harga Rupiah
            struk: formData.struk,   // String Base64 Gambar
            keterangan: formData.keterangan,
            tanggal: tanggalFormatted // Dikirim juga di dalam objek data
        } 
      }
    };

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("n8n Error:", errorText);
      return { success: false, message: "Gagal mengirim ke n8n" };
    }

    return { success: true };
  } catch (error) {
    console.error("Server Action Error:", error);
    return { success: false, message: "Terjadi kesalahan server" };
  }
}