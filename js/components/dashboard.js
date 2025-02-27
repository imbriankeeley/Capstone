// File: fruit-ripeness-classifier/js/components/dashboard.js
// Dashboard component for Fruit Ripeness Classification System

/**
 * Dashboard module for visualizing fruit ripeness data
 * Provides interactive charts and visualizations for the classification results
 */

// Chart objects for reuse
let ripenessDistributionChart = null;
let ripenessHeatmapChart = null;

/**
 * Initialize the dashboard with default/sample data
 */
function initializeDashboard() {
    console.log('Initializing dashboard component');
    
    // Set up chart containers
    const distributionChartElement = document.getElementById('ripeness-distribution-chart');
    const heatmapChartElement = document.getElementById('ripeness-heatmap');
    
    if (!distributionChartElement || !heatmapChartElement) {
        console.error('Dashboard chart elements not found');
        return;
    }
    
    // Initialize charts with sample data
    createDistributionChart(distributionChartElement);
    createHeatmapChart(heatmapChartElement);
    
    console.log('Dashboard component initialized');
}

/**
 * Create the ripeness distribution chart
 * @param {HTMLCanvasElement} canvas - The canvas element for the chart
 */
function createDistributionChart(canvas) {
    // Sample data for initial chart
    const sampleData = {
        labels: ['Apple', 'Banana', 'Orange', 'Strawberry'],
        datasets: [
            {
                label: 'Unripe',
                data: [20, 10, 15, 5],
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--unripe-color')
            },
            {
                label: 'Ripe',
                data: [45, 30, 25, 35],
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--ripe-color')
            },
            {
                label: 'Overripe',
                data: [25, 40, 30, 40],
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--overripe-color')
            },
            {
                label: 'Spoiled',
                data: [10, 20, 30, 20],
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--spoiled-color')
            }
        ]
    };
    
    // Chart configuration
    const config = {
        type: 'bar',
        data: sampleData,
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Fruit Ripeness Distribution'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            responsive: true,
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Fruit Count'
                    }
                }
            }
        }
    };
    
    // Create the chart
    ripenessDistributionChart = new Chart(canvas, config);
}

/**
 * Create the ripeness heatmap chart
 * @param {HTMLCanvasElement} canvas - The canvas element for the chart
 */
function createHeatmapChart(canvas) {
    // Sample data for initial heatmap
    const sampleData = {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        datasets: [
            {
                label: 'Apple',
                data: [80, 75, 60, 45, 30],
                backgroundColor: interpolateColor
            },
            {
                label: 'Banana',
                data: [90, 85, 70, 50, 35],
                backgroundColor: interpolateColor
            },
            {
                label: 'Orange',
                data: [95, 85, 75, 65, 55],
                backgroundColor: interpolateColor
            }
        ]
    };
    
    // Chart configuration
    const config = {
        type: 'matrix',
        data: {
            datasets: [{
                label: 'Ripeness Percentage',
                data: generateHeatmapData(),
                backgroundColor: interpolateColor,
                width: 33,
                height: 33
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Fruit Ripeness Heatmap'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.data[context.dataIndex].x}, ${context.dataset.data[context.dataIndex].y}: ${context.dataset.data[context.dataIndex].v}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'category',
                    labels: ['Apple', 'Banana', 'Orange', 'Strawberry']
                },
                y: {
                    type: 'category',
                    labels: ['Unripe', 'Ripe', 'Overripe', 'Spoiled']
                }
            }
        }
    };
    
    // Fallback to a simple bar chart if matrix type is not available
    // (Matrix chart is not natively supported in Chart.js without a plugin)
    const fallbackConfig = {
        type: 'bar',
        data: sampleData,
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Fruit Ripeness Over Time'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Day of Week'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Freshness Percentage'
                    },
                    min: 0,
                    max: 100
                }
            }
        }
    };
    
    // Create the chart - using fallback as matrix chart requires plugin
    ripenessHeatmapChart = new Chart(canvas, fallbackConfig);
}

