// Prediction Page JavaScript
class SolarPredictionApp {
    constructor() {
        this.chart = null;
        this.currentData = null;
        this.predefinedLocations = this.getPredefinedLocations();
        this.initializeApp();
    }

    initializeApp() {
        this.initializeEventListeners();
        this.populateLocationGrid();
        this.setDefaultDate();
        this.initializeLocationTabs();
    }

    getPredefinedLocations() {
        return [
            { name: "New York", country: "USA", lat: 40.7128, lon: -74.0060 },
            { name: "London", country: "UK", lat: 51.5074, lon: -0.1278 },
            { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
            { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
            { name: "Berlin", country: "Germany", lat: 52.5200, lon: 13.4050 },
            { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
            { name: "Mumbai", country: "India", lat: 19.0760, lon: 72.8777 },
            { name: "Dubai", country: "UAE", lat: 25.2048, lon: 55.2708 },
            { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198 },
            { name: "Los Angeles", country: "USA", lat: 34.0522, lon: -118.2437 },
            { name: "Toronto", country: "Canada", lat: 43.6532, lon: -79.3832 },
            { name: "São Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333 },
            { name: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6176 },
            { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357 },
            { name: "Cape Town", country: "South Africa", lat: -33.9249, lon: 18.4241 },
            { name: "Bangkok", country: "Thailand", lat: 13.7563, lon: 100.5018 },
            { name: "Seoul", country: "South Korea", lat: 37.5665, lon: 126.9780 },
            { name: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332 },
            { name: "Buenos Aires", country: "Argentina", lat: -34.6118, lon: -58.3960 },
            { name: "Istanbul", country: "Turkey", lat: 41.0082, lon: 28.9784 }
        ];
    }

    initializeEventListeners() {
        // Form submission
        document.getElementById('predictionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.makePrediction();
        });

        // Location search
        document.getElementById('locationSearch').addEventListener('input', (e) => {
            this.filterLocations(e.target.value);
        });

        // Current location button
        document.getElementById('getCurrentLocation').addEventListener('click', () => {
            this.getCurrentLocation();
        });

        // Export buttons
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

    initializeLocationTabs() {
        const tabs = document.querySelectorAll('.location-tab');
        const contents = document.querySelectorAll('.location-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                // Update tab states
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update content visibility
                contents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${targetTab}-tab`) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }

    populateLocationGrid() {
        const grid = document.getElementById('locationGrid');
        grid.innerHTML = '';

        this.predefinedLocations.forEach(location => {
            const locationItem = document.createElement('div');
            locationItem.className = 'location-item';
            locationItem.innerHTML = `
                <h6>${location.name}</h6>
                <p>${location.country}</p>
            `;
            
            locationItem.addEventListener('click', (event) => {
                this.selectLocation(location, event);
            });
            
            grid.appendChild(locationItem);
        });
    }

    filterLocations(searchTerm) {
        const locationItems = document.querySelectorAll('.location-item');
        const term = searchTerm.toLowerCase();

        locationItems.forEach(item => {
            const name = item.querySelector('h6').textContent.toLowerCase();
            const country = item.querySelector('p').textContent.toLowerCase();
            
            if (name.includes(term) || country.includes(term)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    selectLocation(location, event) {
        // Update selected location
        document.querySelectorAll('.location-item').forEach(item => {
            item.classList.remove('selected');
        });
        event.target.closest('.location-item').classList.add('selected');

        // Update coordinates
        document.getElementById('latitude').value = location.lat;
        document.getElementById('longitude').value = location.lon;

        // Fetch weather for selected location
        this.fetchWeather(location.lat, location.lon);
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser.');
            return;
        }

        const button = document.getElementById('getCurrentLocation');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Getting Location...';
        button.disabled = true;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                document.getElementById('latitude').value = lat.toFixed(6);
                document.getElementById('longitude').value = lon.toFixed(6);
                
                this.fetchWeather(lat, lon);
                
                button.innerHTML = originalText;
                button.disabled = false;
            },
            (error) => {
                this.showError('Unable to retrieve your location. Please enter coordinates manually.');
                button.innerHTML = originalText;
                button.disabled = false;
            }
        );
    }

    async fetchWeatherIfCoordinatesComplete() {
        const lat = document.getElementById('latitude').value;
        const lon = document.getElementById('longitude').value;
        
        if (lat && lon && !isNaN(lat) && !isNaN(lon)) {
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

        // Validation
        if (!this.validateInputs(latitude, longitude, panelArea, tiltAngle, azimuthAngle)) {
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

    validateInputs(latitude, longitude, panelArea, tiltAngle, azimuthAngle) {
        if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
            this.showError('Please select a valid location or enter coordinates');
            return false;
        }

        if (latitude < -90 || latitude > 90) {
            this.showError('Latitude must be between -90 and 90 degrees');
            return false;
        }

        if (longitude < -180 || longitude > 180) {
            this.showError('Longitude must be between -180 and 180 degrees');
            return false;
        }

        if (!panelArea || panelArea <= 0) {
            this.showError('Panel area must be greater than 0');
            return false;
        }

        if (tiltAngle < 0 || tiltAngle > 90) {
            this.showError('Tilt angle must be between 0 and 90 degrees');
            return false;
        }

        if (azimuthAngle < 0 || azimuthAngle > 360) {
            this.showError('Azimuth angle must be between 0 and 360 degrees');
            return false;
        }

        return true;
    }

    displayResults(data) {
        const resultsArea = document.getElementById('resultsArea');
        const welcomeState = document.getElementById('welcomeState');
        
        welcomeState.style.display = 'none';
        resultsArea.style.display = 'block';

        const prediction = data.prediction;
        const optimal = data.optimal_prediction;
        const improvement = data.improvement_percentage;

        // Update summary cards
        this.animateValue('totalPower', 0, prediction.total_power, 2000);
        this.animateValue('peakPower', 0, prediction.peak_power || 0, 2000);
        this.animateValue('improvement', 0, improvement, 2000);
        this.animateValue('efficiency', 0, this.calculateEfficiency(prediction), 2000);

        // Create chart
        this.createChart(prediction);

        // Display recommendations
        this.displayRecommendations(data.optimal_config, improvement);
    }

    animateValue(elementId, start, end, duration) {
        const element = document.getElementById(elementId);
        const startTime = performance.now();
        const isPercentage = elementId === 'improvement' || elementId === 'efficiency';
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (end - start) * this.easeOutCubic(progress);
            element.textContent = current.toFixed(1) + (isPercentage ? '%' : '');
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
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
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#00d4ff',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        },
                        title: {
                            display: true,
                            text: 'Power (W)',
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        },
                        title: {
                            display: true,
                            text: prediction.hourly_predictions ? 'Hour' : 'Day',
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    displayRecommendations(optimalConfig, improvement) {
        const recommendations = document.getElementById('recommendations');
        
        recommendations.innerHTML = `
            <div class="recommendation-item">
                <h6><i class="fas fa-arrow-up"></i>Optimal Tilt Angle</h6>
                <p>For maximum power generation, set your panel tilt to <strong>${optimalConfig.tilt.toFixed(1)}°</strong></p>
            </div>
            <div class="recommendation-item">
                <h6><i class="fas fa-compass"></i>Optimal Azimuth Angle</h6>
                <p>For maximum power generation, set your panel azimuth to <strong>${optimalConfig.azimuth.toFixed(1)}°</strong></p>
            </div>
            <div class="recommendation-item">
                <h6><i class="fas fa-chart-line"></i>Potential Improvement</h6>
                <p>By optimizing your panel configuration, you could increase power generation by <strong>${improvement.toFixed(1)}%</strong></p>
            </div>
        `;
    }

    calculateEfficiency(prediction) {
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
        const loadingState = document.getElementById('loadingState');
        const resultsArea = document.getElementById('resultsArea');
        const welcomeState = document.getElementById('welcomeState');
        
        if (show) {
            loadingState.style.display = 'flex';
            resultsArea.style.display = 'none';
            welcomeState.style.display = 'none';
            
            // Animate loading steps
            this.animateLoadingSteps();
        } else {
            loadingState.style.display = 'none';
        }
    }

    animateLoadingSteps() {
        const steps = document.querySelectorAll('.loading-steps .step');
        let currentStep = 0;
        
        const animateStep = () => {
            steps.forEach((step, index) => {
                step.classList.remove('active');
                if (index <= currentStep) {
                    step.classList.add('active');
                }
            });
            
            currentStep++;
            if (currentStep < steps.length) {
                setTimeout(animateStep, 1000);
            }
        };
        
        animateStep();
    }

    showError(message) {
        const errorState = document.getElementById('errorState');
        const errorMessage = document.getElementById('errorMessage');
        const resultsArea = document.getElementById('resultsArea');
        const welcomeState = document.getElementById('welcomeState');
        
        errorMessage.textContent = message;
        errorState.style.display = 'flex';
        resultsArea.style.display = 'none';
        welcomeState.style.display = 'none';
    }

    hideError() {
        const errorState = document.getElementById('errorState');
        errorState.style.display = 'none';
    }

    setDefaultDate() {
        const dateInput = document.getElementById('dateRange');
        const today = new Date();
        dateInput.value = today.toISOString().split('T')[0];
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SolarPredictionApp();
});

