from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from routes import assessmentRoutes
from routes import predictionRoutes

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    assessmentRoutes.router,
    prefix="/api/assessment",
    tags=["Assessment"],
)

app.include_router(
    predictionRoutes.router,
    tags=["Prediction"],
)

class User(BaseModel):
    name: str
    email: str

@app.get("/api/users")
async def get_users():
    users = await users_collection.find().to_list(100)
    for user in users:
        user["_id"] = str(user["_id"])
    return users

@app.post("/api/users")
async def create_user(user: User):
    result = await users_collection.insert_one(user.dict())
    return {"id": str(result.inserted_id)}