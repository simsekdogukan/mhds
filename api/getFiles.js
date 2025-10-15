export default function handler(request, response) {
    // Sadece POST isteklerini kabul et
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // Doğru şifre burada SAKLI
    const correctPassword = '0000';

    // Gelen istekten şifre ve klasör adını al
    const { password, folder } = request.body;

    // Şifreyi kontrol et
    if (password !== correctPassword) {
        // Şifre yanlışsa, yetkisiz hatası ver
        return response.status(401).json({ error: 'Invalid password' });
    }

    // Klasör içerikleri
    const content = {
        forms: Array.from({ length: 10 }, (_, i) => ({ name: `Form ${i + 1}`, url: "#" })),
        dosyalar: Array.from({ length: 10 }, (_, i) => ({ name: `Dosya ${i + 1}`, url: "#" })),
        tablolar: Array.from({ length: 10 }, (_, i) => ({ name: `Tablo ${i + 1}`, url: "#" }))
    };

    // İstenen klasörün içeriğini bul
    const files = content[folder];

    // Eğer istenen klasör varsa içeriğini, yoksa boş bir dizi gönder
    if (files) {
        response.status(200).json(files);
    } else {
        response.status(200).json([]); // Boş veya tanımsız klasörler için
    }
}
