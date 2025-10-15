// /api/getFiles.js - Dosyadan Okuyan Son Versiyon
import { google } from 'googleapis';
import path from 'path';
import { promises as fs } from 'fs';

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // Şifre ve Klasör ID'sini doğrudan buraya yazarak Vercel sorunlarını aşıyoruz.
    const CORRECT_PASSWORD = '3333';
    const FOLDER_ID = '1Qatn3jYJznm8-4G6DVBraeN-Off_b1t2a';
    
    const { password } = request.body;

    if (password !== CORRECT_PASSWORD) {
        return response.status(401).json({ error: 'Invalid password' });
    }

    try {
        // credentials.json dosyasını doğrudan api klasörünün içinden oku
        const credentialsPath = path.join(process.cwd(), 'api', 'credentials.json');
        const content = await fs.readFile(credentialsPath, 'utf8');
        const credentials = JSON.parse(content);

        // Kimlik doğrulama
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });

        const drive = google.drive({ version: 'v3', auth });

        // Dosyaları listele
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
        console.error('--- KRİTİK HATA ---');
        console.error('Hata Mesajı:', error.message);
        response.status(500).json({ error: 'Dosyalar alınamadı. Lütfen yönetici ile iletişime geçin.' });
    }
}
