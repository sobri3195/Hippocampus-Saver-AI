# Hippocampus-Saver AI

**Author:** dr. Muhammad Sobri Maulana

Aplikasi prototipe **React + Python (FastAPI)** untuk mendukung prediksi penurunan fungsi kognitif pasca **Whole-Brain Radiotherapy (WBRT)** dengan menggabungkan data **MRI radiomics** dan **parameter dosis ke hippocampus**.

## Latar Belakang Studi

**Judul ide:**
**Hippocampus-Saver AI: Prediksi Penurunan Fungsi Kognitif Pasca WBRT Berbasis MRI Radiomics dan Dosis ke Hippocampus**

### Kerangka PICO

- **P (Population):** Pasien metastasis otak kandidat WBRT.
- **I (Intervention):** Model AI berbasis fitur radiomics MRI + parameter dosis hippocampus.
- **C (Comparison):** Evaluasi konvensional (penilaian klinis + DVH constraints tanpa model prediksi individual).
- **O (Outcome):** Skor kognitif 3–12 bulan, kualitas hidup, dan dampak pada keputusan hippocampal sparing/adaptasi rencana.

## Arsitektur Proyek

- `backend/` → API prediksi berbasis FastAPI.
- `frontend/` → Antarmuka React untuk input parameter pasien dan menampilkan hasil risiko.

## Menjalankan Backend (Python)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

API tersedia di `http://127.0.0.1:8000`.

## Menjalankan Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Aplikasi tersedia di `http://127.0.0.1:5173`.

## Endpoint Utama

### `POST /predict`

Contoh payload:

```json
{
  "age": 55,
  "baseline_mmse": 27,
  "hippocampus_dmean_gy": 8,
  "hippocampus_dmax_gy": 16,
  "radiomics_entropy": 3.1,
  "radiomics_texture_nonuniformity": 7.5
}
```

Contoh response:

```json
{
  "risk_probability": 0.422,
  "risk_category": "Sedang",
  "predicted_mmse_delta_6m": -3.38,
  "recommendation": "Pertimbangkan hippocampal sparing dan evaluasi neurokognitif ketat tiap 3 bulan."
}
```

## Catatan

Model yang digunakan saat ini adalah **simulasi prototipe** untuk demonstrasi alur klinis-digital. Untuk penggunaan klinis nyata, diperlukan:

- pelatihan model dengan dataset multi-center,
- validasi internal/eksternal,
- evaluasi bias dan kalibrasi,
- serta persetujuan etik/regulatori.
