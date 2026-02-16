import { SignJWT, importPKCS8 } from 'jose';

export async function generateN8nToken() {
  // 1. Ambil private key dari environment variable
  const pkcs8 = process.env.N8N_PRIVATE_KEY;
  
  if (!pkcs8) {
    throw new Error('N8N_PRIVATE_KEY belum disetting di .env');
  }

  // 2. Import Private Key agar bisa dipakai algoritma RS256
  const privateKey = await importPKCS8(pkcs8, 'RS256');

  // 3. Buat Payload (Isi data, opsional)
  // Kamu bisa menaruh data user di sini jika perlu
  const payload = { 
    source: 'nextjs-form', 
    timestamp: Date.now() 
  };

  // 4. Sign Token
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256' }) // Algoritma harus sama dengan n8n
    .setIssuedAt()
    .setExpirationTime('1m') // Token hanya valid selama 1 menit (keamanan ekstra)
    .sign(privateKey);

  return token;
}