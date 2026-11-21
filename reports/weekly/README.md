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
├── minggu-11/
│   ├── 41424040-febri.md
│   ├── 41424047-paulus.md
│   ├── 41424038-binsar.md
│   ├── 41424049-johanna.md
│   ├── 41424007-jesica.md
│   └── REKAP FINAL MINGGU 11/
│       └── rekap-minggu-11.md
├── minggu-12/
└── ...
```

Laporan minggu 11 dikerjakan pada folder `minggu-11/`; folder `minggu-12/` juga
sudah tersedia. File `minggu-01.md` sampai `minggu-14.md` yang sudah ada tetap
dipertahankan.

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
sedang dikerjakan. Untuk issue `#11` dan minggu 11, nama branchnya
`docs/11-laporan-minggu-11`.

PIC push branch kerjanya agar anggota lain dapat mengisinya:

```bash
git push -u origin docs/XX-laporan-minggu-NN
```

Setelah branch tersedia di remote, setiap anggota yang memiliki akses tulis
dapat checkout branch tersebut, lalu mengisi dan push file laporannya sendiri.
Untuk minggu yang folder dan file laporannya sudah tersedia, edit file itu
langsung; jangan membuat salinan dengan nama berbeda.

```bash
git fetch origin
git switch --track origin/docs/XX-laporan-minggu-NN
git add reports/weekly/minggu-NN/NIM-nama.md
git commit -m "docs: laporan minggu NN - nama (#XX)"
git push
```

Jika branch sudah pernah di-checkout, gunakan `git switch
docs/XX-laporan-minggu-NN` sebelum mengedit. Anggota sebaiknya mengoordinasikan
perubahan pada file masing-masing untuk menghindari konflik.

Setelah semua laporan terverifikasi, PIC membuat
atau memperbarui rekap minggu terkait, lalu membuka satu PR ke `main` dengan
deskripsi yang merujuk dan menutup issue checkpoint (`Closes #XX`). Untuk
minggu 11, pertahankan lokasi rekap yang sudah ada di
`minggu-11/REKAP FINAL MINGGU 11/rekap-minggu-11.md`. Minta review minimal satu
anggota lain. Merge hanya setelah mendapat persetujuan reviewer.
