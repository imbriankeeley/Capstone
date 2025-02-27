// File: fruit-ripeness-classifier/js/app.js
// Main application logic for Fruit Ripeness Classification System

/**
 * Main Application Initialization
 * Coordinates the different components of the application
 */

// Application state management
const appState = {
    currentImage: null,
    classificationResults: null,
    classificationHistory: [],
    
    // Method to update the application state
    updateState(newState) {
        Object.assign(this, newState);
        console.log('Application state updated:', this);
    }
};

// Make appState globally accessible
window.appState = appState;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Fruit Ripeness Classification System initializing...');
    
    // Initialize components in the correct order
    initializeClassifier().then(() => {
        console.log('Classifier initialized');
    }).catch(err => {
        console.error('Error initializing classifier:', err);
    });
    
    initializeUploadComponent();
    initializeResultsDisplay();
    initializeImagePreview();
    initializeDashboard();
    
    // Add event listeners
    setupEventListeners();
    
    // Load fruit metadata
    loadFruitMetadata();
    
    console.log('Application initialized successfully');
});

/**
 * Set up global event listeners for the application
 */
function setupEventListeners() {
    // Listen for classification completion event
    document.addEventListener('classification-complete', (event) => {
        // Show results section
        document.getElementById('results-section').classList.remove('hidden');
        
        // Display classification results
        displayResults(event.detail);
        
        // Update dashboard with new data
        updateDashboard(event.detail);
        
        // Update application state
        appState.updateState({
            classificationResults: event.detail,
            classificationHistory: [...appState.classificationHistory, {
                timestamp: new Date(),
                ...event.detail
            }]
        });
    });
    
    // Add any additional application-wide event listeners here
}

/**
 * Load fruit metadata from JSON file
 */
async function loadFruitMetadata() {
    try {
        const response = await fetch('data/fruit-metadata.json');
        const metadata = await response.json();
        appState.updateState({ fruitMetadata: metadata });
        console.log('Fruit metadata loaded:', metadata);
    } catch (error) {
        console.error('Error loading fruit metadata:', error);
    }
}

// Expose functions to window object for access from other scripts
window.appState = appState;
