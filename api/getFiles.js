// /api/getFiles.js - Teşhis (Debug) Versiyonu

import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});
const drive = google.drive({ version: 'v3', auth });
const FOLDER_ID = process.env.DRIVE_FOLDER_ID;

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // --- TEŞHİS İÇİN EKLENEN KOD BAŞLANGICI ---
    console.log("--- API Fonksiyonu Çağrıldı (Teşhis Modu) ---");

    const passwordFromUser = request.body.password;
    const passwordFromVercel = process.env.SITE_PASSWORD;

    // Loglara hem gelen şifreyi hem de Vercel'deki değişkeni yazdırıyoruz.
    // Köşeli parantezler, olası boşlukları görmemize yardımcı olacak.
    console.log(`Kullanıcıdan gelen şifre: [${passwordFromUser}]`);
    console.log(`Vercel'den okunan şifre: [${passwordFromVercel}]`);

    // Şifre kontrolü
    if (passwordFromUser === passwordFromVercel) {
        console.log("ŞİFRE KONTROLÜ: Başarılı. Şifreler eşleşiyor.");
    } else {
        console.log("!!! ŞİFRE KONTROLÜ: BAŞARISIZ! Şifreler eşleşmiyor.");
        // Eğer şifre undefined ise, değişkenin hiç gelmediğini anlarız.
        if (passwordFromVercel === undefined) {
            console.log("HATA: 'SITE_PASSWORD' çevre değişkeni bulunamadı (undefined).");
        }
        return response.status(401).json({ error: 'Invalid password' });
    }
    // --- TEŞHİS İÇİN EKLENEN KOD SONU ---

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
