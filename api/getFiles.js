export default function handler(request, response) {
    // --- GÜVENLİK ALANI ---
    // 1. Parolanızı buraya yazın.
    const CORRECT_PASSWORD = '1234';

    // 2. Google Drive dosyalarınızın DÜZENLEME linklerini buraya ekleyin.
    const driveFiles = [
        { 
            name: "E-Sım kodları", 
            url: "https://drive.google.com/file/d/1yuka5wfkXNW_d5VDPh27rcHycW5SYT14/edit?usp=sharing" // 'view' yerine 'edit'
        },
        { 
            name: "SolPro - Mayatech Bilgisayar Listesi", 
            url: "https://docs.google.com/spreadsheets/d/1T4Myfgx8dBiG2WhJO4kf_YGTtO4t5kbp/edit?usp=drive_link" // Zaten düzenleme linki
        }
        // Yeni dosyaları buraya ekleyin: { name: "Dosya Adı", url: "Düzenleme Linki" }
    ];
    // --- GÜVENLİK ALANI SONU ---


    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Method Not Allowed' });
    }

    const { password } = request.body;

    if (password === CORRECT_PASSWORD) {
        // Şifre doğruysa, dosya listesini gönder.
        response.status(200).json(driveFiles);
    } else {
        // Şifre yanlışsa, "Yetkisiz" hatası ver.
        response.status(401).json({ message: 'Unauthorized' });
    }
}
