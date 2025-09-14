#!/usr/bin/env python3
"""
Test script for the Solar Power Prediction Platform
"""

import sys
import os

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    
    try:
        import pandas as pd
        print("✓ pandas imported successfully")
    except ImportError as e:
        print(f"✗ pandas import failed: {e}")
        return False
    
    try:
        import numpy as np
        print("✓ numpy imported successfully")
    except ImportError as e:
        print(f"✗ numpy import failed: {e}")
        return False
    
    try:
        from sklearn.ensemble import RandomForestRegressor
        print("✓ scikit-learn imported successfully")
    except ImportError as e:
        print(f"✗ scikit-learn import failed: {e}")
        return False
    
    try:
        import flask
        print("✓ flask imported successfully")
    except ImportError as e:
        print(f"✗ flask import failed: {e}")
        return False
    
    return True

def test_solar_predictor():
    """Test the solar prediction module"""
    print("\nTesting Solar Power Predictor...")
    
    try:
        from solar_prediction import SolarPowerPredictor
        predictor = SolarPowerPredictor()
        print("✓ SolarPowerPredictor initialized successfully")
        
        # Test prediction
        test_features = predictor.prepare_features(
            latitude=40.7128,  # New York
            longitude=-74.0060,
            panel_area=10,
            tilt_angle=30,
            azimuth_angle=180,
            weather_data={
                'solar_irradiance': 800,
                'temperature': 25,
                'humidity': 60,
                'wind_speed': 5,
                'cloud_cover': 20
            }
        )
        
        prediction = predictor.predict(test_features, 'daily')
        print(f"✓ Prediction successful: {prediction['total_power']:.2f} Wh")
        
        # Test optimal configuration
        optimal = predictor.get_optimal_configuration(40.7128, -74.0060, 10)
        print(f"✓ Optimal configuration: tilt={optimal['tilt']:.1f}°, azimuth={optimal['azimuth']:.1f}°")
        
        return True
        
    except Exception as e:
        print(f"✗ Solar prediction test failed: {e}")
        return False

def test_weather_api():
    """Test the weather API module"""
    print("\nTesting Weather API...")
    
    try:
        from weather_api import WeatherDataProvider
        weather = WeatherDataProvider()
        print("✓ WeatherDataProvider initialized successfully")
        
        # Test demo weather data
        weather_data = weather.get_demo_weather_data(40.7128, -74.0060)
        print(f"✓ Weather data retrieved: {weather_data['temperature']}°C, {weather_data['humidity']}% humidity")
        
        return True
        
    except Exception as e:
        print(f"✗ Weather API test failed: {e}")
        return False

def test_report_generator():
    """Test the report generator module"""
    print("\nTesting Report Generator...")
    
    try:
        from report_generator import ReportGenerator
        generator = ReportGenerator()
        print("✓ ReportGenerator initialized successfully")
        
        # Test CSV report generation
        test_data = {
            'total_power': 1000,
            'hourly_predictions': [
                {'hour': 0, 'power': 0},
                {'hour': 12, 'power': 100},
                {'hour': 18, 'power': 50}
            ]
        }
        
        csv_path = generator.generate_csv_report(test_data)
        print(f"✓ CSV report generated: {csv_path}")
        
        return True
        
    except Exception as e:
        print(f"✗ Report generator test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 50)
    print("Solar Power Prediction Platform - System Test")
    print("=" * 50)
    
    all_tests_passed = True
    
    # Test imports
    if not test_imports():
        print("\n❌ Import tests failed. Please install required packages:")
        print("pip install -r requirements.txt")
        all_tests_passed = False
    
    # Test solar predictor
    if not test_solar_predictor():
        all_tests_passed = False
    
    # Test weather API
    if not test_weather_api():
        all_tests_passed = False
    
    # Test report generator
    if not test_report_generator():
        all_tests_passed = False
    
    print("\n" + "=" * 50)
    if all_tests_passed:
        print("✅ All tests passed! The system is ready to use.")
        print("\nTo start the application:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Run the app: python app.py")
        print("3. Open browser: http://localhost:5000")
    else:
        print("❌ Some tests failed. Please check the errors above.")
    print("=" * 50)

if __name__ == "__main__":
    main()
