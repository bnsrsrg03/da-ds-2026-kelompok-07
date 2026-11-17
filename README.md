# DA DS 2026 - Kelompok 07

Struktur awal proyek data analytics dan data science.

## Struktur

- `data/` - sampel data dan tautan ke data lengkap
- `etl/` - skrip extract-transform-load
- `warehouse/` - DDL skema bintang dan ERD
- `notebooks/` - EDA, baseline, dan eksperimen model
- `models/` - model terlatih dan model card
- `app/` - service model Python
- `frontend/` - dashboard React
- `backend/` - API Go sebagai penghubung frontend dan service model
- `paper/` - naskah jurnal dan target jurnal
- `reports/weekly/` - laporan mingguan
- `docs/` - proposal, data dictionary, dan laporan kualitas data

## Menjalankan aplikasi

### Frontend

```powershell
cd frontend
npm run dev
```

### Backend

```powershell
cd backend
go run .
```

### Service model Python

```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app.model.main:app --reload --port 8000
```

Alur integrasi yang disiapkan adalah `frontend -> backend -> app/model`.