/**
 * Generate sample data for heatmap
 * @returns {Array} Array of data points for heatmap
 */
function generateHeatmapData() {
    const data = [];
    const fruits = ['Apple', 'Banana', 'Orange', 'Strawberry'];
    const ripeness = ['Unripe', 'Ripe', 'Overripe', 'Spoiled'];
    
    for (let i = 0; i < fruits.length; i++) {
        for (let j = 0; j < ripeness.length; j++) {
            data.push({
                x: fruits[i],
                y: ripeness[j],
                v: Math.floor(Math.random() * 100) // Random value for demonstration
            });
        }
    }
    
    return data;
}

/**
 * Interpolate color based on value (0-100)
 * @param {Object} context - The chart context
 * @returns {String} Color in rgba format
 */
function interpolateColor(context) {
    const value = context.dataset.data[context.dataIndex].v || context.raw;
    
    // Scale from 0-100
    const normalizedValue = value / 100;
    
    // Colors for gradient (red to green)
    const red = [244, 67, 54];
    const orange = [255, 152, 0];
    const green = [76, 175, 80];
    
    let r, g, b;
    
    if (normalizedValue < 0.5) {
        // Interpolate between red and orange
        const t = normalizedValue * 2;
        r = Math.round(red[0] + t * (orange[0] - red[0]));
        g = Math.round(red[1] + t * (orange[1] - red[1]));
        b = Math.round(red[2] + t * (orange[2] - red[2]));
    } else {
        // Interpolate between orange and green
        const t = (normalizedValue - 0.5) * 2;
        r = Math.round(orange[0] + t * (green[0] - orange[0]));
        g = Math.round(orange[1] + t * (green[1] - orange[1]));
        b = Math.round(orange[2] + t * (green[2] - orange[2]));
    }
    
    return `rgba(${r}, ${g}, ${b}, 0.8)`;
}

/**
 * Update the dashboard with new classification results
 * @param {Object} results - The classification results object
 */
function updateDashboard(results) {
    console.log('Updating dashboard with new results:', results);
    
    // TODO: Implement actual dashboard update logic based on real data
    // This would typically involve:
    // 1. Adding the new data point to the stored history
    // 2. Recalculating aggregates
    // 3. Updating the charts
    
    // For now, we'll just simulate an update with random data
    if (ripenessDistributionChart) {
        // Simulate data change
        ripenessDistributionChart.data.datasets.forEach((dataset, index) => {
            dataset.data = dataset.data.map(() => Math.floor(Math.random() * 50));
        });
        ripenessDistributionChart.update();
    }
    
    if (ripenessHeatmapChart) {
        // Simulate data change
        ripenessHeatmapChart.data.datasets.forEach((dataset) => {
            dataset.data = dataset.data.map(() => Math.floor(Math.random() * 100));
        });
        ripenessHeatmapChart.update();
    }
}

/**
 * Add a new data point to the dashboard history
 * @param {Object} dataPoint - The data point to add
 */
function addDataPointToHistory(dataPoint) {
    // TODO: Implement history tracking functionality
    appState.classificationHistory.push({
        timestamp: new Date(),
        ...dataPoint
    });
    
    // Limit history size if needed
    if (appState.classificationHistory.length > 50) {
        appState.classificationHistory.shift();
    }
}

/**
 * Reset the dashboard to its initial state
 */
function resetDashboard() {
    // TODO: Implement dashboard reset functionality
    console.log('Resetting dashboard');
    
    if (ripenessDistributionChart) {
        ripenessDistributionChart.destroy();
        const canvas = document.getElementById('ripeness-distribution-chart');
        createDistributionChart(canvas);
    }
    
    if (ripenessHeatmapChart) {
        ripenessHeatmapChart.destroy();
        const canvas = document.getElementById('ripeness-heatmap');
        createHeatmapChart(canvas);
    }
}

// Export functions for use in other modules
// Note: In a real application with modules, we would use proper export statements
window.initializeDashboard = initializeDashboard;
window.updateDashboard = updateDashboard;
window.resetDashboard = resetDashboard;
