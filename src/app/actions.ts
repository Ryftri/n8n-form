'use server'

import { generateN8nToken } from '@/lib/n8n-auth'; // Pastikan file ini sudah ada dari langkah sebelumnya

// URL Webhook n8n yang baru kamu berikan
const N8N_WEBHOOK_URL = "https://n8n.frienddev.tech/webhook-test/a0b4587c-0876-44c3-bad3-f5c752aace10";

export async function submitExpense(formData: any, telegramUser: any) {
  try {
    // 1. Generate Token Aman (RS256) di Server
    const token = await generateN8nToken();

    // 2. Siapkan Payload agar strukturnya SAMA PERSIS dengan kode HTML lama kamu
    // Ini penting agar workflow n8n tidak error saat parsing JSON
    const payload = {
      update_id: Date.now(),
      callback_query: {
        id: "webapp_" + Date.now(),
        from: telegramUser || { id: 0, first_name: "Anonymous (Browser)" }, // Fallback jika dibuka di browser
        message: {
          message_id: 0,
          date: Math.floor(Date.now() / 1000),
          chat: {
            id: telegramUser?.id || 0,
            type: "private",
            first_name: telegramUser?.first_name || "Unknown"
          }
        },
        data: formData // Data form (item, category, dll)
      }
    };

    // 3. Kirim ke n8n (Server to Server)
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Header Auth JWT
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