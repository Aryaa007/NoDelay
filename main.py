from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

# Load model & encoder
model = joblib.load("delay_model.pkl")
encoder = joblib.load("time_encoder.pkl")

app = FastAPI()

# Define the input structure
class DeliveryInput(BaseModel):
    Distance_km: float
    Delivery_Speed: float
    Agent_Rating: float
    Agent_Efficiency: float
    Traffic_Level: int
    Weather_Impact: int
    Weekday: int
    Time_of_Day: str

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
