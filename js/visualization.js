// File: fruit-ripeness-classifier/js/visualization.js
// Data visualization components for Fruit Ripeness Classification System

// Chart objects for reuse
let ripenessDistributionChart = null;
let ripenessHeatmapChart = null;

/**
 * Initialize the dashboard visualizations
 * Creates empty charts that will be populated with data later
 */
function initializeDashboard() {
    console.log('Initializing dashboard visualizations');
    
    // Initialize ripeness distribution chart
    initializeRipenessDistributionChart();
    
    // Initialize ripeness heatmap
    initializeRipenessHeatmap();
    
    // Initialize application state with empty classification history
    if (!appState.classificationHistory) {
        appState.classificationHistory = [];
    }
    
    console.log('Dashboard visualizations initialized');
}

/**
 * Initialize the ripeness distribution chart
 * Creates a stacked bar chart showing ripeness distribution across fruit types
 */
function initializeRipenessDistributionChart() {
    const ctx = document.getElementById('ripeness-distribution-chart');
    
    if (!ctx) {
        console.error('Ripeness distribution chart element not found');
        return;
    }
    
    // Get ripeness category colors from CSS variables
    const unripeColor = getComputedStyle(document.documentElement).getPropertyValue('--unripe-color').trim();
    const ripeColor = getComputedStyle(document.documentElement).getPropertyValue('--ripe-color').trim();
    const overripeColor = getComputedStyle(document.documentElement).getPropertyValue('--overripe-color').trim();
    const spoiledColor = getComputedStyle(document.documentElement).getPropertyValue('--spoiled-color').trim();
    
    // Sample data for initial chart
    const initialData = {
        labels: ['Apple', 'Banana', 'Orange', 'Strawberry', 'Mango'],
        datasets: [
            {
                label: 'Unripe',
                data: [25, 10, 15, 5, 20],
                backgroundColor: unripeColor
            },
            {
                label: 'Ripe',
                data: [50, 60, 45, 70, 55],
                backgroundColor: ripeColor
            },
            {
                label: 'Overripe',
                data: [20, 25, 30, 20, 15],
                backgroundColor: overripeColor
            },
            {
                label: 'Spoiled',
                data: [5, 5, 10, 5, 10],
                backgroundColor: spoiledColor
            }
        ]
    };
    
    // Create chart
    ripenessDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: initialData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Ripeness Distribution by Fruit Type'
                },
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Fruit Type'
                    }
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    },
                    min: 0,
                    max: 100
                }
            }
        }
    });
