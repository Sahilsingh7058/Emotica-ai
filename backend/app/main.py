# backend/app/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from ..database.connection import users_collection # import your collection

# You'll need to configure CORS for your Next.js app to be able to make requests
app = FastAPI()

origins = [
    "http://localhost:3000",  # Your Next.js dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
    name: str
    email: str

@app.get("/api/users")
async def get_users():
    users = await users_collection.find().to_list(100)
    return users

@app.post("/api/users")
async def create_user(user: User):
    result = await users_collection.insert_one(user.dict())
    return {"id": str(result.inserted_id)}