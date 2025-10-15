// /api/getFiles.js - Son ve En Sağlam Versiyon

export default async function handler(request, response) {
    // Sadece POST isteklerini kabul et
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const CORRECT_PASSWORD = '3333';
    const { password } = request.body;

    if (password !== CORRECT_PASSWORD) {
        return response.status(401).json({ error: 'Invalid password' });
    }

    try {
        const appsScriptUrl = process.env.APPS_SCRIPT_URL;

        // URL'in Vercel'den okunup okunmadığını kontrol edelim
        if (!appsScriptUrl) {
            console.error("KRİTİK HATA: APPS_SCRIPT_URL çevre değişkeni bulunamadı veya boş!");
            throw new Error("Sunucu yapılandırma hatası: Apps Script URL'si eksik.");
        }

        // Google Apps Script'ten dosya listesini al
        const res = await fetch(appsScriptUrl);

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Google Apps Script yanıtı başarısız: ${res.status}`, errorText);
            throw new Error(`Google Apps Script'ten veri alınamadı.`);
        }

        const files = await res.json();

        // Başarı durumunu loglayalım
        console.log(`${files.length} adet dosya başarıyla alındı ve gönderildi.`);
        response.status(200).json(files);

    } catch (error) {
        console.error('--- API İÇİNDE HATA YAKALANDI ---');
        console.error('Hata Mesajı:', error.message);
        response.status(500).json({ error: 'Sunucu tarafında bir hata oluştu. Lütfen yönetici ile iletişime geçin.' });
    }
}
