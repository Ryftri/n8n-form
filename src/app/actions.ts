'use server'

import { generateN8nToken } from '@/lib/n8n-auth';

// URL Webhook Baru
const N8N_WEBHOOK_URL = "https://n8n.frienddev.tech/webhook-test/a0b4587c-0876-44c3-bad3-f5c752aace10";

export async function submitExpense(formData: any, telegramUser: any) {
  try {
    // 1. Generate Token Aman
    const token = await generateN8nToken();

    // 2. Siapkan Payload (Struktur SAMA PERSIS dengan contoh vanilla JS Anda)
    // agar n8n workflow tidak perlu diubah strukturnya.
    const now = Math.floor(Date.now() / 1000);
    
    const payload = {
        "update_id": Date.now(),
        "callback_query": {
            "id": "webapp_" + Date.now(),
            "initData": telegramUser?.initDataUnsafe || {}, // Data mentah jika ada
            "from": {
                "id": telegramUser?.id || 0,
                "user_lek": telegramUser || null,
                "is_bot": false,
                "first_name": telegramUser?.first_name || "Unknown",
                "last_name": telegramUser?.last_name || "",
                "username": telegramUser?.username || "Unknown",
                "language_code": telegramUser?.language_code || "en"
            },
            "message": {
                "message_id": 0,
                "date": now,
                "chat": {
                    "id": telegramUser?.id || 0,
                    "type": "private",
                    "first_name": telegramUser?.first_name || "Unknown"
                }
            },
            // Data form dimasukkan ke sini
            "data": {
                action: "lapor_pengeluaran",
                ...formData
            }
        }
    };

    // 3. Kirim ke n8n
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Token JWT
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("n8n Error Status:", response.status);
      return { success: false, message: "Gagal mengirim ke n8n" };
    }

    return { success: true };

  } catch (error) {
    console.error("Server Action Error:", error);
    return { success: false, message: "Terjadi kesalahan server" };
  }
}