// Analytics Page JavaScript
class SolarAnalyticsApp {
    constructor() {
        this.charts = {};
        this.historicalData = this.generateHistoricalData();
        this.initializeApp();
    }

    initializeApp() {
        this.initializeEventListeners();
        this.initializeCharts();
        this.populateHistoricalTable();
        this.animateMetrics();
    }

    generateHistoricalData() {
        const data = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const generation = 15 + Math.random() * 10; // 15-25 kWh
            const peakPower = 3 + Math.random() * 2; // 3-5 kW
            const efficiency = 75 + Math.random() * 15; // 75-90%
            const weather = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Overcast'][Math.floor(Math.random() * 4)];
            
            data.push({
                date: date.toISOString().split('T')[0],
                generation: generation,
                peakPower: peakPower,
                efficiency: efficiency,
                weather: weather
            });
        }
        
        return data;
    }

    initializeEventListeners() {
        // Refresh data button
        document.getElementById('refreshData').addEventListener('click', () => {
            this.refreshData();
        });

        // Export all button
        document.getElementById('exportAll').addEventListener('click', () => {
            this.exportAllData();
        });

        // Chart period buttons
        document.querySelectorAll('[data-period]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchChartPeriod(e.target.dataset.period);
            });
        });
    }

    initializeCharts() {
        this.createPowerTrendChart();
        this.createWeatherChart();
        this.createComparisonChart();
    }

    createPowerTrendChart() {
        const ctx = document.getElementById('powerTrendChart').getContext('2d');
        
        const labels = this.historicalData.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const data = this.historicalData.map(d => d.generation);

        this.charts.powerTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Generation (kWh)',
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
                            text: 'Generation (kWh)',
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
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

    createWeatherChart() {
        const ctx = document.getElementById('weatherChart').getContext('2d');
        
        const weatherData = {
            'Sunny': 0,
            'Partly Cloudy': 0,
            'Cloudy': 0,
            'Overcast': 0
        };
        
        this.historicalData.forEach(d => {
            weatherData[d.weather]++;
        });

        this.charts.weather = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(weatherData),
                datasets: [{
                    data: Object.values(weatherData),
                    backgroundColor: [
                        '#00d4ff',
                        '#0099cc',
                        '#0066cc',
                        '#004499'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    createComparisonChart() {
        const ctx = document.getElementById('comparisonChart').getContext('2d');
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const current = [12, 15, 18, 22, 25, 28];
        const optimal = [15, 18, 22, 26, 30, 33];

        this.charts.comparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Current Performance',
                    data: current,
                    backgroundColor: 'rgba(0, 212, 255, 0.8)',
                    borderColor: '#00d4ff',
                    borderWidth: 1
                }, {
                    label: 'Optimal Performance',
                    data: optimal,
                    backgroundColor: 'rgba(40, 167, 69, 0.8)',
                    borderColor: '#28a745',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
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
                            text: 'Generation (kWh)',
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    }
                }
            }
        });
    }

    switchChartPeriod(period) {
        // Update button states
        document.querySelectorAll('[data-period]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`).classList.add('active');

        // Update chart data based on period
        let labels, data;
        
        switch(period) {
            case 'daily':
                labels = this.historicalData.slice(-7).map(d => {
                    const date = new Date(d.date);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                });
                data = this.historicalData.slice(-7).map(d => d.generation);
                break;
            case 'weekly':
                labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                data = [85, 92, 78, 88]; // Weekly averages
                break;
            case 'monthly':
                labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                data = [450, 520, 680, 720, 850, 920]; // Monthly totals
                break;
        }

        this.charts.powerTrend.data.labels = labels;
        this.charts.powerTrend.data.datasets[0].data = data;
        this.charts.powerTrend.update();
    }

    populateHistoricalTable() {
        const tbody = document.getElementById('historicalTableBody');
        tbody.innerHTML = '';

        this.historicalData.slice(-10).reverse().forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(record.date).toLocaleDateString()}</td>
                <td>${record.generation.toFixed(1)}</td>
                <td>${record.peakPower.toFixed(1)}</td>
                <td>${record.efficiency.toFixed(1)}%</td>
                <td>
                    <span class="badge bg-${this.getWeatherBadgeClass(record.weather)}">
                        ${record.weather}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    getWeatherBadgeClass(weather) {
        const classes = {
            'Sunny': 'success',
            'Partly Cloudy': 'warning',
            'Cloudy': 'info',
            'Overcast': 'secondary'
        };
        return classes[weather] || 'secondary';
    }

    animateMetrics() {
        // Animate metric values
        this.animateValue('totalGeneration', 0, 1250, 2000);
        this.animateValue('peakOutput', 0, 4.2, 2000);
        this.animateValue('efficiency', 0, 87.3, 2000);
        this.animateValue('sunHours', 0, 6.8, 2000);
    }

    animateValue(elementId, start, end, duration) {
        const element = document.getElementById(elementId);
        const startTime = performance.now();
        const isPercentage = elementId === 'efficiency';
        
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

    async refreshData() {
        const button = document.getElementById('refreshData');
        const originalText = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Refreshing...';
        button.disabled = true;

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update data
        this.historicalData = this.generateHistoricalData();
        this.populateHistoricalTable();
        this.updateCharts();

        button.innerHTML = originalText;
        button.disabled = false;

        // Show success message
        this.showNotification('Data refreshed successfully!', 'success');
    }

    updateCharts() {
        // Update power trend chart
        const labels = this.historicalData.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const data = this.historicalData.map(d => d.generation);
        
        this.charts.powerTrend.data.labels = labels;
        this.charts.powerTrend.data.datasets[0].data = data;
        this.charts.powerTrend.update();

        // Update weather chart
        const weatherData = {
            'Sunny': 0,
            'Partly Cloudy': 0,
            'Cloudy': 0,
            'Overcast': 0
        };
        
        this.historicalData.forEach(d => {
            weatherData[d.weather]++;
        });

        this.charts.weather.data.datasets[0].data = Object.values(weatherData);
        this.charts.weather.update();
    }

    async exportAllData() {
        const button = document.getElementById('exportAll');
        const originalText = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Exporting...';
        button.disabled = true;

        try {
            // Create CSV data
            const csvData = this.generateCSVData();
            this.downloadCSV(csvData, 'solar_analytics_data.csv');
            
            this.showNotification('Data exported successfully!', 'success');
        } catch (error) {
            this.showNotification('Export failed. Please try again.', 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    generateCSVData() {
        const headers = ['Date', 'Generation (kWh)', 'Peak Power (kW)', 'Efficiency (%)', 'Weather'];
        const rows = this.historicalData.map(record => [
            record.date,
            record.generation.toFixed(1),
            record.peakPower.toFixed(1),
            record.efficiency.toFixed(1),
            record.weather
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    downloadCSV(csvData, filename) {
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SolarAnalyticsApp();
});

