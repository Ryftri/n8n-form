'use server'

import { generateN8nToken } from '@/lib/n8n-auth';

// URL Webhook n8n Anda
const N8N_WEBHOOK_URL = "https://n8n.frienddev.tech/webhook/a0b4587c-0876-44c3-bad3-f5c752aace10";

// Fungsi helper untuk format tanggal Indonesia
function getFormattedDateWIB() {
  // Ambil waktu saat ini, konversi ke zona waktu Jakarta
  const now = new Date();
  const jakartaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  
  const hari = days[jakartaTime.getDay()];
  const tanggal = jakartaTime.getDate(); // 1 digit (tidak pakai padStart)
  const bulan = String(jakartaTime.getMonth() + 1).padStart(2, '0'); // 2 digit
  const tahun = jakartaTime.getFullYear(); // Full digit

  // Format: Hari, [tanggal 1 digit]-[bulan angka 2 digit]-[tahun lengkap]
  return `${hari}, ${tanggal}-${bulan}-${tahun}`;
}

export async function submitExpense(formData: any, telegramUser: any, initDataUnsafe: any) {
  try {
    const token = await generateN8nToken();
    
    // Generate tanggal format khusus
    const tanggalFormatted = getFormattedDateWIB();

    const payload = {
      update_id: Date.now(),
      initDataUnsafe,
      // Menambahkan field tanggal khusus di root payload atau di dalam data, 
      // di sini saya masukkan ke body utama agar mudah diakses n8n
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
            ...formData,
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
    return { success: false, message: error };
  }
}