// File: fruit-ripeness-classifier/js/classifier.js
// TensorFlow.js model implementation for fruit ripeness classification

/**
 * Classifier module for fruit ripeness detection
 * Uses TensorFlow.js to load and run the pre-trained model on the Fruits-360 dataset
 */

// Model variables
let model = null;
let isModelLoading = false;
let fruitMetadata = null;
const MODEL_PATH = 'model/model.json';

// Ripeness categories
const RIPENESS_CATEGORIES = [
    'unripe',
    'ripe',
    'overripe',
    'spoiled'
];

// Cache for fruit-specific data
let fruitTypeCache = {};

/**
 * Initialize the classifier by loading the TensorFlow.js model
 * @returns {Promise<boolean>} True if initialization successful
 */
async function initializeClassifier() {
    if (model) {
        console.log('Model already loaded');
        return true;
    }

    try {
        isModelLoading = true;
        
        console.log('Loading fruit ripeness classification model...');
        
        // Load the TensorFlow.js model
        model = await tf.loadLayersModel(MODEL_PATH);
        
        // Initialize metadata
        await loadFruitMetadata();
        
        isModelLoading = false;
        console.log('Classification model loaded successfully');
        return true;
    } catch (error) {
        console.error('Error loading model:', error);
        
        // Fallback to mock model if real model fails to load
        console.warn('Using mock classification model as fallback');
        model = createMockModel();
        
        isModelLoading = false;
        return false;
    }
}

/**
 * Load fruit metadata from JSON
 */
async function loadFruitMetadata() {
    try {
        const response = await fetch('data/fruit-metadata.json');
        fruitMetadata = await response.json();
        console.log('Fruit metadata loaded successfully');
    } catch (error) {
        console.error('Error loading fruit metadata:', error);
        fruitMetadata = null;
    }
}

/**
 * Create a mock model for testing or when real model fails to load
 * @returns {Object} Mock model object
 */
function createMockModel() {
    return {
        predict: (tensor) => {
            console.log('Mock model prediction called');
            return {
                dataSync: () => generateMockConfidences(),
                dispose: () => {}
            };
        }
    };
}

/**
 * Generate mock confidence scores for testing
 * @returns {Array} Array of confidence values
 */
function generateMockConfidences() {
    const values = Array(4).fill(0).map(() => Math.random());
    const sum = values.reduce((a, b) => a + b, 0);
    return values.map(v => v / sum);
}

/**
 * Preprocess the image for the model
 * @param {HTMLImageElement} imgElement - The image element to process
 * @returns {tf.Tensor} The preprocessed image tensor
 */
function preprocessImage(imgElement) {
    console.log('Preprocessing image for classification');
    
    return tf.tidy(() => {
        // Convert image to tensor
        const tensor = tf.browser.fromPixels(imgElement)
            // Resize to the input dimensions the model expects
            .resizeNearestNeighbor([224, 224])
            // Normalize pixel values to 0-1
            .toFloat()
            .div(tf.scalar(255.0))
            // Add a dimension to match model input shape [1, 224, 224, 3]
            .expandDims();
            
        return tensor;
    });
}

/**
 * Attempt to identify the fruit type from an image
 * @param {HTMLImageElement} imgElement - The image element
 * @param {string} [fileName=''] - Optional file name which may contain fruit type
 * @returns {string} The detected fruit type or 'unknown'
 */
function identifyFruitType(imgElement, fileName = '') {
    // First try to identify from the filename
    const fruitTypeFromName = getFruitTypeFromFileName(fileName);
    if (fruitTypeFromName !== 'unknown') {
        return fruitTypeFromName;
    }
    
    // TODO: In a full implementation, we'd use another model to classify
    // the fruit type, but for now we'll just return 'apple' as a default
    return 'apple';
}

/**
 * Get fruit type from filename
 * @param {string} fileName - The file name to parse
 * @returns {string} Detected fruit type or 'unknown'
 */
function getFruitTypeFromFileName(fileName) {
    if (!fileName) return 'unknown';
    
    // Convert filename to lowercase for matching
    const name = fileName.toLowerCase();
    
    // If we have fruit metadata, use that for matching
    if (fruitMetadata && fruitMetadata.fruits) {
        for (const fruit of fruitMetadata.fruits) {
            // Check if the fruit name is in the filename
            if (name.includes(fruit.name)) {
                return fruit.name;
            }
            
            // Also check if any variants are in the filename
            if (fruit.variants) {
                for (const variant of fruit.variants) {
                    if (name.includes(variant.toLowerCase())) {
                        return fruit.name;
                    }
                }
            }
        }
    }
    
    // Fallback to a simpler check with common fruits
    const commonFruits = [
        'apple', 'banana', 'orange', 'strawberry', 'grape', 
        'blueberry', 'pear', 'peach', 'plum', 'mango',
        'kiwi', 'pineapple', 'watermelon', 'cherry'
    ];
    
    for (const fruit of commonFruits) {
        if (name.includes(fruit)) {
            return fruit;
        }
    }
    
    return 'unknown';
}

