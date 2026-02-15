# Cara Mengganti Logo KT dengan Icon Baru

## Langkah-langkah:

1. **Buka folder assets/images** di dalam project mobile app
   - Path: `mobile/assets/images/`

2. **Ganti file logo.png** dengan icon yang telah diupload
   - Hapus file `logo.png` yang ada (file placeholder)
   - Copy-paste icon baru ke folder tersebut
   - Pastikan nama file tetap `logo.png`

3. **Format yang direkomendasikan:**
   - Format: PNG dengan background transparan
   - Ukuran: minimal 128x128 pixel
   - Ratio: persegi (1:1)

## Lokasi Logo yang telah diganti:

1. **LoginPage** - Logo di tengah atas form login
2. **RegisterPage** - Logo di tengah atas form register  
3. **HomePage** - Logo di header (2 tempat):
   - Header halaman profil
   - Header halaman utama

## Catatan:
- Logo akan otomatis menyesuaikan ukuran sesuai komponen
- Component Logo sudah dibuat di `src/components/ui/Logo.tsx`
- Semua referensi "KT" text telah diganti dengan component Logo
