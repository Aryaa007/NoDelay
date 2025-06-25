from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
from fastapi.middleware.cors import CORSMiddleware


model = joblib.load("delay_model.pkl")
encoder = joblib.load("time_encoder.pkl")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to ["http://127.0.0.1:5500"] for safety
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#input structure
class DeliveryInput(BaseModel):
    Distance_km: float
    Delivery_Speed: float
    Agent_Rating: float
    Agent_Efficiency: float
    Traffic_Level: int
    Weather_Impact: int
    Weekday: int
    Time_of_Day: str


@app.get("/")
def home():
    return {
        "message": "🚚 NoDelay API is running! Visit /docs to use the delay prediction endpoint."
    }


@app.post("/predict_delay")
def predict_delay(data: DeliveryInput):
    # Encode time_of_day
    print(data)
    time_encoded = encoder.transform([data.Time_of_Day])[0]

    features = np.array([
        data.Distance_km,
        data.Delivery_Speed,
        data.Agent_Rating,
        data.Agent_Efficiency,
        data.Traffic_Level,
        data.Weather_Impact,
        data.Weekday,
        time_encoded
    ]).reshape(1, -1)

    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]

    return {
        "delay_expected": bool(prediction),
        "probability_of_delay": round(float(probability), 4)
    }
