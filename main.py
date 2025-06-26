from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
from fastapi.middleware.cors import CORSMiddleware


model = joblib.load("delay_model.pkl")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#input structure
class DeliveryInput(BaseModel):
    Distance_km: float
    Agent_Rating: float
    Traffic_Level: int
    Weather_Impact: int
    Weekday: int


@app.get("/")
def home():
    return {
        "message": "🚚 NoDelay API is running! Visit /docs to use the delay prediction endpoint."
    }


@app.post("/predict_delay")
def predict_delay(data: DeliveryInput):

    features = np.array([
        data.Distance_km,
        data.Agent_Rating,
        data.Traffic_Level,
        data.Weather_Impact,
        data.Weekday,
    ]).reshape(1, -1)

    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]

    return {
        "delay_expected": bool(prediction),
        "probability_of_delay": round(float(probability), 4)
    }
