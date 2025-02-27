// File: fruit-ripeness-classifier/js/components/results-display.js
// Results display component for Fruit Ripeness Classification System

/**
 * Initialize the results display component
 * Sets up the container for displaying classification results
 */
function initializeResultsDisplay() {
    const resultsContainer = document.getElementById('results-container');
    
    if (!resultsContainer) {
        console.error('Results container element not found');
        return;
    }
    
    console.log('Initializing results display component');
    
    // Clear any existing content
    resultsContainer.innerHTML = '';
    
    // Add initial placeholder or instructions if needed
    const placeholder = document.createElement('p');
    placeholder.textContent = 'Upload an image to see classification results';
    placeholder.className = 'results-placeholder';
    resultsContainer.appendChild(placeholder);
    
    // Add event listener for classification results
    document.addEventListener('classification-complete', (event) => {
        displayResults(event.detail);
    });
    
    console.log('Results display component initialized');
}

/**
 * Display classification results in the results container
 * @param {Object} results - The classification results from the classifier
 */
function displayResults(results) {
    const resultsContainer = document.getElementById('results-container');
    
    if (!resultsContainer) {
        console.error('Results container element not found');
        return;
    }
    
    console.log('Displaying classification results:', results);
    
    // Clear existing content
    resultsContainer.innerHTML = '';
    
    // Create main result card
    const resultCard = document.createElement('div');
    resultCard.className = 'result-card';
    
    // Add fruit type and ripeness result
    const ripenessResult = document.createElement('h3');
    ripenessResult.innerHTML = `${results.fruitDisplayName}: <span class="${results.ripeness}">${capitalizeFirstLetter(results.ripeness)}</span> <span class="badge ${results.ripeness}">${capitalizeFirstLetter(results.ripeness)}</span>`;
    resultCard.appendChild(ripenessResult);
    
    // Add confidence score
    const confidenceText = document.createElement('p');
    confidenceText.textContent = `Confidence: ${results.confidence.toFixed(1)}%`;
    resultCard.appendChild(confidenceText);
    
    // Add confidence bar
    const confidenceBar = createConfidenceBar(results.ripeness, results.confidence);
    resultCard.appendChild(confidenceBar);
    
    // Add quality indicators section
    if (results.ripenessIndicators) {
        const indicatorsDiv = document.createElement('div');
        indicatorsDiv.className = 'quality-indicators';
        indicatorsDiv.innerHTML = `<h4>Quality Indicators:</h4><p>${results.ripenessIndicators}</p>`;
        resultCard.appendChild(indicatorsDiv);
    }
    
    // Add recommended action
    const actionElement = document.createElement('div');
    actionElement.className = 'recommended-action';
    actionElement.innerHTML = `<h4>Recommended Action:</h4><p>${results.recommendedAction}</p>`;
    resultCard.appendChild(actionElement);
    
    // Add result card to container
    resultsContainer.appendChild(resultCard);
    
    // Add detailed confidence breakdown
    const detailedResults = createDetailedResults(results.allConfidences);
    resultsContainer.appendChild(detailedResults);
    
    // Trigger an event for dashboard to update
    updateDashboard(results);
}

/**
 * Create a confidence bar element for visual representation
 * @param {string} ripeness - The ripeness category
 * @param {number} confidence - The confidence percentage
 * @returns {HTMLElement} The confidence bar element
 */
function createConfidenceBar(ripeness, confidence) {
    const barContainer = document.createElement('div');
    barContainer.className = 'confidence-bar';
    
    const bar = document.createElement('div');
    bar.className = `confidence-fill ${ripeness}-bg`;
    
    // Animate the width after a short delay
    setTimeout(() => {
        bar.style.width = `${confidence}%`;
    }, 50);
    
    const percentText = document.createElement('span');
    percentText.className = 'confidence-percentage';
    percentText.textContent = `${confidence.toFixed(1)}%`;
    
    barContainer.appendChild(bar);
    barContainer.appendChild(percentText);
    
    return barContainer;
}

/**
 * Create detailed results breakdown for all confidence scores
 * @param {Array} allConfidences - Array of objects with category and confidence
 * @returns {HTMLElement} The detailed results element
 */
function createDetailedResults(allConfidences) {
    const detailedContainer = document.createElement('div');
    detailedContainer.className = 'detailed-results result-card';
    
    const heading = document.createElement('h4');
    heading.textContent = 'Detailed Confidence Scores:';
    detailedContainer.appendChild(heading);
    
    // Sort by confidence (highest first)
    const sortedConfidences = [...allConfidences].sort((a, b) => b.confidence - a.confidence);
    
    // Create a list of all confidence scores
    const list = document.createElement('ul');
    sortedConfidences.forEach(item => {
        // Skip very low confidence scores (less than 1%)
        if (item.confidence < 1) return;
        
        const listItem = document.createElement('li');
        listItem.innerHTML = `<span class="${item.category}">${capitalizeFirstLetter(item.category)}</span>: ${item.confidence.toFixed(1)}%`;
        
        // Add small confidence bar
        const miniBar = createConfidenceBar(item.category, item.confidence);
        miniBar.className = 'confidence-bar mini';
        listItem.appendChild(miniBar);
        
        list.appendChild(listItem);
    });
    
    detailedContainer.appendChild(list);
    return detailedContainer;
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - The string to capitalize
 * @returns {string} The capitalized string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize the component when the page loads
document.addEventListener('DOMContentLoaded', initializeResultsDisplay);

// Export functions for use in other modules
window.displayResults = displayResults;
window.initializeResultsDisplay = initializeResultsDisplay;
