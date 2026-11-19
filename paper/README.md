# Paper

Naskah jurnal Proyek Terintegrasi Data Analitik dan Data Science Kelompok 07, Institut Teknologi Del.

## Jurnal Target

| Atribut | Isi |
|---|---|
| Jurnal | MALCOM: Indonesian Journal of Machine Learning and Computer Science |
| Penerbit | Institut Riset dan Publikasi Indonesia (IRPI) |
| Peringkat | SINTA 3, berlaku Vol 5 Issue 2 (2025) sampai Vol 10 Issue 1 (2030) |
| Jalur | B. Nasional (SINTA 1–3) |
| Bahasa | Bahasa Indonesia, judul dan abstrak dwibahasa |
| Gaya sitasi | IEEE |
| Referensi | Minimal 20, target 25, minimal 80% artikel jurnal atau prosiding |
| Similarity | Maksimal 15% |

Rincian lengkap ada di [`jurnal-target.md`](jurnal-target.md).

## Struktur Folder

```text
paper/
├── README.md
├── jurnal-target.md
├── checklist-author-guidelines.md
├── kerangka-naskah.md
├── template/
│   ├── MALCOM-Template.docx
│   └── MALCOM-Copyright-Form.docx
├── draf/
│   └── naskah-vNN.docx
├── draf-lengkap.docx
├── naskah-final.docx
├── figures/
│   ├── fig-NN-deskripsi.png
│   └── tab-NN-deskripsi.csv
├── referensi/
│   └── referensi.bib
├── similarity/
│   └── laporan-similarity-vNN.pdf
├── bukti-verifikasi/
│   └── sinta-malcom-YYYY-MM-DD.png
└── submission/
    └── bukti-submission-YYYY-MM-DD.png
```

| Lokasi | Isi | Minggu |
|---|---|---|
| `jurnal-target.md` | Lembar Jurnal Target | 3 |
| `checklist-author-guidelines.md` | Checklist kepatuhan pedoman penulisan | 15 |
| `kerangka-naskah.md` | Kerangka bagian naskah, sumber data, dan gambar/tabel | 3 |
| `template/` | Template resmi MALCOM dan formulir hak cipta | 3 |
| `draf/` | Draf kerja per putaran revisi | 5–12 |
| `draf-lengkap.docx` | Draf lengkap untuk review dosen | 13 |
| `naskah-final.docx` | Naskah final siap submit | 15 |
| `figures/` | Gambar dan tabel yang diekspor dari notebook | 10 |
| `referensi/` | Ekspor BibTeX dari Zotero atau Mendeley | 3 |
| `similarity/` | Laporan cek similarity | 14 |
| `bukti-verifikasi/` | Tangkapan layar peringkat jurnal di SINTA | 3 |
| `submission/` | Bukti submission ke MALCOM | 15 |

## Aturan Penamaan

| Jenis | Pola | Contoh |
|---|---|---|
| Draf kerja | `draf/naskah-vNN.docx` | `draf/naskah-v03.docx` |
| Gambar | `figures/fig-NN-deskripsi.png` | `figures/fig-03-prevalensi-per-kecamatan.png` |
| Tabel | `figures/tab-NN-deskripsi.csv` | `figures/tab-03-perbandingan-model.csv` |
| Similarity | `similarity/laporan-similarity-vNN.pdf` | `similarity/laporan-similarity-v05.pdf` |
| Bukti | `<jenis>-malcom-YYYY-MM-DD.<ext>` | `bukti-verifikasi/sinta-malcom-2026-11-20.png` |

## Alur Kerja

1. Unduh template resmi ke `template/`.
2. Salin template menjadi `draf/naskah-v01.docx`.
3. Kerjakan satu bagian naskah per Issue dan per branch.
4. Ekspor gambar dan tabel dari notebook ke `figures/`, lalu sisipkan ke naskah.
5. Naikkan nomor versi draf setiap selesai satu putaran revisi.
6. Simpan draf lengkap Minggu 13 sebagai `draf-lengkap.docx`.
7. Simpan naskah final Minggu 15 sebagai `naskah-final.docx`.

## Progres

| Bagian | Minggu | Penanggung jawab | Selesai |
|---|---|---|---|
| Lembar jurnal target | 3 | | 0% |
| Referensi awal | 3 | | 0% |
| Tinjauan pustaka | 4 | | 0% |
| Pendahuluan | 5 | | 0% |
| Metodologi: data | 6 | | 0% |
| Metodologi: pipeline dan pemodelan | 7 | | 0% |
| Pendahuluan dan Metodologi draf 1 | 8 | | 0% |
| Desain eksperimen | 9 | | 0% |
| Tabel dan gambar hasil | 10 | | 0% |
| Hasil | 11 | | 0% |
| Pembahasan | 12 | | 0% |
| Draf lengkap | 13 | | 0% |
| Revisi dan similarity | 14 | | 0% |
| Naskah final dan submission | 15 | | 0% |

## Ketentuan

- Angka dalam naskah sama dengan hasil kode di repositori dan aplikasi.
- Setiap referensi diperiksa langsung dan DOI dapat dibuka.
- Penulis terdiri atas seluruh anggota kelompok dan dosen pengampu.
- Naskah memuat pernyataan ketersediaan data, izin penggunaan data, dan pengungkapan penggunaan alat bantu AI sesuai kebijakan jurnal.
- Naskah hanya disubmit setelah versi final disetujui dosen. MALCOM mengenakan denda Rp1.000.000 untuk penarikan naskah setelah submit.
