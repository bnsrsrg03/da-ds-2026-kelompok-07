# Laporan Mingguan

Folder ini menyimpan laporan progres mingguan per anggota. Gunakan
[`TEMPLATE.md`](./TEMPLATE.md) sebagai format standar. Isi laporan harus
berdasarkan aktivitas yang benar-benar dilakukan dan dikonfirmasi oleh anggota
yang bersangkutan; jangan mengarang aktivitas, kendala, atau estimasi jam.

## Struktur

```text
reports/weekly/
├── README.md
├── TEMPLATE.md
├── minggu-01.md ... minggu-14.md  # file lama, tetap dipertahankan
├── minggu-01/
│   ├── 41424040-febri.md
│   ├── 41424047-paulus.md
│   ├── 41424038-binsar.md
│   ├── 41424049-johanna.md
│   ├── 41424007-jesika.md
│   └── rekap-minggu-01.md
├── minggu-02/
└── ...
```

Setiap minggu memiliki subfolder untuk laporan anggota dan rekapnya. File
`minggu-01.md` sampai `minggu-14.md` yang sudah ada tetap dipertahankan.
Folder minggu 11 dan 12 yang telah ada juga tidak diubah oleh panduan ini.

## Penamaan dan pengisian laporan

Salin template ke subfolder minggu yang sesuai dengan pola
`NIM-namadepan.md`, lalu isi nama, NIM, periode, issue, pekerjaan, kendala,
rencana, dan estimasi jam. Contoh: `41424040-febri.md`.

Jangan isi bagian dengan perkiraan yang belum dikonfirmasi. Jika informasi
belum tersedia, minta anggota terkait melengkapinya sebelum laporan dan rekap
diajukan untuk review.

## Milestone dan kelompok minggu

Satu issue laporan dibuat untuk setiap checkpoint, bukan untuk setiap minggu.
Issue tersebut mengelompokkan laporan pada rentang berikut:

| Milestone | Minggu laporan |
|---|---|
| CP1 – Proposal | M1–M2 |
| CP2 – Data Readiness | M3–M5 |
| CP3 – Evaluasi Progres | M6–M8 |
| CP4 – Prototipe | M9–M11 |
| CP5 – Presentasi | M12–M15 |

Gunakan nomor issue checkpoint terkait sebagai `XX` pada branch dan commit.
Satu branch dan satu PR mencakup laporan yang dikerjakan untuk issue checkpoint
tersebut.

## Alur branch dan Pull Request

PIC checkpoint membuat branch dari `main` terbaru:

```bash
git switch main
git pull origin main
git switch -c docs/XX-laporan-minggu-NN
```

Ganti `XX` dengan nomor issue checkpoint dan `NN` dengan minggu laporan yang
sedang dikerjakan. Contoh untuk issue `#11` dan minggu 01:
`docs/11-laporan-minggu-01`.

Setiap anggota menyalin template, mengisi laporannya sendiri, lalu commit dan
push ke branch checkpoint:

```bash
git add reports/weekly/minggu-NN/NIM-nama.md
git commit -m "docs: laporan minggu NN - nama (#XX)"
git push -u origin docs/XX-laporan-minggu-NN
```

Setelah semua laporan terverifikasi, PIC membuat
`reports/weekly/minggu-NN/rekap-minggu-NN.md`, lalu membuka satu PR ke `main`
dengan deskripsi yang merujuk dan menutup issue checkpoint (`Closes #XX`).
Minta review minimal satu anggota lain. Merge hanya setelah mendapat
persetujuan reviewer.
