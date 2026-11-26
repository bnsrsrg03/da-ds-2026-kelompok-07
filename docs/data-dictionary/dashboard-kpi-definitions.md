# Definisi KPI Dashboard Overview

## Status dan ruang lingkup

Dokumen ini menetapkan definisi awal KPI Dashboard Overview agar perhitungan pada frontend konsisten dan dapat ditelusuri. Definisi ini tidak mengubah atau menjalankan pipeline ETL maupun model klasifikasi.

Workbook `dataset_diare_balita.xlsx` yang disediakan tim ditetapkan sebagai sumber data acuan. Dashboard saat ini membaca CSV di `frontend/public/diare_balita_toba_raw.csv`; sebelum implementasi KPI, header dan isi CSV tersebut harus dicocokkan dengan workbook dan disinkronkan.

## Aturan umum

- Satu baris mewakili satu catatan pengukuran, bukan satu balita unik.
- `id_balita` diperlakukan sebagai identifier teks. ID yang berulang dapat menunjukkan pengukuran berbeda dan tidak otomatis dianggap duplikat.
- Duplikat yang dikecualikan adalah baris yang seluruh nilainya sama. Aturan kunci komposit lain belum ditetapkan.
- Kolom inti untuk mengidentifikasi catatan adalah `id_balita`, `tanggal_pengukuran`, dan `kecamatan`. Nilai yang tersedia harus memenuhi aturan format dan domain yang telah disetujui.
- Untuk KPI total catatan valid, ketiga kolom inti tersebut harus terisi dan dapat dikenali. Catatan yang kehilangan nilai pada kolom non-inti tetap dapat dihitung sebagai valid, tetapi kekurangannya tercermin pada KPI kelengkapan data.
- Nilai outlier ditandai untuk pemeriksaan; outlier tidak otomatis dihapus atau dianggap tidak valid.
- Catatan dengan status diare kosong atau tidak dikenal tidak masuk perhitungan proporsi diare. Catatan tersebut masih dapat digunakan untuk KPI lain jika memenuhi aturan validitas lainnya.
- Nilai kosong dihitung sebagai missing. Nilai hanya diperlakukan sebagai tidak berlaku (N/A) apabila aturan data yang terdokumentasi menyatakan kolom tersebut memang tidak berlaku pada catatan itu.
- Tidak ada target atau ambang baik/buruk yang ditetapkan. KPI disajikan sebagai ukuran deskriptif.

## Definisi KPI

| KPI | Definisi dan rumus | Kolom utama | Catatan |
|---|---|---|---|
| Total catatan valid | Jumlah catatan setelah mengecualikan baris duplikat penuh dan catatan yang gagal aturan validitas yang telah disetujui. | `id_balita`, `tanggal_pengukuran`, `kecamatan`, serta kolom dengan aturan domain yang disetujui | Catatan tidak otomatis gugur hanya karena satu kolom non-inti kosong. Batas nilai/domain yang belum disetujui tidak boleh ditebak saat implementasi. |
| Proporsi status diare | Jumlah catatan berstatus `Ya` dibagi jumlah catatan valid dengan status `Ya` atau `Tidak`, dikali 100%. | `gejala_diare_14_hari_terakhir` | Tampilkan jumlah `Ya` dan penyebut yang diketahui bersama persentase. Status kosong/tidak dikenal tidak dianggap `Tidak`. Filter status tidak diterapkan ke metrik proporsi, distribusi, tren, dan insight status diare agar hasil tidak otomatis menjadi 0% atau 100%; filter lain yang relevan tetap berlaku. |
| Kelengkapan data | Jumlah sel terisi dan berlaku dibagi jumlah sel yang seharusnya berlaku, dikali 100%. | Semua kolom pada workbook final | Dihitung pada seluruh baris sumber sebelum filter dashboard dan sebelum catatan tidak valid dikeluarkan. Sel N/A hanya dikecualikan jika aturan applicability-nya terdokumentasi. |
| Cakupan wilayah | Jumlah kecamatan berbeda yang memiliki catatan valid dibagi 16 kecamatan di Kabupaten Toba, dikali 100%. | `kecamatan` | Tampilkan juga jumlahnya, misalnya `x/16 kecamatan`. Filter kecamatan yang dipilih tidak mengubah KPI ini; filter relevan lainnya mengikuti cakupan data terpilih. |
| Balita unik | Jumlah nilai `id_balita` berbeda dan tidak kosong pada catatan valid yang sesuai filter. | `id_balita` | Pengukuran berulang untuk ID yang sama dihitung satu balita. |

## Filter Dashboard

- Periode menggunakan `tanggal_pengukuran`.
- Kecamatan menggunakan `kecamatan`.
- Kelompok umur menggunakan `usia_balita_bulan` dengan kelompok: `<6`, `6–11`, `12–23`, `24–35`, `36–47`, dan `48–59` bulan.
- Jenis kelamin menggunakan `jenis_kelamin`.
- Status diare menggunakan `gejala_diare_14_hari_terakhir`.
- Filter diterapkan pada KPI dan visualisasi yang relevan. Filter status menyaring catatan, tabel, dan metrik umum, tetapi tidak mengubah metrik/visualisasi proporsi dan tren status diare. Kelengkapan dihitung untuk seluruh sumber data dan tidak berubah oleh filter. Cakupan wilayah mengabaikan pilihan kecamatan tunggal agar tetap menunjukkan cakupan wilayah dataset.

## Acuan cakupan wilayah

Denominator sementara adalah 16 kecamatan Kabupaten Toba:

Ajibata, Balige, Bonatua Lunasi, Borbor, Habinsaran, Laguboti, Lumban Julu, Nassau, Parmaksian, Pintu Pohan Meranti, Porsea, Siantar Narumonda, Sigumpar, Silaen, Tampahan, dan Uluan.

Referensi jumlah kecamatan:

- [BPS Provinsi Sumatera Utara — Jumlah Kecamatan Menurut Kabupaten/Kota, 2025](https://sumut.bps.go.id/id/statistics-table/3/S3pkSVdHdG1iVU50TXlzdlNYY3pZVzFVV1haVlFUMDkjMyMxMjAw/jumlah-kecamatan-menurut-kabupaten-kota-di-provinsi-sumatera-utara.html?year=2025)
- [BPS Kabupaten Toba — tabel statistik wilayah menurut kecamatan](https://tobakab.bps.go.id/id/statistics-table/1/NDI4IzE=/geographical-location-of-sub-district-in-toba-regency--2020.html)

## Hal yang harus diverifikasi sebelum implementasi

- Cocokkan seluruh header workbook final dengan CSV yang dibaca Dashboard.
- Konfirmasi aturan domain dan nilai yang membuat catatan tidak valid dengan pemilik data/data dictionary. Jangan menyimpulkan batas klinis atau menghapus outlier tanpa acuan.
- Dokumentasikan kolom dan kondisi yang memang dapat bernilai N/A. Sebelum ada aturan tersebut, nilai kosong tetap dihitung missing.
- Pastikan daftar kecamatan dan jumlah 16 masih sesuai dengan referensi administratif yang dipakai tim.
