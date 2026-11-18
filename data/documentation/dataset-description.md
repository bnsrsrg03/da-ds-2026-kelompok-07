# Deskripsi Dataset: Epidemiologi dan Faktor Risiko Kasus Diare pada Balita (`dataset-sample.csv`)

## 1. Gambaran Umum & Konseptualisasi Domain

Dataset `dataset-sample.csv` menghimpun data rekam medis dan profil terkait insiden penyakit diare pada populasi balita (anak berusia di bawah 5 tahun). Diare tetap menjadi salah satu tantangan kesehatan masyarakat utama di Indonesia, yang berkontribusi signifikan terhadap angka kesakitan dan kematian anak apabila tidak ditangani secara cepat dan tepat.

Konsep utama di balik penyusunan dataset ini adalah pendekatan multifaktorial terhadap kejadian penyakit menular berbasis klinis dan lingkungan. Penyakit diare tidak hanya dipicu oleh agen infeksius, tetapi juga sangat dipengaruhi oleh determinan sosial kesehatan (*social determinants of health*), yang meliputi:

* **Faktor Lingkungan & Sanitasi:** Akses terhadap air bersih, pengelolaan limbah rumah tangga, dan kepemilikan jamban sehat di domisili pasien.
* **Faktor Perilaku & Gizi:** Praktik pemberian Air Susu Ibu (ASI) eksklusif, status gizi balita, dan kebiasaan cuci tangan.
* **Faktor Demografi & Klinis:** Sebaran wilayah tempat tinggal pasien di sekitar wilayah operasional rumah sakit, usia balita, serta tingkat keparahan gejala saat datang berobat.

### Tujuan dan Potensi Pemanfaatan

1. **Analisis Epidemiologi Klinis:** Mengidentifikasi pola kunjungan pasien balita penderita diare berdasarkan kelompok usia, tingkat dehidrasi, dan musim.
2. **Pemodelan Prediktif & Klasifikasi:** Mengembangkan algoritma *Machine Learning* (seperti *Logistic Regression*, *Decision Tree*, atau *Random Forest*) untuk memprediksi tingkat keparahan rawat inap atau durasi pemulihan balita.
3. **Dukungan Kebijakan Kesehatan Lokal:** Menyediakan wawasan berbasis data bagi Dinas Kesehatan setempat untuk perbaikan program preventif di wilayah sekitar Balige dan Kabupaten Toba.

## 2. Sumber Data & Metodologi Pengumpulan

* **Sumber Primer/Sekunder:** Data rekam medis sekunder yang dihimpun dari instalasi rawat jalan dan rawat inap anak di **Rumah Sakit Umum HKBP Balige**, Kabupaten Toba, Sumatera Utara.
* **Cakupan Geografis:** Wilayah pelayanan kesehatan RS U HKBP Balige dan sekitarnya.
* **Rentang Waktu:** Data historis multi-tahun (misalnya: periode 2021–2025).
* **Unit Observasi:** Setiap baris merepresentasikan catatan kunjungan/kasus klinis individu balita yang didiagnosis menderita diare.
* **Kerahasiaan & Etika:** Seluruh atribut pengenal personal (*Personally Identifiable Information* seperti nama lengkap, nomor rekam medis, atau alamat spesifik) telah dianonimkan demi menjaga privasi pasien sesuai dengan standar etika penelitian kesehatan.

## 3. Struktur Teknis Dataset

* **Nama File:** `dataset_diare_balita.csv`
* **Format:** *Comma-Separated Values* (CSV) dengan pemisah koma (`,`)
* **Karakter Encoding:** `UTF-8` tanpa BOM
* **Dimensi Perkiraan:** $\approx 5.000+$ baris observasi dan $12$ kolom variabel.

## 4. Kamus Data (*Data Dictionary*)

Tabel berikut merinci seluruh variabel yang termuat di dalam dataset:

