import re
import pickle
import numpy as np
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from nltk.corpus import stopwords
import nltk

nltk.download("stopwords", quiet=True)
_stop_words = set(stopwords.words("english"))

router = APIRouter(tags=["Prediction"])

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"

_model = None
_tokenizer = None
_label_encoder = None


def _load_artifacts():
    global _model, _tokenizer, _label_encoder
    if _model is not None:
        return
    _model = load_model(str(MODEL_DIR / "emotion_lstm_final.keras"))
    with open(MODEL_DIR / "tokenizer_glove.pkl", "rb") as f:
        _tokenizer = pickle.load(f)
    with open(MODEL_DIR / "label_encoder.pkl", "rb") as f:
        _label_encoder = pickle.load(f)


def _preprocess(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-zA-Z\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    tokens = text.split()
    tokens = [w for w in tokens if w not in _stop_words]
    return " ".join(tokens)


class PredictRequest(BaseModel):
    text: str


class BatchPredictRequest(BaseModel):
    texts: list[str]


class PredictResponse(BaseModel):
    emotion: str
    confidence: float
    probabilities: dict[str, float]


class BatchPredictResponse(BaseModel):
    results: list[PredictResponse]


@router.get("/api/predict/health")
async def health():
    return {"status": "ok", "model": "emotion_lstm_improved_v2", "accuracy": 0.9281, "emotions": ["anger", "fear", "joy", "love", "sadness", "surprise"]}


@router.post("/api/predict/emotion", response_model=PredictResponse)
async def predict_emotion(req: PredictRequest):
    _load_artifacts()
    cleaned = _preprocess(req.text)
    if not cleaned:
        raise HTTPException(status_code=422, detail="Text is empty after preprocessing")
    seq = _tokenizer.texts_to_sequences([cleaned])
    padded = pad_sequences(seq, maxlen=120, padding="post", truncating="post")
    probs = _model.predict(padded, verbose=0)[0]
    pred_idx = int(np.argmax(probs))
    emotion = str(_label_encoder.inverse_transform([pred_idx])[0])
    confidence = float(probs[pred_idx])
    prob_dict = {str(cls): float(probs[i]) for i, cls in enumerate(_label_encoder.classes_)}
    return PredictResponse(emotion=emotion, confidence=confidence, probabilities=prob_dict)


@router.post("/api/predict/batch", response_model=BatchPredictResponse)
async def predict_batch(req: BatchPredictRequest):
    _load_artifacts()
    if not req.texts:
        raise HTTPException(status_code=422, detail="No texts provided")
    cleaned_texts = [_preprocess(t) for t in req.texts]
    valid_indices = [i for i, t in enumerate(cleaned_texts) if t]
    if not valid_indices:
        raise HTTPException(status_code=422, detail="All texts are empty after preprocessing")
    valid_texts = [cleaned_texts[i] for i in valid_indices]
    seqs = _tokenizer.texts_to_sequences(valid_texts)
    padded = pad_sequences(seqs, maxlen=120, padding="post", truncating="post")
    all_probs = _model.predict(padded, verbose=0)
    results: list[PredictResponse | None] = [None] * len(req.texts)
    for out_idx, src_idx in enumerate(valid_indices):
        probs = all_probs[out_idx]
        pred_idx = int(np.argmax(probs))
        emotion = str(_label_encoder.inverse_transform([pred_idx])[0])
        confidence = float(probs[pred_idx])
        prob_dict = {str(cls): float(probs[i]) for i, cls in enumerate(_label_encoder.classes_)}
        results[src_idx] = PredictResponse(emotion=emotion, confidence=confidence, probabilities=prob_dict)
    return BatchPredictResponse(results=[r for r in results if r is not None])
