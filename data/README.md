# Data

Folder ini menyimpan atau menautkan data yang digunakan oleh proyek.

## Pembagian data

- `raw/`: data mentah dari sumber asli, tanpa perubahan manual.
- `processed/`: data hasil transformasi yang sudah siap digunakan.
- `interim/`: data hasil tahap sementara.
- `external/`: data tambahan dari pihak atau sumber lain yang sudah disepakati.
- `sample/`: sampel data kecil untuk pengembangan, demonstrasi, dan pengujian.
- `metadata/`: deskripsi sumber, skema, lisensi, tanggal perolehan, dan provenance.
- `documentation/`: dokumentasi tambahan yang menjelaskan dataset.

## Batas penyimpanan

Tidak ada file dataset yang boleh di-commit jika ukurannya lebih dari 50 MB. Untuk dataset yang lebih besar, simpan di luar repository dan catat tautan serta prosedur pengambilannya pada dokumentasi dataset.
