import { google } from 'googleapis';

// --- BU BÖLÜM AYNI KALIYOR ---
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});
const drive = google.drive({ version: 'v3', auth });
const FOLDER_ID = process.env.DRIVE_FOLDER_ID;
// --- BU BÖLÜM AYNI KALIYOR ---


export default async function handler(request, response) {
    // Sadece POST isteklerini kabul et
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // --- TEŞHİS İÇİN EKLENEN KOD BAŞLANGICI ---
    console.log("--- API Fonksiyonu Çağrıldı ---");

    const passwordFromUser = request.body.password;
    const passwordFromVercel = process.env.SITE_PASSWORD;

    console.log(`Kullanıcıdan gelen şifre: [${passwordFromUser}]`);
    console.log(`Vercel'den okunan şifre: [${passwordFromVercel}]`);

    if (passwordFromUser === passwordFromVercel) {
        console.log("ŞİFRE KONTROLÜ: Başarılı. Şifreler eşleşiyor.");
    } else {
        console.log("ŞİFRE KONTROLÜ: Başarısız! Şifreler eşleşmiyor.");
        console.log(`Kullanıcıdan gelen tip: ${typeof passwordFromUser}, Vercel'den gelen tip: ${typeof passwordFromVercel}`);
        return response.status(401).json({ error: 'Invalid password' });
    }
    // --- TEŞHİS İÇİN EKLENEN KOD SONU ---


    // Şifre kontrolü başarılı olduğu için kod buraya gelecek.
    try {
        console.log("Google Drive'dan dosyalar isteniyor...");
        const res = await drive.files.list({
            q: `'${FOLDER_ID}' in parents and trashed=false`,
            fields: 'files(id, name, webViewLink, modifiedTime)',
            orderBy: 'modifiedTime desc',
        });

        const files = res.data.files.map(file => ({
            name: file.name,
            url: file.webViewLink,
            modifiedTime: file.modifiedTime,
        }));
        
        console.log(`Başarıyla ${files.length} dosya bulundu.`);
        response.status(200).json(files);

    } catch (error) {
        console.error('!!! Google Drive API Hatası:', error.message);
        response.status(500).json({ error: 'Google Drive\'dan dosyalar alınamadı.' });
    }
}
