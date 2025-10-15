// /api/getFiles.js - Nihai, Garantili Base64 Çözümü
import { google } from 'googleapis';

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // Şifreyi doğrudan koddan kontrol edelim
    const CORRECT_PASSWORD = '3333';
    const { password } = request.body;

    if (password !== CORRECT_PASSWORD) {
        return response.status(401).json({ error: 'Invalid password' });
    }

    try {
        // Vercel'den Base64 formatındaki kimlik bilgisini al
        const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
        // Bu bilgiyi çözerek (decode) orijinal JSON metnine dönüştür
        const credentialsJsonString = Buffer.from(credentialsBase64, 'base64').toString('utf8');
        // JSON metnini ayrıştırarak (parse) kullanılabilir bir nesneye çevir
        const credentials = JSON.parse(credentialsJsonString);

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: credentials.client_email,
                private_key: credentials.private_key, // Anahtarı artık doğrudan ve hatasız bir şekilde buradan alıyoruz.
            },
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });

        const drive = google.drive({ version: 'v3', auth });
        const FOLDER_ID = process.env.DRIVE_FOLDER_ID;

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
        response.status(500).json({ error: 'Google Drive API hatası. Lütfen yönetici ile iletişime geçin.' });
    }
}
