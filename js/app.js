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

/**
 * Initialize the application when the DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Fruit Ripeness Classification System initializing...');
    
    // Initialize components in the correct order
    initializeClassifier().then(() => {
        console.log('Classifier initialized');
    }).catch(err => {
        console.error('Error initializing classifier:', err);
        showNotification('Classification model not loaded. Some features may not work properly.', 'error');
    });
    
    // Initialize UI components
    initializeUploadComponent();
    initializeResultsDisplay();
    if (typeof initializeImagePreview === 'function') {
        initializeImagePreview();
    }
    if (typeof initializeDashboard === 'function') {
        initializeDashboard();
    }
    
    // Add event listeners
    setupEventListeners();
    
    // Load fruit metadata
    loadFruitMetadata();
    
    console.log('Application initialized successfully');
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('Welcome to the Fruit Ripeness Classification System! Upload an image to get started.', 'info');
    }, 1000);
});

/**
 * Set up global event listeners for the application
 */
function setupEventListeners() {
    // Listen for classification completion event
    document.addEventListener('classification-complete', (event) => {
        // Show results section
        document.getElementById('results-section').classList.remove('hidden');
        
        // Scroll to results section
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
        
        // Update application state
        appState.updateState({
            classificationResults: event.detail,
            classificationHistory: [...appState.classificationHistory, {
                timestamp: new Date(),
                ...event.detail
            }]
        });
        
        // Limit history size
        if (appState.classificationHistory.length > 10) {
            appState.classificationHistory = appState.classificationHistory.slice(-10);
        }
    });
    
    // Add support for keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        // Ctrl/Cmd + U for upload
        if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
            event.preventDefault();
            document.getElementById('upload-button').click();
        }
    });
    
    // Add any additional application-wide event listeners here
}

/**
 * Load fruit metadata from JSON
 */
async function loadFruitMetadata() {
    try {
        const response = await fetch('data/fruit-metadata.json');
        const metadata = await response.json();
        appState.updateState({ fruitMetadata: metadata });
        console.log('Fruit metadata loaded:', metadata);
    } catch (error) {
        console.error('Error loading fruit metadata:', error);
        showNotification('Error loading fruit data', 'error');
    }
}

/**
 * Show a notification message
 * Helper function available globally
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (info, success, error)
 */
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}]`, message);
    
    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to the DOM
    document.body.appendChild(notification);
    
    // Remove after a delay
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

// Make showNotification globally available
window.showNotification = showNotification;

/**
 * Handle errors gracefully
 * @param {Error} error - The error object
 * @param {string} context - The context where the error occurred
 */
function handleError(error, context = 'application') {
    console.error(`Error in ${context}:`, error);
    showNotification(`An error occurred in the ${context}. Please try again.`, 'error');
}

// Set up global error handling
window.addEventListener('error', (event) => {
    handleError(event.error, 'window');
});

// Make handleError globally available
window.handleError = handleError;
