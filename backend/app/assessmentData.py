# backend/app/assessmentData.py
# Holistic mental wellness assessment — covers 10 key dimensions

questions = [
    {
        "id": 1,
        "question": "Over the past week, how often have you felt genuinely happy or at peace?",
        "options": [
            {"text": "Most of the time — I've been feeling really good", "score": 0},
            {"text": "Sometimes — good moments mixed with difficult ones", "score": 1},
            {"text": "Rarely — most days felt heavy or empty", "score": 2},
            {"text": "Almost never — I've been feeling very low", "score": 3},
        ],
    },
    {
        "id": 2,
        "question": "How has your energy and motivation been lately?",
        "options": [
            {"text": "High — I feel motivated and energised most days", "score": 0},
            {"text": "Moderate — I get things done but feel drained at times", "score": 1},
            {"text": "Low — I have to push myself even for simple tasks", "score": 2},
            {"text": "Very low — I feel exhausted and unmotivated almost daily", "score": 3},
        ],
    },
    {
        "id": 3,
        "question": "How well are you sleeping?",
        "options": [
            {"text": "Well — I fall asleep easily and wake up refreshed", "score": 0},
            {"text": "Okay — some nights are rough but generally fine", "score": 1},
            {"text": "Poorly — I struggle to sleep or wake up unrefreshed often", "score": 2},
            {"text": "Very poorly — sleep problems are affecting my daily life", "score": 3},
        ],
    },
    {
        "id": 4,
        "question": "How often have you felt anxious, worried, or on edge?",
        "options": [
            {"text": "Rarely — I feel mostly calm and settled", "score": 0},
            {"text": "Occasionally — some worry but nothing overwhelming", "score": 1},
            {"text": "Often — anxiety disrupts my focus or enjoyment", "score": 2},
            {"text": "Almost constantly — I feel on edge most of the time", "score": 3},
        ],
    },
    {
        "id": 5,
        "question": "How connected do you feel to the people around you?",
        "options": [
            {"text": "Very connected — I have meaningful relationships and support", "score": 0},
            {"text": "Somewhat connected — I have people around but feel a bit distant", "score": 1},
            {"text": "Mostly disconnected — I feel lonely or misunderstood", "score": 2},
            {"text": "Very isolated — I feel alone even around others", "score": 3},
        ],
    },
    {
        "id": 6,
        "question": "How kind and forgiving are you being towards yourself when you make mistakes?",
        "options": [
            {"text": "Very kind — I treat myself with understanding and compassion", "score": 0},
            {"text": "Mostly kind — I try to be, though I sometimes criticise myself", "score": 1},
            {"text": "Often harsh — I tend to blame or be hard on myself", "score": 2},
            {"text": "Very critical — I feel like a failure and struggle to forgive myself", "score": 3},
        ],
    },
    {
        "id": 7,
        "question": "How much stress have you been experiencing from work, school, or responsibilities?",
        "options": [
            {"text": "Little to none — I feel on top of things", "score": 0},
            {"text": "Mild — some pressure but it feels manageable", "score": 1},
            {"text": "High — I feel overwhelmed by my responsibilities often", "score": 2},
            {"text": "Extreme — I feel like I can't cope with what's on my plate", "score": 3},
        ],
    },
    {
        "id": 8,
        "question": "Have you been doing things you enjoy or that bring you a sense of meaning?",
        "options": [
            {"text": "Yes, regularly — I make time for things I love", "score": 0},
            {"text": "Sometimes — life gets busy but I manage to enjoy things", "score": 1},
            {"text": "Rarely — I haven't had the time or desire to do things I enjoy", "score": 2},
            {"text": "Almost never — I feel little joy or purpose in daily life", "score": 3},
        ],
    },
    {
        "id": 9,
        "question": "How well are you taking care of your body (eating, moving, hydrating)?",
        "options": [
            {"text": "Very well — I'm eating, moving, and resting consistently", "score": 0},
            {"text": "Okay — could be better but I'm managing the basics", "score": 1},
            {"text": "Not great — I've been neglecting my physical needs", "score": 2},
            {"text": "Poorly — I've barely been eating, moving, or looking after myself", "score": 3},
        ],
    },
    {
        "id": 10,
        "question": "When life feels hard, how able are you to bounce back or ask for help?",
        "options": [
            {"text": "Quite able — I reach out or find ways to recover", "score": 0},
            {"text": "Sometimes — I manage eventually but it takes effort", "score": 1},
            {"text": "With difficulty — I tend to bottle things up or struggle alone", "score": 2},
            {"text": "Very hard — I feel stuck and unsure how to get through it", "score": 3},
        ],
    },
]