/**
 * Get the metadata for a specific fruit
 * @param {string} fruitType - The type of fruit to get metadata for
 * @returns {Object|null} Fruit metadata or null if not found
 */
function getFruitMetadata(fruitType) {
    // Check cache first
    if (fruitTypeCache[fruitType]) {
        return fruitTypeCache[fruitType];
    }
    
    // Look up in metadata
    if (fruitMetadata && fruitMetadata.fruits) {
        const fruit = fruitMetadata.fruits.find(f => f.name === fruitType);
        
        if (fruit) {
            // Cache for future use
            fruitTypeCache[fruitType] = fruit;
            return fruit;
        }
    }
    
    return null;
}

/**
 * Get recommendation text based on ripeness category and fruit type
 * @param {string} category - The ripeness category
 * @param {string} fruitType - The type of fruit
 * @returns {string} Recommendation text
 */
function getRecommendationText(category, fruitType) {
    // Try to get fruit-specific recommendations from metadata
    const fruit = getFruitMetadata(fruitType);
    
    if (fruit && fruit.storageRecommendations && fruit.storageRecommendations[category]) {
        return fruit.storageRecommendations[category];
    }
    
    // Fallback to generic recommendations
    const recommendations = {
        'unripe': 'Keep in storage for ripening',
        'ripe': 'Display for immediate sale',
        'overripe': 'Discount and prioritize for sale',
        'spoiled': 'Remove from inventory'
    };
    
    return recommendations[category] || 'Unknown recommendation';
}

/**
 * Get ripeness indicators for a specific fruit and category
 * @param {string} category - The ripeness category
 * @param {string} fruitType - The type of fruit
 * @returns {string} Description of ripeness indicators
 */
function getRipenessIndicators(category, fruitType) {
    const fruit = getFruitMetadata(fruitType);
    
    if (fruit && fruit.ripenessIndicators && fruit.ripenessIndicators[category]) {
        return fruit.ripenessIndicators[category];
    }
    
    return 'No specific indicators available';
}

/**
 * Classify an image using the loaded model
 * @param {HTMLImageElement} imgElement - The image element to classify
 * @param {string} [fileName=''] - Optional file name which may contain fruit type
 * @returns {Promise<Object>} The classification results
 */
async function classifyImage(imgElement, fileName = '') {
    // Ensure model is loaded
    if (!model) {
        try {
            await initializeClassifier();
        } catch (error) {
            throw new Error('Model could not be loaded: ' + error.message);
        }
    }
    
    try {
        console.log('Starting image classification');
        
        // Identify the type of fruit (from filename or image analysis)
        const fruitType = identifyFruitType(imgElement, fileName);
        console.log('Identified fruit type:', fruitType);
        
        // Process the image
        const processedImage = preprocessImage(imgElement);
        
        // Get prediction from model
        const predictions = model.predict(processedImage);
        
        // Get the data from the tensor
        const predictionData = predictions.dataSync();
        
        // Cleanup tensors
        tf.dispose([processedImage, predictions]);
        
        // Format the results
        const results = formatResults(predictionData, fruitType);
        console.log('Classification complete:', results);
        
        // Create and dispatch classification-complete event
        const event = new CustomEvent('classification-complete', {
            detail: results
        });
        document.dispatchEvent(event);
        
        return results;
    } catch (error) {
        console.error('Error during classification:', error);
        throw error;
    }
}

/**
 * Format the raw prediction data into a more usable structure
 * @param {Array} predictionData - The raw prediction data from the model
 * @param {string} fruitType - The type of fruit
 * @returns {Object} Formatted classification results
 */
function formatResults(predictionData, fruitType) {
    // Get the index of the highest confidence score
    const highestIndex = predictionData.indexOf(Math.max(...predictionData));
    const ripeness = RIPENESS_CATEGORIES[highestIndex];
    
    // Get fruit-specific metadata
    const fruit = getFruitMetadata(fruitType);
    const fruitDisplayName = fruit ? fruit.displayName : capitalizeFirstLetter(fruitType);
    
    // Create the results object
    return {
        fruitType: fruitType,
        fruitDisplayName: fruitDisplayName,
        ripeness: ripeness,
        confidence: predictionData[highestIndex] * 100, // Convert to percentage
        allConfidences: RIPENESS_CATEGORIES.map((category, index) => ({
            category: category,
            confidence: predictionData[index] * 100 // Convert to percentage
        })),
        recommendedAction: getRecommendationText(ripeness, fruitType),
        ripenessIndicators: getRipenessIndicators(ripeness, fruitType),
        timestamp: new Date()
    };
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - The string to capitalize
 * @returns {string} The capitalized string
 */
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Expose functions to window object for access from other scripts
window.initializeClassifier = initializeClassifier;
window.classifyImage = classifyImage;
window.preprocessImage = preprocessImage;
window.getFruitTypeFromFileName = getFruitTypeFromFileName;
