// /api/getFiles.js - Nihai Çözüm Versiyonu
import { google } from 'googleapis';

// Base64 formatındaki anahtarı alıp orijinal formatına geri çeviriyoruz.
const decodedPrivateKey = Buffer.from(process.env.GOOGLE_PRIVATE_KEY_BASE64, 'base64').toString('utf8');

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: decodedPrivateKey, // Artık çözülmüş (decode edilmiş) anahtarı kullanıyoruz.
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });
const FOLDER_ID = process.env.DRIVE_FOLDER_ID;
const CORRECT_PASSWORD = process.env.SITE_PASSWORD;

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { password } = request.body;

    if (password !== CORRECT_PASSWORD) {
        return response.status(401).json({ error: 'Invalid password' });
    }

    try {
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

        response.status(200).json(files);

    } catch (error) {
        console.error('Google Drive API Hatası:', error.message);
        response.status(500).json({ error: 'Google Drive\'dan dosyalar alınamadı.' });
    }
}
