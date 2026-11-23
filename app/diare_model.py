"""
Model Diare Balita — dataset dinamis (bertambah otomatis dari dashboard).

Alur:
  data/Data_Diare_500_Balita.xlsx   -> dataset awal (tertanam, tidak pernah diubah)
  app/storage/dataset_live.xlsx     -> salinan kerja; bertambah setiap ada input dashboard
  models/*.joblib, metrik.json      -> model terlatih

Pemakaian dari dashboard (Streamlit / FastAPI / lainnya):
    from app.diare_model import DiareModel
    m = DiareModel()                      # otomatis menyiapkan dataset_live + model
    hasil = m.tambah_data({...})          # simpan input baru + prediksi
    m.ekspor_bytes()                      # isi file .xlsx terbaru untuk tombol download
"""
from __future__ import annotations

import io
import json
import shutil
import threading
from datetime import date, datetime
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier

ROOT = Path(__file__).resolve().parents[1]
BASE_FILE = ROOT / "data" / "Data_Diare_500_Balita.xlsx"      # dataset awal (tidak diubah)
STORAGE_DIR = Path(__file__).resolve().parent / "storage"    # masuk .gitignore
LIVE_FILE = STORAGE_DIR / "dataset_live.xlsx"                # dataset yang bertambah
ARTIFACT_DIR = ROOT / "models"                               # hasil latih (.joblib, metrik.json)

TARGET = "Status Diare Akut"
ID_COL = "ID Anak"

# Urutan kolom persis sama dengan dataset awal -> file unduhan kompatibel.
KOLOM = [
    "ID Anak", "Jenis Kelamin", "Usia (bulan)", "Tanggal Lahir", "Tanggal Pemeriksaan",
    "Kabupaten", "Kecamatan", "Berat Badan (kg)", "Panjang/Tinggi Badan (cm)",
    "HB Ibu (g/dL)", "Mendapat ASI", "Jenis Makanan dalam 24 Jam Terakhir",
    "Frekuensi Makan dalam 24 Jam (kali)", "Sumber Air", "Pengelolaan Air Minum",
    "Cuci Tangan Pakai Sabun", "Bulan Pengukuran Terakhir", "Imunisasi Rotavirus",
    "Frekuensi BAB dalam 24 Jam (kali)", "Bentuk Feses", "Status Diare Akut",
]

# Fitur model RISIKO: faktor yang diketahui SEBELUM anak sakit.
# Bentuk Feses & Frekuensi BAB sengaja tidak dipakai (lihat catatan di bawah).
FITUR_NUM = ["Usia (bulan)", "Berat Badan (kg)", "Panjang/Tinggi Badan (cm)",
             "HB Ibu (g/dL)", "Frekuensi Makan dalam 24 Jam (kali)"]
FITUR_KAT = ["Jenis Kelamin", "Kabupaten", "Mendapat ASI", "Sumber Air",
             "Pengelolaan Air Minum", "Cuci Tangan Pakai Sabun", "Imunisasi Rotavirus"]

# Fitur model DIAGNOSIS: Status Diare Akut ditentukan oleh bentuk feses + frekuensi BAB.
FITUR_DIAG_NUM = ["Frekuensi BAB dalam 24 Jam (kali)"]
FITUR_DIAG_KAT = ["Bentuk Feses"]

BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli",
         "Agustus", "September", "Oktober", "November", "Desember"]

NILAI_VALID = {
    "Jenis Kelamin": {"Laki-laki", "Perempuan"},
    "Kabupaten": {"Toba", "Tapanuli Utara"},
    "Mendapat ASI": {"Ya", "Tidak"},
    "Sumber Air": {"Air ledeng", "Air kemasan", "Mata air", "Sumur terlindung", "Sumur tidak terlindung"},
    "Pengelolaan Air Minum": {"Dimasak", "Tidak"},
    "Cuci Tangan Pakai Sabun": {"Ya", "Tidak"},
    "Imunisasi Rotavirus": {"Lengkap", "Tidak lengkap", "Belum mendapat"},
    "Bentuk Feses": {"Berbentuk", "Lembek", "Cair"},
}
WAJIB = [k for k in KOLOM if k not in (ID_COL, "Usia (bulan)", "Bulan Pengukuran Terakhir", TARGET)]

