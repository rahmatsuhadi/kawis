// lib/image-service.ts
import { supabase } from '@/lib/supabase'; // Pastikan Anda sudah punya file ini
import { toast } from 'sonner'; // Untuk notifikasi

const SUPABASE_BUCKET_NAME = 'kawis-kita'; // Ganti dengan nama bucket Supabase Anda

/**
 * Mengunggah file gambar ke Supabase Storage.
 * @param file Objek File yang akan diunggah.
 * @returns Promise yang mengembalikan URL publik gambar atau melempar Error.
 */
export async function uploadImage(file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`; // Nama file unik
  const filePath = `${fileName}`; // Path di bucket (misal: "nama-file.jpg")

  try {
    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600', // Cache selama 1 jam
        upsert: false, // Jangan timpa jika nama file sama
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Gagal mengunggah gambar: ${error.message}`);
    }

    // Dapatkan URL publik dari gambar yang diunggah
    const { data: publicUrlData } = supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .getPublicUrl(data.path);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('Tidak dapat mendapatkan URL publik gambar.');
    }

    return publicUrlData.publicUrl;
  } catch (error: any) {
    throw new Error(error.message || 'Terjadi kesalahan tidak diketahui saat mengunggah gambar.');
  }
}

/**
 * Menghapus gambar dari Supabase Storage.
 *
 * Catatan Penting: Menghapus dari frontend dengan public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
 * biasanya TIDAK direkomendasikan untuk produksi karena masalah keamanan (siapapun bisa menghapus).
 * Lebih baik buat API Route di Next.js (backend) yang memanggil fungsi ini
 * dengan Service Role Key Supabase Anda.
 *
 * @param imageUrl URL publik gambar yang akan dihapus.
 * @returns Promise yang resolve jika berhasil atau reject jika gagal.
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  // Ekstrak path file dari URL publik
  // Contoh URL: https://<project-id>.supabase.co/storage/v1/object/public/event-images/nama-gambar.jpg
  // Path yang dibutuhkan: event-images/nama-gambar.jpg
  const urlParts = imageUrl.split(SUPABASE_BUCKET_NAME + '/');
  if (urlParts.length < 2) {
    throw new Error('URL gambar tidak valid untuk penghapusan.');
  }
  const filePathInBucket = urlParts[1]; // Ini adalah 'nama-gambar.jpg' atau 'folder/nama-gambar.jpg'

  try {
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .remove([filePathInBucket]); // Menerima array path file

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Gagal menghapus gambar: ${error.message}`);
    }

    console.log(`Gambar ${filePathInBucket} berhasil dihapus dari storage.`);
  } catch (error: any) {
    throw new Error(error.message || 'Terjadi kesalahan tidak diketahui saat menghapus gambar.');
  }
}