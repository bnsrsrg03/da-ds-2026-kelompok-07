# Deskripsi Dataset: Karakteristik dan Faktor Risiko Kasus Diare pada Balita (`Data_Diare_500_Balita.xlsx`)

## 1. Gambaran Umum & Konseptualisasi Domain

Dataset ini berisi rekam medis dan profil klinis dari **500 pasien balita** (anak berusia di bawah 5 tahun) yang didiagnosis menderita penyakit diare. Data ini dihimpun langsung dari layanan kesehatan di **Rumah Sakit Umum HKBP Balige**, Kabupaten Toba, Sumatera Utara.

Penyakit diare pada balita merupakan isu kesehatan publik yang kompleks. Konsep utama penyusunan dataset ini adalah untuk memetakan keterkaitan antara determinan klinis, status gizi, faktor lingkungan (seperti akses air bersih dan sanitasi), serta praktik pengasuhan terhadap tingkat keparahan atau status kasus diare pada anak.

### Arsitektur Dataset yang Dinamis dan Fleksibel

Dataset ini dirancang secara **dinamis dan adaptif**. Artinya, struktur data tidak bersifat kaku dan dapat diperluas atau disesuaikan sewaktu-waktu:
* **Penambahan Kolom Baru:** Pengguna atau pengelola data dapat menambahkan variabel atau fitur baru (misalnya riwayat imunisasi campak, penggunaan antibiotik sebelumnya, atau jenis patogen hasil laboratorium) sesuai dengan kebutuhan analisis klinis atau penelitian lanjutan tanpa merusak integritas data yang sudah ada.
* **Skalabilitas Baris:** Jumlah sampel dapat terus bertambah secara berkala seiring masuknya data kunjungan pasien baru ke RS U HKBP Balige.

### Potensi Pemanfaatan Analisis

1. **Analisis Epidemiologi Deskriptif:** Mengetahui profil demografi (usia, jenis kelamin), sebaran wilayah asal pasien di sekitar Balige, serta distribusi tingkat keparahan diare.

2. **Pemodelan Prediktif (*Machine Learning*):** Mengembangkan model klasifikasi untuk memprediksi tingkat keparahan kasus (misalnya rawat inap vs rawat jalan) berdasarkan variabel fitur yang tersedia dan variabel tambahan di masa depan.

3. **Evaluasi Kebijakan Kesehatan Preventif:** Memberikan landasan data bagi fasilitas kesehatan atau instansi terkait dalam merancang edukasi pencegahan diare berbasis keluarga.

## 2. Sumber Data & Metodologi

* **Sumber Data:** Data rekam medis sekunder dari instalasi anak di **Rumah Sakit Umum HKBP Balige**, Kabupaten Toba, Sumatera Utara.

* **Jumlah Sampel (**$N$**):** 500+ observasi data balita (dapat diperluas secara dinamis).

* **Format Asli:** Berkas lembar kerja Excel (`Data_Diare_500_Balita.xlsx`).

* **Kerahasiaan Pasien:** Seluruh data pengenal pribadi (*Personally Identifiable Information*) telah dianonimkan untuk menjaga privasi pasien sesuai dengan standar etik medis.

## 3. Kamus Data (*Data Dictionary*)

Tabel berikut mencakup kolom inti yang saat ini tersedia. Karena sifatnya yang dinamis, kolom baru dapat ditambahkan ke dalam file Excel sesuai kebutuhan:

| No | Nama Variabel | Tipe Data | Kategori / Rentang Nilai | Deskripsi Operasional | 
| ----- | ----- | ----- | ----- | ----- | 
| 1 | `id_pasien` / `ID` | String / Alphanumeric | `P-001` s.d. `P-500` | Nomor identifikasi unik anonim untuk setiap pasien balita. | 
| 2 | `usia_bulan` | Integer | `0` – `59` | Usia anak dalam satuan bulan penuh. | 
| 3 | `jenis_kelamin` | Kategorikal | `L` (Laki-laki), `P` (Perempuan) | Jenis kelamin biologis pasien balita. | 
| 4 | `kecamatan` | String | `Balige`, `Laguboti`, `Silaen`, dll. | Wilayah domisili kecamatan pasien di sekitar Kabupaten Toba. | 
| 5 | `status_gizi` | Kategorikal | `Gizi Buruk`, `Gizi Kurang`, `Gizi Baik` | Penilaian status gizi berdasarkan standar antropometri anak. | 
| 6 | `riwayat_asi_eksklusif` | Kategorikal | `Ya`, `Tidak` | Riwayat pemberian ASI eksklusif selama 6 bulan pertama kehidupan. | 
| 7 | `akses_air_bersih` | Kategorikal | `Layak`, `Tidak Layak` | Kualitas sumber air minum utama yang digunakan rumah tangga. | 
| 8 | `sanitasi_lingkungan` | Kategorikal | `Sehat`, `Tidak Sehat` | Kepemilikan dan kondisi fasilitas jamban keluarga. | 
| 9 | `frekuensi_diare_harian` | Integer | `1` – `15+` | Jumlah frekuensi buang air besar (BAB) cair per hari saat masuk rumah sakit. | 
| 10 | `status_kasus` | Kategorikal / Biner | `Ringan`, `Berat` (atau `0`, `1`) | **Variabel Target:** Tingkat keparahan klinis atau keputusan penanganan medis (rawat jalan vs rawat inap). | 
| * | *Kolom Tambahan* | *Dinamis* | *Menyesuaikan* | *Tempat untuk menambahkan variabel baru (misal: `suhu_tubuh`, `durasi_gejala_hari`, dll).* | 

## 4. Panduan Validasi dan Penggunaan Data (Python)

Untuk memuat dan memeriksa kualitas data dinamis ini menggunakan Python, Anda dapat menggunakan cuplikan kode berikut yang secara otomatis mendeteksi kolom yang tersedia:

```python
import pandas as pd

# Memuat file Excel
df = pd.read_excel('Data_Diare_500_Balita.xlsx')

# Menampilkan daftar seluruh kolom yang aktif saat ini (mendukung kolom dinamis)
print("--- DAFTAR KOLOM AKTIF ---")
print(df.columns.tolist())

# Menampilkan 5 baris pertama data
print("\n--- 5 DATA TERATAS ---")
print(df.head())

# Menampilkan informasi ringkas struktur data
print("\n--- INFORMASI DATASET ---")
print(df.info())
```

## 5. Riwayat Dokumen

* **Versi:** 1.1 (Februari 2026)
* **Pembaruan:** Penambahan spesifikasi arsitektur dataset yang dinamis dan fleksibel untuk penambahan kolom serta baris data baru dari RS U HKBP Balige.