_lock = threading.Lock()


def _pre(num, kat):
    return ColumnTransformer([
        ("num", StandardScaler(), num),
        ("kat", OneHotEncoder(handle_unknown="ignore"), kat),
    ])


def _bulan_usia(lahir: pd.Timestamp, periksa: pd.Timestamp) -> int:
    return (periksa.year - lahir.year) * 12 + (periksa.month - lahir.month) - (periksa.day < lahir.day)


class DiareModel:
    def __init__(self, auto_train: bool = True):
        ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
        STORAGE_DIR.mkdir(parents=True, exist_ok=True)
        if not LIVE_FILE.exists():                      # pertama kali dijalankan
            shutil.copy(BASE_FILE, LIVE_FILE)
        self.risiko: Pipeline | None = None
        self.diagnosis: Pipeline | None = None
        self.metrik: dict = {}
        if (ARTIFACT_DIR / "risiko.joblib").exists() and (ARTIFACT_DIR / "diagnosis.joblib").exists():
            self.risiko = joblib.load(ARTIFACT_DIR / "risiko.joblib")
            self.diagnosis = joblib.load(ARTIFACT_DIR / "diagnosis.joblib")
            self.metrik = json.loads((ARTIFACT_DIR / "metrik.json").read_text())
        elif auto_train:
            self.latih()

    # ---------------------------------------------------------------- data
    def muat_data(self) -> pd.DataFrame:
        return pd.read_excel(LIVE_FILE)

    def jumlah_data_awal(self) -> int:
        return len(pd.read_excel(BASE_FILE))

    def _simpan(self, df: pd.DataFrame) -> None:
        tmp = LIVE_FILE.with_suffix(".tmp.xlsx")        # tulis atomik: file tidak rusak jika terhenti
        df[KOLOM].to_excel(tmp, index=False, sheet_name="Data")
        tmp.replace(LIVE_FILE)

    # --------------------------------------------------------------- latih
    def latih(self) -> dict:
        df = self.muat_data()
        y = (df[TARGET] == "Ya").astype(int)

        # Model 1 — risiko (faktor lingkungan/perilaku/gizi)
        risiko = Pipeline([
            ("pre", _pre(FITUR_NUM, FITUR_KAT)),
            ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
        ])
        X = df[FITUR_NUM + FITUR_KAT]
        cv = StratifiedKFold(5, shuffle=True, random_state=42)
        auc = roc_auc_score(y, cross_val_predict(risiko, X, y, cv=cv, method="predict_proba")[:, 1])
        risiko.fit(X, y)

        # Model 2 — diagnosis (dari gejala feses)
        diagnosis = Pipeline([
            ("pre", _pre(FITUR_DIAG_NUM, FITUR_DIAG_KAT)),
            ("clf", DecisionTreeClassifier(max_depth=3, random_state=42)),
        ])
        Xd = df[FITUR_DIAG_NUM + FITUR_DIAG_KAT]
        acc = (cross_val_predict(diagnosis, Xd, y, cv=cv) == y).mean()
        diagnosis.fit(Xd, y)

        self.risiko, self.diagnosis = risiko, diagnosis
        self.metrik = {
            "jumlah_data": int(len(df)),
            "jumlah_kasus_diare": int(y.sum()),
            "risiko_cv_roc_auc": round(float(auc), 3),
            "diagnosis_cv_akurasi": round(float(acc), 3),
            "dilatih_pada": datetime.now().isoformat(timespec="seconds"),
        }
        joblib.dump(risiko, ARTIFACT_DIR / "risiko.joblib")
        joblib.dump(diagnosis, ARTIFACT_DIR / "diagnosis.joblib")
        (ARTIFACT_DIR / "metrik.json").write_text(json.dumps(self.metrik, indent=2))
        return self.metrik

    # ------------------------------------------------------------ prediksi
    def prediksi_risiko(self, rec: dict) -> float:
        """Probabilitas (0-1) anak mengalami diare akut berdasarkan faktor risiko."""
        return float(self.risiko.predict_proba(pd.DataFrame([rec])[FITUR_NUM + FITUR_KAT])[0, 1])

    def diagnosis_status(self, rec: dict) -> str:
        """'Ya'/'Tidak' dari bentuk feses + frekuensi BAB."""
        x = pd.DataFrame([rec])[FITUR_DIAG_NUM + FITUR_DIAG_KAT]
        return "Ya" if self.diagnosis.predict(x)[0] == 1 else "Tidak"

    # ------------------------------------------------------- tambah data
    def _validasi(self, rec: dict) -> None:
        kosong = [k for k in WAJIB if rec.get(k) in (None, "")]
        if kosong:
            raise ValueError(f"Kolom wajib belum diisi: {kosong}")
        for k, valid in NILAI_VALID.items():
            if rec[k] not in valid:
                raise ValueError(f"'{k}' = {rec[k]!r} tidak valid. Pilihan: {sorted(valid)}")
        if not 0 < float(rec["Berat Badan (kg)"]) < 40:
            raise ValueError("Berat Badan di luar rentang wajar (0-40 kg).")
        if not 30 < float(rec["Panjang/Tinggi Badan (cm)"]) < 130:
            raise ValueError("Panjang/Tinggi Badan di luar rentang wajar (30-130 cm).")
        if not 3 <= float(rec["HB Ibu (g/dL)"]) <= 20:
            raise ValueError("HB Ibu di luar rentang wajar (3-20 g/dL).")
        if int(rec["Frekuensi BAB dalam 24 Jam (kali)"]) < 0:
            raise ValueError("Frekuensi BAB tidak boleh negatif.")

    def tambah_data(self, rec: dict, latih_ulang: bool = False) -> dict:
        """
        Tambahkan satu anak ke dataset_live.xlsx.

        Otomatis diisi bila kosong: ID Anak, Usia (bulan), Bulan Pengukuran Terakhir,
        Status Diare Akut (dari model diagnosis). Mengembalikan baris yang tersimpan
        + probabilitas risiko.
        """
        rec = dict(rec)
        self._validasi(rec)
        lahir, periksa = pd.Timestamp(rec["Tanggal Lahir"]), pd.Timestamp(rec["Tanggal Pemeriksaan"])
        if periksa < lahir:
            raise ValueError("Tanggal Pemeriksaan lebih awal dari Tanggal Lahir.")
        rec["Tanggal Lahir"], rec["Tanggal Pemeriksaan"] = lahir.normalize(), periksa.normalize()
        rec["Usia (bulan)"] = _bulan_usia(lahir, periksa)
        rec["Bulan Pengukuran Terakhir"] = BULAN[periksa.month - 1]
        for k in ("Frekuensi Makan dalam 24 Jam (kali)", "Frekuensi BAB dalam 24 Jam (kali)"):
            rec[k] = int(rec[k])

        risiko = self.prediksi_risiko(rec)
        if rec.get(TARGET) in (None, ""):
            rec[TARGET] = self.diagnosis_status(rec)
        elif rec[TARGET] not in ("Ya", "Tidak"):
            raise ValueError("Status Diare Akut harus 'Ya' atau 'Tidak'.")

        with _lock:                                     # aman bila dashboard dipakai bersamaan
            df = self.muat_data()
            rec[ID_COL] = rec.get(ID_COL) or f"BAL{len(df) + 1:04d}"
            if rec[ID_COL] in set(df[ID_COL]):
                raise ValueError(f"ID Anak {rec[ID_COL]} sudah ada.")
            df = pd.concat([df, pd.DataFrame([rec])], ignore_index=True)
            self._simpan(df)
        if latih_ulang:
            self.latih()
        return {"data": rec, "probabilitas_risiko": round(risiko, 3), "total_data": len(df)}

    # ------------------------------------------------------------- unduh
    def ekspor_bytes(self) -> bytes:
        """Isi file .xlsx terbaru (data awal + semua input dashboard) untuk tombol download."""
        buf = io.BytesIO()
        with _lock:
            self.muat_data()[KOLOM].to_excel(buf, index=False, sheet_name="Data")
        return buf.getvalue()

    def nama_file_unduhan(self) -> str:
        return f"Data_Diare_{len(self.muat_data())}_Balita_{date.today():%Y%m%d}.xlsx"


if __name__ == "__main__":
    m = DiareModel()
    print(json.dumps(m.metrik, indent=2, ensure_ascii=False))