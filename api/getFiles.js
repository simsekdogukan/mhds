import { google } from 'googleapis';

// Vercel'deki Ortam Değişkenlerinden kimlik bilgilerini alarak
// Google API'si için bir kimlik doğrulama istemcisi oluşturuyoruz.
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        // Ortam değişkenlerindeki private key'de bulunan '\n' karakterlerini
        // gerçek satır sonu karakterlerine dönüştürüyoruz. Bu kritik bir adımdır.
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    // Sadece dosyaları okuma yetkisi istiyoruz, daha fazlasına gerek yok.
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

// Kimliği doğrulanmış Google Drive istemcisini oluşturuyoruz.
const drive = google.drive({ version: 'v3', auth });

// Ortam değişkenlerinden Klasör ID'sini ve şifreyi güvenli bir şekilde alıyoruz.
const FOLDER_ID = process.env.DRIVE_FOLDER_ID;
const CORRECT_PASSWORD = process.env.SITE_PASSWORD;

// Bu ana fonksiyon her istekte çalışır.
// `async` olarak işaretlendi çünkü içinde `await` ile API çağrısı bekleyeceğiz.
export default async function handler(request, response) {
    // Sadece POST isteklerini kabul et
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // İstekle gelen şifreyi al
    const { password } = request.body;

    // Şifreyi kontrol et
    if (password !== CORRECT_PASSWORD) {
        return response.status(401).json({ error: 'Invalid password' });
    }

    // API çağrıları hata verebileceği için try...catch bloğu kullanıyoruz.
    try {
        // Belirtilen klasördeki dosyaları listelemek için API'yi çağırıyoruz.
        const res = await drive.files.list({
            // Sorgu: Belirtilen klasörün içinde olan (parents) ve çöp kutusunda olmayan (trashed=false) dosyaları getir.
            q: `'${FOLDER_ID}' in parents and trashed=false`,
            // API'den sadece ihtiyacımız olan alanları isteyelim: id, isim, web görüntüleme linki ve son değiştirilme tarihi.
            fields: 'files(id, name, webViewLink, modifiedTime)',
            // Son değiştirilen en üstte olacak şekilde sırala.
            orderBy: 'modifiedTime desc',
        });

        // Gelen veriyi, frontend'in anlayacağı daha basit bir formata dönüştürüyoruz.
        const files = res.data.files.map(file => ({
            name: file.name,
            url: file.webViewLink, // Görüntüleme linki
            modifiedTime: file.modifiedTime,
        }));

        // Başarılı olursa dosya listesini JSON olarak gönderiyoruz.
        response.status(200).json(files);

    } catch (error) {
        // Hata olursa, hatayı Vercel'in loglarına yazdırıyoruz (sorun giderme için önemli).
        console.error('Google Drive API Hatası:', error);
        // Kullanıcıya genel bir sunucu hatası mesajı döndürüyoruz.
        response.status(500).json({ error: 'Google Drive\'dan dosyalar alınamadı.' });
    }
}
