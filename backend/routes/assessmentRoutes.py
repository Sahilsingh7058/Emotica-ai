# backend/routes/assessmentRoutes.py
# Smart multi-dimensional recommendation engine

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
from app.assessmentData import questions, daily_questions

router = APIRouter()

# ── Dimension weights ──────────────────────────────────────────────────────────
# Maps question index → dimension name
DIMENSION_MAP = {
    0: "emotional",    # happiness / peace
    1: "energy",       # motivation / energy
    2: "sleep",        # sleep quality
    3: "anxiety",      # anxiety / worry
    4: "social",       # connection / isolation
    5: "self_compassion",  # self-kindness
    6: "stress",       # work/school stress
    7: "purpose",      # meaning / joy
    8: "physical",     # physical self-care
    9: "resilience",   # coping ability
}

# Each app and the dimensions it addresses, with relative effectiveness weights
APP_PROFILES: Dict[str, Dict] = {
    "breathing": {
        "name": "Breathing App",
        "targets": {"anxiety": 0.9, "stress": 0.8, "emotional": 0.5, "resilience": 0.4},
        "emoji": "🌬️",
    },
    "meditation": {
        "name": "Meditation Timer",
        "targets": {"anxiety": 0.8, "stress": 0.7, "emotional": 0.6, "purpose": 0.5},
        "emoji": "🧘",
    },
    "sounds": {
        "name": "Stress Relief Sounds",
        "targets": {"anxiety": 0.7, "stress": 0.8, "sleep": 0.7, "emotional": 0.4},
        "emoji": "🎶",
    },
    "journal": {
        "name": "Journal App",
        "targets": {"emotional": 0.9, "purpose": 0.7, "self_compassion": 0.6, "resilience": 0.5},
        "emoji": "✍️",
    },
    "sleep": {
        "name": "Sleep Stories",
        "targets": {"sleep": 1.0, "anxiety": 0.5, "stress": 0.4},
        "emoji": "🌙",
    },
    "habits": {
        "name": "Habit Builder",
        "targets": {"energy": 0.8, "physical": 0.7, "purpose": 0.6, "resilience": 0.5},
        "emoji": "📅",
    },
    "mood": {
        "name": "Mood Tracker",
        "targets": {"emotional": 0.7, "self_compassion": 0.5, "resilience": 0.4},
        "emoji": "😊",
    },
    "gratitude": {
        "name": "Gratitude Log",
        "targets": {"emotional": 0.8, "purpose": 0.7, "self_compassion": 0.6, "social": 0.4},
        "emoji": "💖",
    },
    "affirmations": {
        "name": "Positive Affirmations",
        "targets": {"self_compassion": 0.9, "emotional": 0.7, "resilience": 0.5},
        "emoji": "✨",
    },
    "focus": {
        "name": "Focus Booster",
        "targets": {"energy": 0.8, "stress": 0.5, "purpose": 0.6},
        "emoji": "⏳",
    },
    "energy": {
        "name": "Energy Check",
        "targets": {"energy": 0.7, "physical": 0.6, "resilience": 0.4},
        "emoji": "⚡",
    },
    "kindness": {
        "name": "Kindness Journal",
        "targets": {"social": 0.9, "purpose": 0.6, "self_compassion": 0.5, "emotional": 0.4},
        "emoji": "🤝",
    },
}

# ── Scoring helpers ────────────────────────────────────────────────────────────

def score_answers(user_answers: List[str]) -> Dict[str, int]:
    """Return per-dimension raw score (0-3) and total."""
    dimension_scores: Dict[str, int] = {d: 0 for d in DIMENSION_MAP.values()}
    total = 0
    for i, answer_text in enumerate(user_answers):
        for option in questions[i]["options"]:
            if option["text"] == answer_text:
                s = option["score"]
                dimension_scores[DIMENSION_MAP[i]] += s
                total += s
                break
    dimension_scores["total"] = total
    return dimension_scores


def compute_recommendations(dim_scores: Dict[str, int]) -> List[Dict]:
    """
    Score each app based on how well it targets the user's pain points.
    Pain = high score on a dimension (0 = great, 3 = poor).
    Apps targeting dimensions with high scores get boosted.
    """
    app_scores: Dict[str, float] = {}

    for app_id, profile in APP_PROFILES.items():
        app_score = 0.0
        for dimension, effectiveness in profile["targets"].items():
            pain = dim_scores.get(dimension, 0)
            app_score += pain * effectiveness

        app_scores[app_id] = app_score

    # Sort by score descending
    sorted_apps = sorted(app_scores.items(), key=lambda x: x[1], reverse=True)

    # Compute confidence (0–100%) relative to the top score
    top_score = sorted_apps[0][1] if sorted_apps else 1
    recommendations = []
    for rank, (app_id, score) in enumerate(sorted_apps[:3]):
        confidence = round((score / max(top_score, 0.01)) * 100) if rank == 0 else round((score / max(top_score, 0.01)) * 85)
        confidence = max(min(confidence, 99), 30)
        profile = APP_PROFILES[app_id]
        recommendations.append({
            "app_id": app_id,
            "app_name": profile["name"],
            "emoji": profile["emoji"],
            "confidence": confidence,
            "rank": rank + 1,
        })

    return recommendations


def mood_from_score(total: int) -> Dict:
    if total <= 7:
        return {
            "mood": "Thriving",
            "description": "You're doing really well across most areas of your wellbeing. Your answers show a strong foundation of emotional health, energy, and connection.",
            "color": "#10b981",
        }
    elif total <= 15:
        return {
            "mood": "Doing Okay",
            "description": "You're managing reasonably well, but there are a few areas where you could use a little extra care and support.",
            "color": "#f59e0b",
        }
    elif total <= 22:
        return {
            "mood": "Feeling Strained",
            "description": "It sounds like things have been a bit tough lately. Several areas of your wellbeing are under some pressure right now.",
            "color": "#3b82f6",
        }
    else:
        return {
            "mood": "Struggling",
            "description": "Your answers suggest you're going through a genuinely difficult time. Please know that what you're feeling is valid, and you deserve support.",
            "color": "#a855f7",
        }


