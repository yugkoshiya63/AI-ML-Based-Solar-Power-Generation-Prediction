class SolarPowerPredictor {
    constructor() {
        this.chart = null;
        this.currentData = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('predictionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.makePrediction();
        });

        document.getElementById('geocodeBtn').addEventListener('click', () => {
            this.geocodeLocation();
        });

        document.getElementById('exportCsvBtn').addEventListener('click', () => {
            this.exportReport('csv');
        });

        document.getElementById('exportPdfBtn').addEventListener('click', () => {
            this.exportReport('pdf');
        });

        // Auto-fetch weather when coordinates change
        document.getElementById('latitude').addEventListener('change', () => {
            this.fetchWeatherIfCoordinatesComplete();
        });

        document.getElementById('longitude').addEventListener('change', () => {
            this.fetchWeatherIfCoordinatesComplete();
        });
    }

    async geocodeLocation() {
        const location = document.getElementById('location').value;
        if (!location.trim()) {
            this.showError('Please enter a location');
            return;
        }

        try {
            const response = await fetch(`/api/geocode/${encodeURIComponent(location)}`);
            const data = await response.json();

            if (data.success) {
                document.getElementById('latitude').value = data.latitude;
                document.getElementById('longitude').value = data.longitude;
                this.fetchWeather(data.latitude, data.longitude);
            } else {
                this.showError('Location not found. Please try a different location.');
            }
        } catch (error) {
            this.showError('Error geocoding location: ' + error.message);
        }
    }

    async fetchWeatherIfCoordinatesComplete() {
        const lat = document.getElementById('latitude').value;
        const lon = document.getElementById('longitude').value;
        
        if (lat && lon) {
            this.fetchWeather(lat, lon);
        }
    }

    async fetchWeather(latitude, longitude) {
        try {
            const response = await fetch(`/api/weather/${latitude}/${longitude}`);
            const data = await response.json();

            if (data.success) {
                this.displayWeather(data.data);
            }
        } catch (error) {
            console.error('Error fetching weather:', error);
        }
    }

    displayWeather(weatherData) {
        const weatherCard = document.getElementById('weatherCard');
        const weatherInfo = document.getElementById('weatherInfo');
        
        weatherInfo.innerHTML = `
            <div class="weather-item">
                <span><i class="fas fa-thermometer-half weather-icon"></i>Temperature</span>
                <span>${weatherData.temperature}°C</span>
            </div>
            <div class="weather-item">
                <span><i class="fas fa-tint weather-icon"></i>Humidity</span>
                <span>${weatherData.humidity}%</span>
            </div>
            <div class="weather-item">
                <span><i class="fas fa-wind weather-icon"></i>Wind Speed</span>
                <span>${weatherData.wind_speed} m/s</span>
            </div>
            <div class="weather-item">
                <span><i class="fas fa-cloud weather-icon"></i>Cloud Cover</span>
                <span>${weatherData.cloud_cover}%</span>
            </div>
            <div class="weather-item">
                <span><i class="fas fa-sun weather-icon"></i>Solar Irradiance</span>
                <span>${weatherData.solar_irradiance.toFixed(1)} W/m²</span>
            </div>
        `;
        
        weatherCard.style.display = 'block';
    }

    async makePrediction() {
        const latitude = parseFloat(document.getElementById('latitude').value);
        const longitude = parseFloat(document.getElementById('longitude').value);
        const panelArea = parseFloat(document.getElementById('panelArea').value);
        const tiltAngle = parseFloat(document.getElementById('tiltAngle').value);
        const azimuthAngle = parseFloat(document.getElementById('azimuthAngle').value);
        const predictionType = document.getElementById('predictionType').value;

        if (!latitude || !longitude) {
            this.showError('Please enter valid latitude and longitude coordinates');
            return;
        }

        this.showLoading(true);
        this.hideError();

        try {
            const response = await fetch('/api/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    location: {
                        latitude: latitude,
                        longitude: longitude
                    },
                    panel_config: {
                        area: panelArea,
                        tilt: tiltAngle,
                        azimuth: azimuthAngle
                    },
                    prediction_type: predictionType
                })
            });

            const data = await response.json();

            if (data.success) {
                this.currentData = data;
                this.displayResults(data);
            } else {
                this.showError(data.error || 'Prediction failed');
            }
        } catch (error) {
            this.showError('Error making prediction: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    displayResults(data) {
        const results = document.getElementById('results');
        const prediction = data.prediction;
        const optimal = data.optimal_prediction;
        const improvement = data.improvement_percentage;

        // Update summary cards
        document.getElementById('totalPower').textContent = prediction.total_power.toFixed(1);
        document.getElementById('peakPower').textContent = prediction.peak_power ? prediction.peak_power.toFixed(1) : '0';
        document.getElementById('improvement').textContent = improvement.toFixed(1);
        document.getElementById('efficiency').textContent = this.calculateEfficiency(prediction).toFixed(1);

        // Create chart
        this.createChart(prediction);

        // Display recommendations
        this.displayRecommendations(data.optimal_config, improvement);

        results.style.display = 'block';
    }

    createChart(prediction) {
        const ctx = document.getElementById('powerChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }

        let labels, data, title;
        
        if (prediction.hourly_predictions) {
            // Daily chart
            labels = prediction.hourly_predictions.map(h => `${h.hour}:00`);
            data = prediction.hourly_predictions.map(h => h.power);
            title = 'Hourly Power Generation (W)';
        } else if (prediction.daily_predictions) {
            // Weekly/Monthly chart
            labels = prediction.daily_predictions.map(d => `Day ${d.day}`);
            data = prediction.daily_predictions.map(d => d.power);
            title = 'Daily Power Generation (Wh)';
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    data: data,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: title
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Power (W)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: prediction.hourly_predictions ? 'Hour' : 'Day'
                        }
                    }
                }
            }
        });
    }

    displayRecommendations(optimalConfig, improvement) {
        const recommendations = document.getElementById('recommendations');
        
        recommendations.innerHTML = `
            <div class="recommendation-item">
                <h6><i class="fas fa-arrow-up me-2"></i>Optimal Tilt Angle</h6>
                <p>For maximum power generation, set your panel tilt to <strong>${optimalConfig.tilt.toFixed(1)}°</strong></p>
            </div>
            <div class="recommendation-item">
                <h6><i class="fas fa-compass me-2"></i>Optimal Azimuth Angle</h6>
                <p>For maximum power generation, set your panel azimuth to <strong>${optimalConfig.azimuth.toFixed(1)}°</strong></p>
            </div>
            <div class="recommendation-item">
                <h6><i class="fas fa-chart-line me-2"></i>Potential Improvement</h6>
                <p>By optimizing your panel configuration, you could increase power generation by <strong>${improvement.toFixed(1)}%</strong></p>
            </div>
        `;
    }

    calculateEfficiency(prediction) {
        // Simple efficiency calculation based on total power vs theoretical maximum
        const panelArea = parseFloat(document.getElementById('panelArea').value);
        const theoreticalMax = panelArea * 1000 * 0.2; // 1000 W/m² * 20% efficiency
        return (prediction.total_power / theoreticalMax) * 100;
    }

    async exportReport(format) {
        if (!this.currentData) {
            this.showError('No data to export. Please make a prediction first.');
            return;
        }

        try {
            const response = await fetch('/api/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: format,
                    prediction_data: this.currentData.prediction
                })
            });

            const data = await response.json();

            if (data.success) {
                // Create download link
                const link = document.createElement('a');
                link.href = data.report_path;
                link.download = `solar_prediction_report.${format}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                this.showError('Error generating report: ' + data.error);
            }
        } catch (error) {
            this.showError('Error exporting report: ' + error.message);
        }
    }

    showLoading(show) {
        document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
        document.getElementById('results').style.display = show ? 'none' : 'block';
    }

    showError(message) {
        document.getElementById('errorText').textContent = message;
        document.getElementById('errorMessage').style.display = 'block';
    }

    hideError() {
        document.getElementById('errorMessage').style.display = 'none';
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SolarPowerPredictor();
});
