from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime, timedelta
import requests
from geopy.geocoders import Nominatim
import pytz
from solar_prediction import SolarPowerPredictor
from weather_api import WeatherDataProvider
from report_generator import ReportGenerator

app = Flask(__name__)
CORS(app)

# Initialize components
solar_predictor = SolarPowerPredictor()
weather_provider = WeatherDataProvider()
report_generator = ReportGenerator()

@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/predict')
def predict():
    return render_template('predict.html')

@app.route('/analytics')
def analytics():
    return render_template('analytics.html')

@app.route('/api/predict', methods=['POST'])
def predict_solar_power():
    try:
        data = request.json
        
        # Validate required parameters
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
            
        location = data.get('location', {})
        panel_config = data.get('panel_config', {})
        prediction_type = data.get('prediction_type', 'daily')
        
        # Validate location data
        if not location.get('latitude') or not location.get('longitude'):
            return jsonify({'success': False, 'error': 'Latitude and longitude are required'}), 400
            
        # Validate panel config
        if not panel_config.get('area') or panel_config['area'] <= 0:
            return jsonify({'success': False, 'error': 'Valid panel area is required'}), 400
            
        # Get weather data
        weather_data = weather_provider.get_weather_data(
            location['latitude'], 
            location['longitude']
        )
        
        # Prepare features for ML model
        features = solar_predictor.prepare_features(
            latitude=location['latitude'],
            longitude=location['longitude'],
            panel_area=panel_config['area'],
            tilt_angle=panel_config.get('tilt', 30),
            azimuth_angle=panel_config.get('azimuth', 180),
            weather_data=weather_data
        )
        
        # Make prediction
        prediction = solar_predictor.predict(features, prediction_type)
        
        # Get optimal configuration
        optimal_config = solar_predictor.get_optimal_configuration(
            location['latitude'], 
            location['longitude'],
            panel_config['area']
        )
        
        # Calculate optimal prediction
        optimal_features = solar_predictor.prepare_features(
            latitude=location['latitude'],
            longitude=location['longitude'],
            panel_area=panel_config['area'],
            tilt_angle=optimal_config['tilt'],
            azimuth_angle=optimal_config['azimuth'],
            weather_data=weather_data
        )
        
        optimal_prediction = solar_predictor.predict(optimal_features, prediction_type)
        
        # Calculate improvement percentage safely
        improvement = 0
        if prediction['total_power'] > 0:
            improvement = ((optimal_prediction['total_power'] - prediction['total_power']) / prediction['total_power'] * 100)
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'optimal_config': optimal_config,
            'optimal_prediction': optimal_prediction,
            'improvement_percentage': improvement
        })
        
    except Exception as e:
        print(f"Prediction error: {str(e)}")  # Log the error for debugging
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/weather/<lat>/<lon>')
def get_weather(lat, lon):
    try:
        weather_data = weather_provider.get_weather_data(float(lat), float(lon))
        return jsonify({'success': True, 'data': weather_data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/geocode/<location>')
def geocode_location(location):
    try:
        geolocator = Nominatim(user_agent="solar_predictor")
        location_data = geolocator.geocode(location)
        
        if location_data:
            return jsonify({
                'success': True,
                'latitude': location_data.latitude,
                'longitude': location_data.longitude,
                'address': location_data.address
            })
        else:
            return jsonify({'success': False, 'error': 'Location not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/report', methods=['POST'])
def generate_report():
    try:
        data = request.json
        report_type = data.get('type', 'csv')  # csv or pdf
        prediction_data = data.get('prediction_data')
        
        if report_type == 'csv':
            report_path = report_generator.generate_csv_report(prediction_data)
        else:
            report_path = report_generator.generate_pdf_report(prediction_data)
        
        return jsonify({
            'success': True,
            'report_path': report_path
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
