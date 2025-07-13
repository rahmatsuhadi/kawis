export function formatRupiah(value: number | string | null | undefined, includeSymbol: boolean = true): string {
  // 1. Konversi ke angka
  const num = typeof value === 'string' ? parseFloat(value) : value;

  // 2. Tangani nilai null/undefined atau NaN
  if (num === null || num === undefined || isNaN(num)) {
    return 'FREE'; // Atau string lain sesuai preferensi Anda
  }

  // 3. Tangani kasus "Gratis" atau nol
  if (num === 0) {
    return 'FREE'; // Atau 'Rp0' jika Anda ingin nol tetap diformat sebagai angka
  }

  // 4. Gunakan Intl.NumberFormat untuk pemformatan mata uang
  // 'id-ID' adalah locale untuk Indonesia
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR', // Kode mata uang untuk Rupiah Indonesia
    minimumFractionDigits: 0, // Tidak ada digit di belakang koma untuk Rupiah
    maximumFractionDigits: 0, // Tidak ada digit di belakang koma
  });

  // Intl.NumberFormat akan menghasilkan "Rp10.000"
  let formatted = formatter.format(num);

  // Jika includeSymbol false, hapus "Rp"
  if (!includeSymbol) {
    formatted = formatted.replace('Rp', '').trim();
  }

  return formatted;
}