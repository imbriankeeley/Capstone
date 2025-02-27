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
    
    // Clear existing content
    resultsContainer.innerHTML = '';
    
    // Create main result card
    const resultCard = document.createElement('div');
    resultCard.className = 'result-card';
    
    // Add ripeness result
    const ripenessResult = document.createElement('h3');
    ripenessResult.innerHTML = `Ripeness: <span class="${results.ripeness}">${capitalizeFirstLetter(results.ripeness)}</span>`;
    resultCard.appendChild(ripenessResult);
    
    // Add confidence score
    const confidenceText = document.createElement('p');
    confidenceText.textContent = `Confidence: ${results.confidence.toFixed(1)}%`;
    resultCard.appendChild(confidenceText);
    
    // Add confidence bar
    const confidenceBar = createConfidenceBar(results.ripeness, results.confidence);
    resultCard.appendChild(confidenceBar);
    
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
    
    // Trigger an event indicating results have been displayed
    const event = new CustomEvent('results-displayed', {
        detail: results
    });
    document.dispatchEvent(event);
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
    bar.className = `confidence-fill ${ripeness}`;
    bar.style.width = `${confidence}%`;
    bar.style.backgroundColor = getRipenessColor(ripeness);
    
    barContainer.appendChild(bar);
    return barContainer;
}

/**
 * Create detailed results breakdown for all confidence scores
 * @param {Array} allConfidences - Array of objects with category and confidence
 * @returns {HTMLElement} The detailed results element
 */
function createDetailedResults(allConfidences) {
    const detailedContainer = document.createElement('div');
    detailedContainer.className = 'detailed-results';
    
    const heading = document.createElement('h4');
    heading.textContent = 'Detailed Confidence Scores:';
    detailedContainer.appendChild(heading);
    
    // Sort by confidence (highest first)
    const sortedConfidences = [...allConfidences].sort((a, b) => b.confidence - a.confidence);
    
    // Create a list of all confidence scores
    const list = document.createElement('ul');
    sortedConfidences.forEach(item => {
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
 * Get the color for a ripeness category
 * @param {string} ripeness - The ripeness category
 * @returns {string} The CSS color variable
 */
function getRipenessColor(ripeness) {
    const colors = {
        'unripe': 'var(--unripe-color)',
        'ripe': 'var(--ripe-color)',
        'overripe': 'var(--overripe-color)',
        'spoiled': 'var(--spoiled-color)'
    };
    
    return colors[ripeness] || colors['ripe']; // Default to ripe if not found
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - The string to capitalize
 * @returns {string} The capitalized string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Export functions for use in other modules
// Note: In a real application with modules, we would use proper export statements
// window.displayResults = displayResults;
// window.initializeResultsDisplay = initializeResultsDisplay;
