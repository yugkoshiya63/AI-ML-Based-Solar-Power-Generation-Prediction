import requests
import json
import math
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

class WeatherDataProvider:
    def __init__(self):
        # Using OpenWeatherMap API (free tier)
        self.api_key = os.getenv('OPENWEATHER_API_KEY', 'demo_key')
        self.base_url = 'https://api.openweathermap.org/data/2.5'
        
        # Fallback to demo data if no API key
        self.use_demo_data = self.api_key == 'demo_key'
    
    def get_weather_data(self, latitude, longitude):
        """Get current weather data for the given coordinates"""
        if self.use_demo_data:
            return self.get_demo_weather_data(latitude, longitude)
        
        try:
            # Get current weather
            current_url = f"{self.base_url}/weather"
            params = {
                'lat': latitude,
                'lon': longitude,
                'appid': self.api_key,
                'units': 'metric'
            }
            
            response = requests.get(current_url, params=params, timeout=10)
            response.raise_for_status()
            current_data = response.json()
            
            # Get forecast data
            forecast_url = f"{self.base_url}/forecast"
            response = requests.get(forecast_url, params=params, timeout=10)
            response.raise_for_status()
            forecast_data = response.json()
            
            # Extract relevant data
            weather_data = {
                'temperature': current_data['main']['temp'],
                'humidity': current_data['main']['humidity'],
                'wind_speed': current_data['wind']['speed'],
                'cloud_cover': current_data['clouds']['all'],
                'solar_irradiance': self.estimate_solar_irradiance(
                    current_data['main']['temp'],
                    current_data['clouds']['all'],
                    latitude,
                    datetime.now()
                ),
                'description': current_data['weather'][0]['description'],
                'forecast': self.process_forecast_data(forecast_data)
            }
            
            return weather_data
            
        except Exception as e:
            print(f"Error fetching weather data: {e}")
            return self.get_demo_weather_data(latitude, longitude)
    
    def get_demo_weather_data(self, latitude, longitude):
        """Generate demo weather data for testing"""
        import random
        
        # Simulate seasonal variations
        day_of_year = datetime.now().timetuple().tm_yday
        
        # Temperature varies with latitude and season
        base_temp = 20 - abs(latitude) * 0.5
        seasonal_temp = 10 * math.sin(2 * math.pi * (day_of_year - 80) / 365)
        temperature = base_temp + seasonal_temp + random.uniform(-5, 5)
        
        # Solar irradiance estimation
        solar_irradiance = self.estimate_solar_irradiance(
            temperature, random.uniform(0, 100), latitude, datetime.now()
        )
        
        return {
            'temperature': round(temperature, 1),
            'humidity': random.uniform(30, 90),
            'wind_speed': random.uniform(0, 15),
            'cloud_cover': random.uniform(0, 100),
            'solar_irradiance': solar_irradiance,
            'description': 'Clear sky',
            'forecast': self.generate_demo_forecast()
        }
    
    def estimate_solar_irradiance(self, temperature, cloud_cover, latitude, datetime_obj):
        """Estimate solar irradiance based on weather conditions"""
        import math
        
        # Base irradiance varies with latitude and time of year
        day_of_year = datetime_obj.timetuple().tm_yday
        hour = datetime_obj.hour
        
        # Solar declination
        declination = 23.45 * math.sin(math.radians(360 * (284 + day_of_year) / 365))
        
        # Solar elevation angle
        lat_rad = math.radians(latitude)
        decl_rad = math.radians(declination)
        hour_angle = 15 * (hour - 12)
        hour_rad = math.radians(hour_angle)
        
        elevation = math.asin(
            math.sin(decl_rad) * math.sin(lat_rad) +
            math.cos(decl_rad) * math.cos(lat_rad) * math.cos(hour_rad)
        )
        
        # Base irradiance (clear sky)
        if elevation <= 0:
            base_irradiance = 0
        else:
            base_irradiance = 1000 * math.sin(elevation)
        
        # Cloud cover effect
        cloud_factor = 1 - (cloud_cover / 100) * 0.7
        
        # Temperature effect (simplified)
        temp_factor = 1 - (temperature - 25) * 0.001
        
        irradiance = base_irradiance * cloud_factor * temp_factor
        
        return max(0, irradiance)
    
    def process_forecast_data(self, forecast_data):
        """Process forecast data into a usable format"""
        forecast = []
        
        for item in forecast_data['list'][:8]:  # Next 24 hours (3-hour intervals)
            forecast.append({
                'datetime': item['dt_txt'],
                'temperature': item['main']['temp'],
                'humidity': item['main']['humidity'],
                'wind_speed': item['wind']['speed'],
                'cloud_cover': item['clouds']['all'],
                'description': item['weather'][0]['description']
            })
        
        return forecast
    
    def generate_demo_forecast(self):
        """Generate demo forecast data"""
        forecast = []
        base_time = datetime.now()
        
        for i in range(8):
            forecast_time = base_time + timedelta(hours=i*3)
            forecast.append({
                'datetime': forecast_time.strftime('%Y-%m-%d %H:%M:%S'),
                'temperature': round(20 + i * 2 + (i % 3 - 1) * 3, 1),
                'humidity': round(50 + (i % 4) * 10, 1),
                'wind_speed': round(5 + (i % 2) * 3, 1),
                'cloud_cover': round(30 + (i % 3) * 20, 1),
                'description': 'Clear sky' if i % 2 == 0 else 'Partly cloudy'
            })
        
        return forecast
