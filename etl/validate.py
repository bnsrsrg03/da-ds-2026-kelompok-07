from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

import pandas as pd
import yaml


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = PROJECT_ROOT / "etl" / "config" / "config.yaml"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Buat laporan kualitas data untuk dataset diare balita."
    )
    parser.add_argument("--input", help="Path file data mentah")
    parser.add_argument("--config", default=str(DEFAULT_CONFIG), help="Path file konfigurasi")
    parser.add_argument("--json-report", help="Path output laporan JSON")
    parser.add_argument("--csv-report", help="Path output laporan CSV")
    return parser.parse_args()


def resolve_project_path(value: str | Path) -> Path:
    path = Path(value).expanduser()
    if not path.is_absolute():
        path = PROJECT_ROOT / path
    return path.resolve()


def load_config(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as config_file:
        return yaml.safe_load(config_file) or {}


def is_identifier_column(column: str) -> bool:
    name = column.lower()
    return (
        name.startswith("id_")
        or name in {"id", "id_anak", "id_balita", "kabupaten"}
    )


def snake_case_columns(df: pd.DataFrame) -> pd.DataFrame:
    renamed: dict[str, str] = {}
    for column in df.columns:
        name = re.sub(r"[^a-zA-Z0-9]+", "_", str(column).strip().lower())
        name = re.sub(r"_+", "_", name).strip("_")
        renamed[str(column)] = name

    normalized = df.rename(columns=renamed).copy()
    if "status_diare" not in normalized.columns:
        for alias in (
            "status_diare_akut",
            "status_diare_balita",
            "gejala_diare_14_hari_terakhir",
            "diare",
        ):
            if alias in normalized.columns:
                normalized = normalized.rename(columns={alias: "status_diare"})
                break
    if "id_anak" not in normalized.columns and "id_balita" not in normalized.columns:
        for alias in ("id", "id_balita", "id_anak_balita"):
            if alias in normalized.columns:
                normalized = normalized.rename(columns={alias: "id_anak"})
                break
    if "id_anak" not in normalized.columns:
        for column in normalized.columns:
            if str(column).startswith("id_anak"):
                normalized = normalized.rename(columns={column: "id_anak"})
                break
    return normalized


def completeness(df: pd.DataFrame) -> dict[str, dict[str, int | float]]:
    return {
        str(column): {
            "missing": int(df[column].isna().sum()),
            "persen": round(float(df[column].isna().mean() * 100), 2),
        }
        for column in df.columns
    }


def uniqueness(df: pd.DataFrame) -> dict[str, int]:
    result = {
        "duplikat_penuh": int(df.duplicated(keep="first").sum()),
    }
    if "id_anak" in df.columns:
        result["duplikat_id_anak"] = int(
            (df["id_anak"].notna() & df["id_anak"].duplicated(keep="first")).sum()
        )
    elif "id_balita" in df.columns:
        result["duplikat_id_anak"] = int(
            (df["id_balita"].notna() & df["id_balita"].duplicated(keep="first")).sum()
        )
    else:
        result["duplikat_id_anak"] = 0
    return result


def numeric_columns(df: pd.DataFrame) -> list[str]:
    return [
        str(column)
        for column in df.select_dtypes(include="number").columns
        if not is_identifier_column(str(column))
    ]


def validity(df: pd.DataFrame) -> dict[str, list[dict[str, Any]]]:
    findings: list[dict[str, Any]] = []

    for column in df.columns:
        series = df[column]
        if column in numeric_columns(df):
            negative = int((series.dropna() < 0).sum())
            if negative:
                findings.append(
                    {
                        "jenis": "nilai_negatif",
                        "kolom": str(column),
                        "jumlah": negative,
                        "keterangan": "Nilai numerik harus tidak negatif",
                    }
                )

        name = str(column).lower()
        if name in {"berat_badan", "berat_badan_kg"}:
            zero_or_negative = int((series.dropna() <= 0).sum())
            if zero_or_negative:
                findings.append(
                    {
                        "jenis": "nilai_tidak_valid",
                        "kolom": str(column),
                        "jumlah": zero_or_negative,
                        "keterangan": "Berat badan harus lebih besar dari 0",
                    }
                )
        if name in {"tinggi_badan", "panjang_tinggi_badan_cm"}:
            zero_or_negative = int((series.dropna() <= 0).sum())
            if zero_or_negative:
                findings.append(
                    {
                        "jenis": "nilai_tidak_valid",
                        "kolom": str(column),
                        "jumlah": zero_or_negative,
                        "keterangan": "Tinggi/panjang badan harus lebih besar dari 0",
                    }
                )

        expected_dtype = "numeric" if column in numeric_columns(df) else "text/date"
        unusual_type = False
        if pd.api.types.is_numeric_dtype(series):
            unusual_type = False
        elif series.dropna().map(lambda value: isinstance(value, (dict, list))).any():
            unusual_type = True
        if unusual_type:
            findings.append(
                {
                    "jenis": "tipe_data",
                    "kolom": str(column),
                    "jumlah": int(series.dropna().map(lambda value: isinstance(value, (dict, list))).sum()),
                    "keterangan": f"Tipe tidak sesuai untuk kolom bertipe {expected_dtype}",
                }
            )

    for column in numeric_columns(df):
        series = df[column]
        if series.dtype == object:
            findings.append(
                {
                    "jenis": "tipe_data",
                    "kolom": column,
                    "jumlah": int(series.notna().sum()),
                    "keterangan": "Kolom numerik tersimpan sebagai tipe lain",
                }
            )

    return {"temuan": findings}


def consistency(df: pd.DataFrame) -> dict[str, list[dict[str, Any]]]:
    findings: list[dict[str, Any]] = []

    if "status_diare" in df.columns:
        invalid = df["status_diare"].dropna()
        invalid = invalid[~invalid.isin([0, 1])]
        if len(invalid):
            findings.append(
                {
                    "jenis": "nilai_target_tidak_valid",
                    "kolom": "status_diare",
                    "jumlah": int(len(invalid)),
                    "nilai": sorted({str(value) for value in invalid.unique()}, key=str),
                    "keterangan": "status_diare hanya boleh bernilai 0 atau 1",
                }
            )

    domains: dict[str, set[str]] = {
        "jenis_kelamin": {"L", "P", "Laki-laki", "Perempuan"},
        "status_kehamilan_saat_pemeriksaan_hb": {
            "Hamil",
            "Tidak hamil",
            "Tidak Hamil",
        },
        "masih_mendapat_asi": {"Ya", "Tidak"},
        "air_minum_dimasak": {"Ya", "Tidak"},
        "cuci_tangan_pakai_sabun": {"Ya", "Tidak"},
    }

    for column in df.select_dtypes(include=["object", "string"]).columns:
        series = df[column].dropna()
        if series.empty:
            continue

        normalized = series.astype(str).str.strip()
        whitespace_count = int(
            series.astype(str).map(lambda value: value != value.strip()).sum()
        )
        if whitespace_count:
            findings.append(
                {
                    "jenis": "format_kategori",
                    "kolom": str(column),
                    "jumlah": whitespace_count,
                    "keterangan": "Nilai kategori memiliki spasi berlebih",
                }
            )

        variants = (
            normalized.str.casefold()
            .to_frame(name="_normalized")
            .assign(nilai=normalized)
            .groupby("_normalized")["nilai"]
            .agg(lambda values: sorted(set(values.astype(str)), key=str))
        )
        conflicting = [values for values in variants if len(values) > 1]
        if conflicting:
            findings.append(
                {
                    "jenis": "variasi_huruf_kategori",
                    "kolom": str(column),
                    "jumlah": int(len(conflicting)),
                    "nilai": conflicting,
                    "keterangan": "Nilai kategori berbeda hanya karena kapitalisasi",
                }
            )

        if str(column) in domains:
            allowed = domains[str(column)]
            allowed_folded = {value.casefold() for value in allowed}
            invalid = normalized[
                ~normalized.str.casefold().isin(allowed_folded)
            ]
            if len(invalid):
                findings.append(
                    {
                        "jenis": "kategori_tidak_sesuai_domain",
                        "kolom": str(column),
                        "jumlah": int(len(invalid)),
                        "nilai": sorted({str(value) for value in invalid.unique()}, key=str),
                        "keterangan": f"Nilai di luar domain: {sorted(allowed, key=str)}",
                    }
                )

    return {"temuan": findings}


def outliers(df: pd.DataFrame) -> dict[str, dict[str, int | float]]:
    result: dict[str, dict[str, int | float]] = {}
    for column in numeric_columns(df):
        series = df[column].dropna()
        if series.empty:
            continue
        q1 = float(series.quantile(0.25))
        q3 = float(series.quantile(0.75))
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        count = int(((series < lower) | (series > upper)).sum())
        result[column] = {
            "batas_bawah": round(lower, 4),
            "batas_atas": round(upper, 4),
            "jumlah_outlier": count,
        }
    return {"kolom_numerik": result}


def target_distribution(df: pd.DataFrame) -> dict[str, int | float]:
    if "status_diare" not in df.columns:
        return {"Diare": 0, "Tidak Diare": 0, "rasio_imbalance": 0.0}

    target = df["status_diare"].copy()
    if target.dtype == object or isinstance(target.dtype, pd.StringDtype):
        normalized = target.astype("string").str.strip().str.casefold()
        target = normalized.map(
            lambda value: 1 if value in {"1", "diare", "ya", "ya diare"} else (
                0 if value in {"0", "tidak diare", "tidak", "non diare"} else pd.NA
            )
        )
    target = pd.to_numeric(target, errors="coerce")
    tidak_diare = int((target == 0).sum())
    diare = int((target == 1).sum())
    majority = max(diare, tidak_diare)
    minority = min(diare, tidak_diare)
    ratio = round(minority / majority, 4) if majority else 0.0
    return {
        "Diare": diare,
        "Tidak Diare": tidak_diare,
        "rasio_imbalance": ratio,
    }


def build_summary_csv(
    completeness_report: dict[str, dict[str, int | float]],
    uniqueness_report: dict[str, int],
    validity_report: dict[str, list[dict[str, Any]]],
    consistency_report: dict[str, list[dict[str, Any]]],
    outlier_report: dict[str, dict[str, dict[str, int | float]]],
    target_report: dict[str, int | float],
) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []

    for column, values in completeness_report.items():
        rows.append(
            {
                "kategori": "completeness",
                "kolom": column,
                "metrik": "missing",
                "nilai": values["missing"],
            }
        )
        rows.append(
            {
                "kategori": "completeness",
                "kolom": column,
                "metrik": "persen",
                "nilai": values["persen"],
            }
        )

    for metric, value in uniqueness_report.items():
        rows.append(
            {"kategori": "uniqueness", "kolom": "-", "metrik": metric, "nilai": value}
        )

    for report_name, report in (
        ("validity", validity_report),
        ("consistency", consistency_report),
    ):
        for finding in report["temuan"]:
            detail = dict(finding)
            detail.pop("jenis", None)
            detail.pop("kolom", None)
            rows.append(
                {
                    "kategori": report_name,
                    "kolom": finding.get("kolom", "-"),
                    "metrik": finding["jenis"],
                    "nilai": json.dumps(detail, ensure_ascii=False),
                }
            )

    for column, values in outlier_report["kolom_numerik"].items():
        rows.append(
            {
                "kategori": "outlier",
                "kolom": column,
                "metrik": "batas_bawah",
                "nilai": values["batas_bawah"],
            }
        )
        rows.append(
            {
                "kategori": "outlier",
                "kolom": column,
                "metrik": "batas_atas",
                "nilai": values["batas_atas"],
            }
        )
        rows.append(
            {
                "kategori": "outlier",
                "kolom": column,
                "metrik": "jumlah_outlier",
                "nilai": values["jumlah_outlier"],
            }
        )

    for metric, value in target_report.items():
        rows.append(
            {
                "kategori": "distribusi_target",
                "kolom": "-",
                "metrik": metric,
                "nilai": value,
            }
        )

    return pd.DataFrame(rows, columns=["kategori", "kolom", "metrik", "nilai"])


def main() -> int:
    args = parse_args()
    config_path = resolve_project_path(args.config)
    config = load_config(config_path)

    input_value = args.input or config.get("input")
    json_value = args.json_report or config.get("json_report")
    csv_value = args.csv_report or config.get("csv_report")

    if not input_value:
        print("Input data belum dikonfigurasi.")
        return 2

    input_path = resolve_project_path(input_value)
    json_path = resolve_project_path(
        json_value or "etl/reports/laporan_kualitas.json"
    )
    csv_path = resolve_project_path(
        csv_value or "etl/reports/laporan_kualitas.csv"
    )

    if not input_path.exists():
        print(f"File input tidak ditemukan: {input_path}")
        return 2

    try:
        if input_path.suffix.lower() in {".csv", ".txt"}:
            df = pd.read_csv(input_path)
        elif input_path.suffix.lower() in {".xlsx", ".xls"}:
            df = pd.read_excel(input_path)
        else:
            print(f"Format file tidak didukung: {input_path.suffix}")
            return 2
    except Exception as exc:
        print(f"Gagal membaca file Excel: {exc}")
        return 2

    df = snake_case_columns(df)

    completeness_report = completeness(df)
    uniqueness_report = uniqueness(df)
    validity_report = validity(df)
    consistency_report = consistency(df)
    outlier_report = outliers(df)
    target_report = target_distribution(df)

    report: dict[str, Any] = {
        "tanggal_run": datetime.now().astimezone().isoformat(timespec="seconds"),
        "jumlah_baris": int(len(df)),
        "jumlah_kolom": int(len(df.columns)),
        "completeness": completeness_report,
        "uniqueness": uniqueness_report,
        "validity": validity_report,
        "consistency": consistency_report,
        "outlier": outlier_report,
        "distribusi_target": target_report,
    }

    json_path.parent.mkdir(parents=True, exist_ok=True)
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    with json_path.open("w", encoding="utf-8") as json_file:
        json.dump(report, json_file, ensure_ascii=False, indent=2)

    summary_csv = build_summary_csv(
        completeness_report,
        uniqueness_report,
        validity_report,
        consistency_report,
        outlier_report,
        target_report,
    )
    summary_csv.to_csv(csv_path, index=False, encoding="utf-8")

    print("Ringkasan laporan kualitas data")
    print(f"Jumlah baris: {report['jumlah_baris']}")
    print(f"Jumlah kolom: {report['jumlah_kolom']}")
    print(f"Duplikat penuh: {uniqueness_report['duplikat_penuh']}")
    print(f"Duplikat id_anak: {uniqueness_report['duplikat_id_anak']}")
    print(f"Outlier numerik: {len(outlier_report['kolom_numerik'])} kolom diperiksa")
    print(
        "Distribusi target: "
        f"Diare={target_report['Diare']}, "
        f"Tidak Diare={target_report['Tidak Diare']}, "
        f"rasio_imbalance={target_report['rasio_imbalance']}"
    )
    print(f"Laporan JSON: {json_path}")
    print(f"Laporan CSV: {csv_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
