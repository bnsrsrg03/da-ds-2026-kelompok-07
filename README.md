# DA DS 2026 - Kelompok 07

## Analisis Risiko Kejadian Diare Akut pada Balita Berdasarkan Faktor Gizi dan Kesehatan Keluarga

## Deskripsi Proyek

Proyek ini membahas analisis risiko kejadian diare akut pada balita berdasarkan faktor gizi dan kesehatan keluarga. Penelitian ini dilakukan untuk mengetahui hubungan antara faktor-faktor yang berkaitan dengan kondisi gizi balita dan kesehatan keluarga terhadap kejadian diare akut.

Dalam pengembangannya, proyek ini menerapkan pendekatan Data Analytics dan Data Science yang mencakup pengumpulan dan pengolahan data, proses ETL, penyimpanan data pada data warehouse, analisis data, serta pengembangan model untuk membantu mengidentifikasi risiko kejadian diare akut pada balita.

Hasil pengolahan dan analisis data akan disajikan melalui dashboard agar informasi yang diperoleh dapat lebih mudah dipahami.

## Tujuan Proyek

- Mengidentifikasi faktor gizi dan kesehatan keluarga yang berkaitan dengan kejadian diare akut pada balita.
- Melakukan pengolahan dan analisis data berdasarkan variabel penelitian.
- Menganalisis pola dan hubungan antarvariabel terhadap kejadian diare akut.
- Mengembangkan model analisis risiko berdasarkan data yang tersedia.
- Menyajikan hasil analisis melalui dashboard.

## Anggota Kelompok dan Peran

| No. | Nama Anggota | NIM | Peran |
|---|---|---|---|
| 1. | [Jesica Napitupulu] | [41424007] | [Peran] |
| 2. | [Binsar Siregar] | [41424038] | [Peran] |
| 3. | [Febri Silaen] | [41424040] | [Peran] |
| 4. | [Paulus Manurung] | [41424047] | [Peran] |
| 5. | [Johanna Tampubolon ] | [41424049] | [Peran] |

## Struktur Repository

Repository ini memiliki beberapa direktori utama dengan fungsi sebagai berikut:

- `data/` - Menyimpan sampel data dan tautan ke data lengkap.
- `etl/` - Menyimpan skrip Extract, Transform, Load (ETL).
- `warehouse/` - Menyimpan DDL skema bintang dan ERD.
- `notebooks/` - Menyimpan notebook untuk EDA, baseline, dan eksperimen model.
- `models/` - Menyimpan model terlatih dan model card.
- `app/` - Menyimpan service model berbasis Python.
- `frontend/` - Menyimpan kode dashboard menggunakan React.
- `backend/` - Menyimpan API menggunakan Go sebagai penghubung frontend dan service model.
- `paper/` - Menyimpan naskah jurnal dan informasi target jurnal.
- `reports/weekly/` - Menyimpan laporan perkembangan proyek setiap minggu.
- `docs/` - Menyimpan proposal, data dictionary, dan laporan kualitas data.

## Teknologi yang Digunakan

- **Frontend:** React
- **Backend:** Go
- **Model Service:** Python dan FastAPI
- **Tools:** Git dan GitHub

## Menjalankan Aplikasi

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

### Backend

```powershell
cd backend
go run .
```

### Service Model Python

Aktifkan virtual environment:

```powershell
.\.venv\Scripts\Activate.ps1
```

Kemudian jalankan service model:

```powershell
uvicorn app.model.main:app --reload --port 8000
```

Pastikan seluruh dependency yang dibutuhkan sudah terinstal sebelum menjalankan masing-masing komponen.

## Alur Integrasi Aplikasi

Alur integrasi antarkomponen dalam proyek ini adalah:

`Frontend → Backend → App/Model`

Frontend digunakan untuk menampilkan dashboard dan menerima interaksi pengguna. Backend berfungsi sebagai API penghubung, sedangkan service model Python menyediakan layanan model untuk kebutuhan analisis risiko.

## Status Proyek

Proyek saat ini berada dalam tahap pengembangan. Pengolahan data, analisis, pengembangan model, dokumentasi, dan implementasi aplikasi dilakukan secara bertahap sesuai dengan pembagian tugas kelompok.
