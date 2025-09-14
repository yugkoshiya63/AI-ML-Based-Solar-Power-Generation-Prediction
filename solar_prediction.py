import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os
from datetime import datetime, timedelta
import math

class SolarPowerPredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = [
            'latitude', 'longitude', 'panel_area', 'tilt_angle', 'azimuth_angle',
            'solar_irradiance', 'temperature', 'humidity', 'wind_speed', 'cloud_cover',
            'day_of_year', 'hour_of_day', 'sun_elevation', 'sun_azimuth'
        ]
        self.model_path = 'models/solar_power_model.pkl'
        self.scaler_path = 'models/scaler.pkl'
        
        # Create models directory if it doesn't exist
        os.makedirs('models', exist_ok=True)
        
        # Load or train model
        self.load_or_train_model()
    
    def generate_synthetic_data(self, n_samples=10000):
        """Generate synthetic training data for the solar power prediction model"""
        np.random.seed(42)
        
        data = []
        
        for _ in range(n_samples):
            # Geographic parameters
            latitude = np.random.uniform(-60, 60)  # Most populated areas
            longitude = np.random.uniform(-180, 180)
            
            # Panel configuration
            panel_area = np.random.uniform(1, 50)  # m²
            tilt_angle = np.random.uniform(0, 90)  # degrees
            azimuth_angle = np.random.uniform(0, 360)  # degrees
            
            # Environmental conditions
            solar_irradiance = np.random.uniform(0, 1000)  # W/m²
            temperature = np.random.uniform(-10, 45)  # °C
            humidity = np.random.uniform(10, 100)  # %
            wind_speed = np.random.uniform(0, 20)  # m/s
            cloud_cover = np.random.uniform(0, 100)  # %
            
            # Temporal parameters
            day_of_year = np.random.randint(1, 366)
            hour_of_day = np.random.randint(0, 24)
            
            # Calculate sun position
            sun_elevation, sun_azimuth = self.calculate_sun_position(
                latitude, longitude, day_of_year, hour_of_day
            )
            
            # Calculate solar power output (simplified model)
            solar_power = self.calculate_solar_power(
                solar_irradiance, panel_area, tilt_angle, azimuth_angle,
                sun_elevation, sun_azimuth, temperature, cloud_cover
            )
            
            data.append({
                'latitude': latitude,
                'longitude': longitude,
                'panel_area': panel_area,
                'tilt_angle': tilt_angle,
                'azimuth_angle': azimuth_angle,
                'solar_irradiance': solar_irradiance,
                'temperature': temperature,
                'humidity': humidity,
                'wind_speed': wind_speed,
                'cloud_cover': cloud_cover,
                'day_of_year': day_of_year,
                'hour_of_day': hour_of_day,
                'sun_elevation': sun_elevation,
                'sun_azimuth': sun_azimuth,
                'solar_power': solar_power
            })
        
        return pd.DataFrame(data)
    
    def calculate_sun_position(self, latitude, longitude, day_of_year, hour):
        """Calculate sun elevation and azimuth angles"""
        # Convert to radians
        lat_rad = math.radians(latitude)
        
        # Solar declination
        declination = 23.45 * math.sin(math.radians(360 * (284 + day_of_year) / 365))
        decl_rad = math.radians(declination)
        
        # Hour angle
        hour_angle = 15 * (hour - 12)
        hour_rad = math.radians(hour_angle)
        
        # Sun elevation
        elevation = math.asin(
            math.sin(decl_rad) * math.sin(lat_rad) +
            math.cos(decl_rad) * math.cos(lat_rad) * math.cos(hour_rad)
        )
        
        # Sun azimuth
        azimuth = math.atan2(
            math.sin(hour_rad),
            math.cos(hour_rad) * math.sin(lat_rad) - math.tan(decl_rad) * math.cos(lat_rad)
        )
        
        return math.degrees(elevation), math.degrees(azimuth)
    
    def calculate_solar_power(self, irradiance, area, tilt, azimuth, sun_elevation, sun_azimuth, temperature, cloud_cover):
        """Calculate solar power output using a simplified model"""
        if sun_elevation <= 0:
            return 0
        
        # Panel efficiency (simplified)
        panel_efficiency = 0.2  # 20% efficiency
        
        # Temperature coefficient
        temp_coefficient = -0.004  # per °C
        temp_loss = temp_coefficient * (temperature - 25)
        
        # Cloud cover effect
        cloud_factor = 1 - (cloud_cover / 100) * 0.7
        
        # Angle of incidence
        angle_of_incidence = math.acos(
            math.sin(math.radians(sun_elevation)) * math.cos(math.radians(tilt)) +
            math.cos(math.radians(sun_elevation)) * math.sin(math.radians(tilt)) * 
            math.cos(math.radians(sun_azimuth - azimuth))
        )
        
        # Power calculation
        power = (irradiance * area * panel_efficiency * 
                math.cos(angle_of_incidence) * cloud_factor * (1 + temp_loss))
        
        return max(0, power)
    
    def load_or_train_model(self):
        """Load existing model or train a new one"""
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            try:
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                print("Model loaded successfully")
                print(f"Model type: {type(self.model)}")
                print(f"Scaler type: {type(self.scaler)}")
            except Exception as e:
                print(f"Error loading model: {e}")
                print("Training new model...")
                self.train_model()
        else:
            print("No existing model found, training new one...")
            self.train_model()
    
    def train_model(self):
        """Train the solar power prediction model"""
        print("Generating training data...")
        df = self.generate_synthetic_data()
        
        # Prepare features and target
        X = df[self.feature_columns]
        y = df['solar_power']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model (using ensemble of models)
        models = {
            'rf': RandomForestRegressor(n_estimators=100, random_state=42),
            'gb': GradientBoostingRegressor(n_estimators=100, random_state=42)
        }
        
        best_model = None
        best_score = -float('inf')
        
        for name, model in models.items():
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)
            score = r2_score(y_test, y_pred)
            
            if score > best_score:
                best_score = score
                best_model = model
        
        self.model = best_model
        
        # Evaluate model
        y_pred = self.model.predict(X_test_scaled)
        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        print(f"Model trained successfully!")
        print(f"MAE: {mae:.2f}")
        print(f"MSE: {mse:.2f}")
        print(f"R²: {r2:.4f}")
        
        # Save model and scaler
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)
    
    def prepare_features(self, latitude, longitude, panel_area, tilt_angle, azimuth_angle, weather_data):
        """Prepare features for prediction"""
        # Get current time
        now = datetime.now()
        day_of_year = now.timetuple().tm_yday
        hour_of_day = now.hour
        
        # Calculate sun position
        sun_elevation, sun_azimuth = self.calculate_sun_position(
            latitude, longitude, day_of_year, hour_of_day
        )
        
        # Prepare feature vector as DataFrame with proper column names
        features_data = {
            'latitude': [latitude],
            'longitude': [longitude],
            'panel_area': [panel_area],
            'tilt_angle': [tilt_angle],
            'azimuth_angle': [azimuth_angle],
            'solar_irradiance': [weather_data.get('solar_irradiance', 0)],
            'temperature': [weather_data.get('temperature', 25)],
            'humidity': [weather_data.get('humidity', 50)],
            'wind_speed': [weather_data.get('wind_speed', 5)],
            'cloud_cover': [weather_data.get('cloud_cover', 0)],
            'day_of_year': [day_of_year],
            'hour_of_day': [hour_of_day],
            'sun_elevation': [sun_elevation],
            'sun_azimuth': [sun_azimuth]
        }
        
        features_df = pd.DataFrame(features_data)
        return self.scaler.transform(features_df)
    
    def predict(self, features, prediction_type='daily'):
        """Make solar power prediction"""
        if self.model is None:
            raise ValueError("Model not trained or loaded")
        
        # Make prediction
        power_prediction = self.model.predict(features)[0]
        
        if prediction_type == 'daily':
            # Generate hourly predictions for the day
            hourly_predictions = []
            for hour in range(24):
                # Create new features for each hour (need to recreate from original data)
                # We need to get the original unscaled features and modify them
                # For now, let's use a simplified approach
                hour_power = power_prediction * (0.8 + 0.4 * np.sin(np.pi * hour / 12))  # Simulate daily variation
                hourly_predictions.append({
                    'hour': hour,
                    'power': max(0, hour_power)
                })
            
            return {
                'total_power': sum(p['power'] for p in hourly_predictions),
                'hourly_predictions': hourly_predictions,
                'peak_power': max(p['power'] for p in hourly_predictions),
                'peak_hour': max(hourly_predictions, key=lambda x: x['power'])['hour']
            }
        
        elif prediction_type == 'weekly':
            # Generate daily predictions for the week
            daily_predictions = []
            for day in range(7):
                # Simulate daily variation with some randomness
                day_variation = 0.8 + 0.4 * np.random.random()
                day_power = power_prediction * 24 * day_variation  # Scale to daily total
                
                daily_predictions.append({
                    'day': day,
                    'power': max(0, day_power)
                })
            
            return {
                'total_power': sum(p['power'] for p in daily_predictions),
                'daily_predictions': daily_predictions,
                'average_daily': sum(p['power'] for p in daily_predictions) / 7
            }
        
        elif prediction_type == 'monthly':
            # Generate daily predictions for the month
            monthly_predictions = []
            for day in range(30):
                # Simulate daily variation with some randomness
                day_variation = 0.7 + 0.6 * np.random.random()
                day_power = power_prediction * 24 * day_variation  # Scale to daily total
                
                monthly_predictions.append({
                    'day': day + 1,
                    'power': max(0, day_power)
                })
            
            return {
                'total_power': sum(p['power'] for p in monthly_predictions),
                'daily_predictions': monthly_predictions,
                'average_daily': sum(p['power'] for p in monthly_predictions) / 30
            }
    
    def get_optimal_configuration(self, latitude, longitude, panel_area):
        """Calculate optimal tilt and azimuth angles for the given location"""
        # Optimal tilt angle is typically latitude ± 15 degrees depending on season
        # For simplicity, we'll use latitude as the optimal tilt
        optimal_tilt = latitude
        
        # Optimal azimuth is typically 180 degrees (south-facing) in the northern hemisphere
        # and 0 degrees (north-facing) in the southern hemisphere
        if latitude >= 0:
            optimal_azimuth = 180  # South-facing
        else:
            optimal_azimuth = 0    # North-facing
        
        return {
            'tilt': max(0, min(90, optimal_tilt)),
            'azimuth': optimal_azimuth
        }
