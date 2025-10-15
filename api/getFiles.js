export default function handler(request, response) {
    // Sadece POST isteklerini kabul et
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // Doğru şifre burada SAKLI
    const correctPassword = '0000';
    
    // Google Drive linkleri burada GÜVENDE
    const files = [
        { name: "E-Sım kodları", url: "https://drive.google.com/file/d/1yuka5wfkXNW_d5VDPh27rcHycW5SYT14/view?usp=sharing" },
        { name: "SolPro - Mayatech Bilgisayar Listesi", url: "https://docs.google.com/spreadsheets/d/1T4Myfgx8dBiG2WhJO4kf_YGTtO4t5kbp/edit?usp=drive_link&ouid=114707366481331827050&rtpof=true&sd=true" }
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
