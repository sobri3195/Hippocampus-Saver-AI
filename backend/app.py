from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI(
    title="Hippocampus-Saver AI API",
    description=(
        "Prediksi risiko penurunan fungsi kognitif pasca WBRT berbasis "
        "fitur radiomics MRI dan parameter dosis ke hippocampus."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionInput(BaseModel):
    age: int = Field(..., ge=18, le=100, description="Usia pasien")
    baseline_mmse: float = Field(..., ge=0, le=30, description="Skor MMSE baseline")
    hippocampus_dmean_gy: float = Field(..., ge=0, le=30, description="Dmean hippocampus (Gy)")
    hippocampus_dmax_gy: float = Field(..., ge=0, le=40, description="Dmax hippocampus (Gy)")
    radiomics_entropy: float = Field(..., ge=0, le=10, description="Radiomics entropy")
    radiomics_texture_nonuniformity: float = Field(..., ge=0, le=20, description="Texture non-uniformity")


class PredictionOutput(BaseModel):
    risk_probability: float
    risk_category: str
    predicted_mmse_delta_6m: float
    recommendation: str


def _sigmoid(value: float) -> float:
    return 1 / (1 + (2.718281828 ** (-value)))


@app.get("/")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "Hippocampus-Saver AI API"}


@app.post("/predict", response_model=PredictionOutput)
def predict(payload: PredictionInput) -> PredictionOutput:
    logit = (
        -2.4
        + 0.028 * payload.age
        - 0.11 * payload.baseline_mmse
        + 0.075 * payload.hippocampus_dmean_gy
        + 0.031 * payload.hippocampus_dmax_gy
        + 0.42 * payload.radiomics_entropy
        + 0.09 * payload.radiomics_texture_nonuniformity
    )

    risk_probability = max(0.0, min(1.0, _sigmoid(logit)))

    if risk_probability < 0.35:
        category = "Rendah"
        recommendation = "Lanjutkan rencana WBRT standar dengan monitoring kognitif rutin."
    elif risk_probability < 0.65:
        category = "Sedang"
        recommendation = (
            "Pertimbangkan hippocampal sparing dan evaluasi neurokognitif ketat tiap 3 bulan."
        )
    else:
        category = "Tinggi"
        recommendation = (
            "Kuatkan indikasi hippocampal sparing/adaptasi rencana serta diskusi MDT personalisasi terapi."
        )

    predicted_mmse_delta_6m = round(-8 * risk_probability, 2)

    return PredictionOutput(
        risk_probability=round(risk_probability, 3),
        risk_category=category,
        predicted_mmse_delta_6m=predicted_mmse_delta_6m,
        recommendation=recommendation,
    )
