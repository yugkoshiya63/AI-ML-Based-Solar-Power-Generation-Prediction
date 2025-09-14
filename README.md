# Solar Power Generation Prediction Platform

An AI/ML-powered platform that predicts solar power generation based on environmental and physical parameters.

## Features

- **Solar Power Prediction**: ML model that predicts electricity generation from solar panels
- **Multiple Factors**: Considers sunlight, geographic location, panel configuration, weather conditions
- **Optimal Recommendations**: Suggests best panel orientation and placement
- **Interactive Dashboard**: User-friendly web interface for input and visualization
- **Data Export**: Generate CSV and PDF reports
- **Real-time Weather**: Integration with weather APIs for current conditions

## Quick Start

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up Environment Variables**
   - Copy `.env` file and add your OpenWeatherMap API key
   - Get free API key from https://openweathermap.org/api

3. **Run the Application**
   ```bash
   python app.py
   ```

4. **Access the Dashboard**
   - Open your browser and go to `http://localhost:8080`
   - Enter your location and panel configuration
   - View predictions and recommendations

## Usage

### Input Parameters
- **Location**: City name, address, or coordinates (latitude/longitude)
- **Panel Configuration**: Area (m²), tilt angle (°), azimuth angle (°)
- **Prediction Period**: Daily, weekly, or monthly forecasts

### Output
- **Power Predictions**: Hourly/daily power generation estimates
- **Optimal Configuration**: Recommended tilt and azimuth angles
- **Improvement Analysis**: Potential power increase with optimization
- **Weather Data**: Current environmental conditions
- **Reports**: Exportable CSV and PDF reports

## Technical Details

### ML Model
- **Algorithm**: Random Forest and Gradient Boosting ensemble
- **Features**: Geographic, environmental, temporal, and panel configuration data
- **Training**: Synthetic data generation with realistic solar physics
- **Retraining**: Model updates as new data becomes available

### Data Sources
- **Geographic**: User-provided coordinates or geocoded addresses
- **Weather**: OpenWeatherMap API for real-time conditions
- **Solar**: Calculated sun position and irradiance estimates

### Architecture
- **Backend**: Flask API with ML prediction engine
- **Frontend**: Responsive HTML/CSS/JavaScript dashboard
- **Visualization**: Chart.js for interactive graphs
- **Reports**: ReportLab for PDF generation

## API Endpoints

- `GET /` - Main dashboard
- `POST /api/predict` - Solar power prediction
- `GET /api/weather/<lat>/<lon>` - Weather data
- `GET /api/geocode/<location>` - Location geocoding
- `POST /api/report` - Generate reports

## Requirements

- Python 3.8+
- Flask 2.3+
- scikit-learn 1.3+
- pandas 2.1+
- numpy 1.24+

## License

MIT License - Feel free to use and modify for your projects.