def generate_suggestion(dim_scores: Dict[str, int], top_app_id: str) -> str:
    """Generate a human, personalised suggestion based on the worst dimensions."""
    worst = sorted(
        [(d, dim_scores.get(d, 0)) for d in DIMENSION_MAP.values()],
        key=lambda x: x[1], reverse=True
    )[:2]
    worst_dims = [w[0] for w in worst]

    tip_map = {
        "sleep": "Your sleep appears to be suffering the most — start with the Sleep Stories app to help your mind wind down.",
        "anxiety": "Anxiety seems to be your biggest challenge right now. Even 2 minutes of box breathing can interrupt the cycle.",
        "stress": "You're under significant stress. The Stress Relief Sounds app can create an instant calm atmosphere around you.",
        "emotional": "Your emotional wellbeing needs attention. Journalling your thoughts — even 3 sentences — can bring surprising relief.",
        "energy": "Low energy is dragging you down. The Habit Builder can help you add one small energising routine at a time.",
        "social": "Feeling disconnected is hard. The Kindness Journal can help you rebuild a sense of connection one small act at a time.",
        "self_compassion": "You're being hard on yourself. Daily affirmations can gently shift your inner dialogue over time.",
        "purpose": "A lack of meaning can feel heavy. Try the Gratitude Log to rediscover small things that matter.",
        "physical": "Taking care of your body is falling behind. Even a 10-minute walk can shift your mood meaningfully.",
        "resilience": "Bouncing back feels hard right now. The Meditation Timer can help you build a quiet, daily reset practice.",
    }

    primary = worst_dims[0]
    return tip_map.get(primary, f"The {APP_PROFILES.get(top_app_id, {}).get('name', 'wellness')} app is a great starting point for where you are right now.")


# ── Route handlers ─────────────────────────────────────────────────────────────

class AssessmentAnswers(BaseModel):
    answers: List[str]


@router.get("/questions")
async def get_assessment_questions():
    return [
        {
            "id": q["id"],
            "question": q["question"],
            "options": [{"text": opt["text"]} for opt in q["options"]],
        }
        for q in questions
    ]


@router.post("/submit")
async def submit_assessment(assessment_answers: AssessmentAnswers):
    user_answers = assessment_answers.answers

    if not user_answers or len(user_answers) != len(questions):
        return {"error": "Incomplete assessment data."}

    # Score per dimension
    dim_scores = score_answers(user_answers)
    total = dim_scores.pop("total")

    # Mood label + description
    mood_data = mood_from_score(total)

    # Smart multi-recommendation
    recommendations = compute_recommendations(dim_scores)
    top = recommendations[0] if recommendations else None

    # Human suggestion text
    suggestion = generate_suggestion(dim_scores, top["app_id"] if top else "breathing")

    return {
        "mood": mood_data["mood"],
        "description": mood_data["description"],
        "color": mood_data["color"],
        "suggestion": suggestion,
        "suggestedAppId": top["app_id"] if top else "breathing",
        "totalScore": total,
        "recommendations": recommendations,
        "dimensionScores": dim_scores,
    }


# ── Daily Check-in ────────────────────────────────────────────────────────────

DIMENSION_MAP_DAILY = {
    0: "emotional",
    1: "energy",
    2: "sleep",
    3: "stress",
    4: "social",
    5: "anxiety",
    6: "physical",
    7: "purpose",
}

def score_daily_answers(user_answers: List[str]) -> Dict[str, int]:
    """Return per-dimension raw score (0-3) and total for daily assessment."""
    dimension_scores: Dict[str, int] = {d: 0 for d in DIMENSION_MAP_DAILY.values()}
    total = 0
    for i, answer_text in enumerate(user_answers):
        for option in daily_questions[i]["options"]:
            if option["text"] == answer_text:
                s = option["score"]
                dimension_scores[DIMENSION_MAP_DAILY[i]] += s
                total += s
                break
    dimension_scores["total"] = total
    return dimension_scores


@router.get("/daily-questions")
async def get_daily_assessment_questions():
    return [
        {
            "id": q["id"],
            "question": q["question"],
            "options": [{"text": opt["text"]} for opt in q["options"]],
        }
        for q in daily_questions
    ]


@router.post("/daily-submit")
async def submit_daily_assessment(assessment_answers: AssessmentAnswers):
    user_answers = assessment_answers.answers

    if not user_answers or len(user_answers) != len(daily_questions):
        return {"error": "Incomplete assessment data."}

    # Score per dimension
    dim_scores = score_daily_answers(user_answers)
    total = dim_scores.pop("total")

    # Scale raw total (max 24) to standard 30-point scale
    scaled_total = round((total / 24) * 30)

    # Mood label + description
    mood_data = mood_from_score(scaled_total)

    # Smart multi-recommendation
    recommendations = compute_recommendations(dim_scores)
    top = recommendations[0] if recommendations else None

    # Human suggestion text
    suggestion = generate_suggestion(dim_scores, top["app_id"] if top else "breathing")

    return {
        "mood": mood_data["mood"],
        "description": mood_data["description"],
        "color": mood_data["color"],
        "suggestion": suggestion,
        "suggestedAppId": top["app_id"] if top else "breathing",
        "totalScore": scaled_total,
        "recommendations": recommendations,
        "dimensionScores": dim_scores,
    }
