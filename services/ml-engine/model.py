import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta

class DecayPredictor:
    def __init__(self):
        # We initialize a mock Linear Regression model.
        # In production, this would load a pre-trained .pkl file.
        self.model = LinearRegression()
        
        # Mock Training Data: [Temperature (C), Humidity (%), Hours in Transit]
        # Target: Resulting biological decay multiplier
        X_train = np.array([
            [4.0, 85.0, 10.0],
            [12.0, 70.0, 5.0],
            [25.0, 60.0, 2.0],
            [3.0, 90.0, 20.0]
        ])
        y_train = np.array([1.0, 1.8, 3.5, 0.9]) # Target decay multipliers
        
        self.model.fit(X_train, y_train)

    def predict_hours_until_spoilage(self, current_ttl_hours: float, temp_c: float, humidity: float, hours_transit: float) -> float:
        """
        Predicts exactly how many hours remain until the asset breaches Premium Tier 1 bounds
        based on the active IoT environmental state.
        """
        # 1. Predict the active decay multiplier
        X_live = np.array([[temp_c, humidity, hours_transit]])
        predicted_multiplier = self.model.predict(X_live)[0]
        
        # Bound the multiplier to reality (can't be negative)
        predicted_multiplier = max(1.0, predicted_multiplier)
        
        # 2. Calculate projected real-world TTL
        # If the environment is harsh, the TTL shrinks rapidly.
        projected_ttl = current_ttl_hours / predicted_multiplier
        
        return round(projected_ttl, 2)
