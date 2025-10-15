// /api/getFiles.js - Google Apps Script Metodu (Garantili Son Versiyon)

export default async function handler(request, response) {
    // Sadece POST isteklerini kabul et
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // Şifreyi doğrudan buradan kontrol ediyoruz, Vercel değişkeni sorununu tamamen aşıyoruz.
    const CORRECT_PASSWORD = '3333';
    const { password } = request.body;

    if (password !== CORRECT_PASSWORD) {
        return response.status(401).json({ error: 'Invalid password' });
    }

    try {
        // Vercel'e eklediğimiz Google Apps Script linkini al
        const appsScriptUrl = process.env.APPS_SCRIPT_URL;
        
        // Bu linke gidip dosya listesini al
        const res = await fetch(appsScriptUrl);
        if (!res.ok) {
            // Eğer link çalışmazsa, daha net bir hata verelim
            throw new Error(`Google Apps Script linki çalışmıyor veya yanıt vermiyor. Durum: ${res.status}`);
        }
        
        const files = await res.json();
        
        // Gelen dosyaları kullanıcıya gönder
        response.status(200).json(files);

    } catch (error) {
        console.error('API Hatası:', error.message);
        response.status(500).json({ error: 'Dosyalar alınamadı. Google Apps Script linkini kontrol edin.' });
    }
}