daily_questions = [
    {
        "id": 1,
        "question": "How would you rate your overall mood today?",
        "options": [
            {"text": "Excellent — felt happy and peaceful", "score": 0},
            {"text": "Good — mostly positive", "score": 1},
            {"text": "Neutral — flat or uninspired", "score": 2},
            {"text": "Low — sad, angry, or anxious", "score": 3},
        ],
    },
    {
        "id": 2,
        "question": "How did your physical energy hold up today?",
        "options": [
            {"text": "High — felt active and alert", "score": 0},
            {"text": "Moderate — got through the day but felt tired", "score": 1},
            {"text": "Low — felt sluggish or physically drained", "score": 2},
            {"text": "Exhausted — barely had energy for basics", "score": 3},
        ],
    },
    {
        "id": 3,
        "question": "How did you sleep last night?",
        "options": [
            {"text": "Deeply — woke up fully rested", "score": 0},
            {"text": "Okay — some nights are rough but generally fine", "score": 1},
            {"text": "Toss & turn — struggled to sleep or stay asleep", "score": 2},
            {"text": "Very poorly — slept very little or not at all", "score": 3},
        ],
    },
    {
        "id": 4,
        "question": "How often did you feel stressed or overwhelmed today?",
        "options": [
            {"text": "Not at all — felt calm and in control", "score": 0},
            {"text": "A few times — manageable pressure", "score": 1},
            {"text": "Frequently — stress disrupted my productivity or focus", "score": 2},
            {"text": "Almost constantly — felt completely overwhelmed", "score": 3},
        ],
    },
    {
        "id": 5,
        "question": "Did you connect with someone today (friends, family, colleagues)?",
        "options": [
            {"text": "Yes, deeply — had meaningful conversations", "score": 0},
            {"text": "Yes, briefly — quick chats or messages", "score": 1},
            {"text": "No — stayed to myself mostly", "score": 2},
            {"text": "No, and felt very lonely or isolated", "score": 3},
        ],
    },
    {
        "id": 6,
        "question": "How anxious or worried have you felt throughout the day?",
        "options": [
            {"text": "Hardly at all — felt secure and relaxed", "score": 0},
            {"text": "Mildly — simple worries that passed quickly", "score": 1},
            {"text": "Moderately — worry was hard to shake off", "score": 2},
            {"text": "Severely — constant anxiety or panic", "score": 3},
        ],
    },
    {
        "id": 7,
        "question": "Did you dedicate time to physical self-care today (healthy food, movement, hydration)?",
        "options": [
            {"text": "Yes — ate well, moved, and hydrated", "score": 0},
            {"text": "Somewhat — met the basic needs", "score": 1},
            {"text": "Neglected — skipped meals, inactive, or dehydrated", "score": 2},
            {"text": "Completely ignored — paid no attention to physical health", "score": 3},
        ],
    },
    {
        "id": 8,
        "question": "Did you find a sense of achievement or meaning in what you did today?",
        "options": [
            {"text": "Yes, absolutely — did something meaningful or satisfying", "score": 0},
            {"text": "Yes, slightly — completed some tasks", "score": 1},
            {"text": "No — the day felt repetitive or pointless", "score": 2},
            {"text": "No, felt completely empty or useless", "score": 3},
        ],
    },
]
