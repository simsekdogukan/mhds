export default function handler(request, response) {
    // Sadece POST isteklerini kabul et
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // Doğru şifre burada SAKLI
    const correctPassword = '0000';
    
    // Google Drive linkleri burada GÜVENDE
    const files = [
        { name: "Deneme 1", url: "#" },
        { name: "Deneme 2", url: "#" },
        { name: "Deneme 3", url: "#" },
        { name: "Deneme 4", url: "#" },
        { name: "Deneme 5", url: "#" },
        { name: "Deneme 6", url: "#" },
        { name: "Deneme 7", url: "#" },
        { name: "Deneme 8", url: "#" },
        { name: "Deneme 9", url: "#" },
        { name: "Deneme 10", url: "#" }
    ];

    // Gelen şifreyi al
    const { password } = request.body;

    // Şifreyi kontrol et
    if (password === correctPassword) {
        // Şifre doğruysa, dosya listesini gönder
        response.status(200).json(files);
    } else {
        // Şifre yanlışsa, yetkisiz hatası ver
        response.status(401).json({ error: 'Invalid password' });
    }
}