| No | Nama Kolom | Tipe Data | Kategori / Rentang Nilai | Deskripsi Lengkap & Definisi Operasional | 
| ----- | ----- | ----- | ----- | ----- | 
| 1 | `id_observasi` | String / Alphanumeric | `ID-00001` s.d. `ID-N` | Kode identifikasi anonim unik untuk setiap baris data rekam medis. | 
| 2 | `tahun_pencatatan` | Integer | `2021`, `2022`, `2023`, `2024`, `2025` | Tahun saat kasus tercatat di RS U HKBP Balige. | 
| 3 | `bulan_pencatatan` | Integer | `1` s.d. `12` | Bulan kunjungan pasien (berguna untuk analisis tren musiman diare). | 
| 4 | `wilayah_kecamatan` | String | `Balige`, `Laguboti`, `Silaen`, `Porsea`, dll. | Nama wilayah kecamatan domisili pasien balita. | 
| 5 | `usia_balita_bulan` | Integer | `0` s.d. `59` | Usia anak dalam satuan bulan penuh saat mendapatkan perawatan. | 
| 6 | `jenis_kelamin` | Kategorikal (String) | `L` (Laki-laki), `P` (Perempuan) | Jenis kelamin biologis pasien balita. | 
| 7 | `status_gizi` | Kategorikal (String) | `Gizi Buruk`, `Gizi Kurang`, `Gizi Baik`, `Gizi Lebih` | Klasifikasi status gizi berdasarkan penilaian antropometri rumah sakit. | 
| 8 | `riwayat_asi_eksklusif` | Kategorikal (String) | `Ya`, `Tidak` | Riwayat pemberian ASI eksklusif selama 6 bulan pertama kehidupan berdasarkan anamnesis. | 
| 9 | `akses_air_bersih` | Kategorikal (String) | `Layak`, `Tidak Layak` | Sumber air minum utama rumah tangga pasien di rumah. | 
| 10 | `sanitasi_jamban` | Kategorikal (String) | `Sehat`, `Tidak Sehat` | Kepemilikan fasilitas pembuangan kotoran yang memenuhi syarat kesehatan. | 
| 11 | `frekuensi_diare_per_hari` | Integer | `0` s.d. `15+` | Jumlah BAB cair per hari saat pertama kali dibawa berobat ke rumah sakit. | 
| 12 | `status_kasus_diare` | Integer (Binary) | `0` (Diare Ringan/Rawat Jalan), `1` (Diare Berat/Rawat Inap) | **Variabel Target (Label):** Tingkat keparahan atau status penanganan klinis kasus diare. | 

## 5. Protokol Validasi, Pembersihan, dan Kualitas Data

Sebelum dataset digunakan untuk analisis lanjut atau pemodelan prediktif, disarankan untuk menjalankan tahapan tata kelola data berikut:

* **Penanganan *Missing Values*:**
  Periksa kolom numerik dan kategorikal dari nilai kosong (`NaN`). Kolom klinis atau demografi yang kosong dapat diimputasi menggunakan modus (*mode*) atau teknik *K-Nearest Neighbors (KNN) Imputation*.
* **Pendeteksian Outlier:**
  Verifikasi rentang nilai pada kolom `usia_balita_bulan` (pastikan berada di antara 0 hingga 59 bulan) serta `frekuensi_diare_per_hari`. Nilai di luar batas wajar harus ditinjau ulang atau dihapus sebagai *noise*.
* **Penanganan Imbalance Data:**
  Jika jumlah kasus berat (`status_kasus_diare = 1`) jauh lebih sedikit dibandingkan kasus ringan (`0`), terapkan teknik *oversampling* (seperti SMOTE) atau sesuaikan metrik evaluasi model.

## 6. Panduan Implementasi Cepat (Python Script)

Berikut adalah kerangka kode Python untuk melakukan inspeksi awal terhadap integritas dataset dari RS U HKBP Balige:

```python
import pandas as pd
import numpy as np

# 1. Memuat Dataset
df = pd.read_csv('dataset_diare_balita.csv')

# 2. Menampilkan Informasi Struktur dan Tipe Data
print("--- INFORMASI DATASET RS U HKBP BALIGE ---")
print(df.info())

# 3. Pengecekan Missing Values
print("\n--- JUMLAH MISSING VALUES ---")
print(df.isnull().sum())

# 4. Distribusi Variabel Target (Status Kasus)
print("\n--- DISTRIBUSI STATUS KASUS KLIINIK ---")
print(df['status_kasus_diare'].value_counts(normalize=True) * 100)
```
