# backend/routes/assessmentRoutes.py

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.assessmentData import questions

router = APIRouter()  # ✅ THIS LINE WAS MISSING

class AssessmentAnswers(BaseModel):
    answers: List[str]

@router.get("/questions")
async def get_assessment_questions():
    questions_for_client = [
        {
            "id": q["id"],
            "question": q["question"],
            "options": [{"text": opt["text"]} for opt in q["options"]],
        }
        for q in questions
    ]
    return questions_for_client


@router.post("/submit")
async def submit_assessment(assessment_answers: AssessmentAnswers):
    user_answers = assessment_answers.answers

    if not user_answers or len(user_answers) != len(questions):
        return {"error": "Incomplete assessment data."}

    total_score = 0
    for i, user_answer_text in enumerate(user_answers):
        question = questions[i]
        for option in question["options"]:
            if option["text"] == user_answer_text:
                total_score += option["score"]
                break

    # Your new scoring logic
    if total_score <= 5:
        result = {
            "mood": "Feeling Positive 🙂",
            "description": "Your responses suggest you're feeling quite happy and balanced. That's wonderful to see.",
            "suggestion": "Keep the momentum going! Maybe share your positive energy with a friend or spend time on a hobby you love today."
        }
    elif total_score <= 12:
        result = {
            "mood": "Feeling a Bit Sad 😕",
            "description": "It seems like you might be feeling down or stressed. It's completely normal and okay to have these feelings.",
            "suggestion": "Try a simple 5-minute guided meditation or listen to your favorite uplifting music. Small, kind actions can make a big difference."
        }
    else: # Score is 13 or more
        result = {
            "mood": "Feeling Overwhelmed 😔",
            "description": "Your answers indicate you might be going through a tough time and feeling quite down. Please remember to be gentle with yourself.",
            "suggestion": "Consider talking to a trusted friend or family member about how you're feeling. Remember, reaching out for support is a sign of strength."
        }
    
    return result