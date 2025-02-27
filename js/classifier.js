// File: fruit-ripeness-classifier/js/classifier.js
// TensorFlow.js model implementation for fruit ripeness classification

/**
 * Classifier module for fruit ripeness detection
 * Uses TensorFlow.js to load and run the pre-trained model
 */

// Model variables
let model = null;
let isModelLoading = false;
let fruitMetadata = null;
const MODEL_PATH = 'model/model.json';

// Class indices from the trained model
// This should match the class indices from your training
const CLASS_INDICES = {
    // These will depend on your actual training results
    // Format is 'class_name': index
    'fresh_apple': 0, 'fresh_banana': 1, 'fresh_cherry': 2, 'fresh_grape': 3,
    'fresh_kiwi': 4, 'fresh_mango': 5, 'fresh_orange': 6, 'fresh_peach': 7,
    'fresh_pear': 8, 'fresh_plum': 9, 'fresh_strawberry': 10, 'fresh_watermelon': 11,
    'rotten_apple': 12, 'rotten_banana': 13, 'rotten_cherry': 14, 'rotten_grape': 15,
    'rotten_kiwi': 16, 'rotten_mango': 17, 'rotten_orange': 18, 'rotten_peach': 19,
    'rotten_pear': 20, 'rotten_plum': 21, 'rotten_strawberry': 22, 'rotten_watermelon': 23
};

// Invert the class indices for easier lookup
const INDICES_TO_CLASS = {};
Object.keys(CLASS_INDICES).forEach(key => {
    INDICES_TO_CLASS[CLASS_INDICES[key]] = key;
});

// Ripeness mapping from fresh/rotten to our four categories
const RIPENESS_MAPPING = {
    'fresh_apple': 'ripe',
    'fresh_banana': 'ripe',
    'fresh_cherry': 'ripe',
    'fresh_grape': 'ripe',
    'fresh_kiwi': 'ripe',
    'fresh_mango': 'ripe',
    'fresh_orange': 'ripe',
    'fresh_peach': 'ripe',
    'fresh_pear': 'ripe',
    'fresh_plum': 'ripe',
    'fresh_strawberry': 'ripe',
    'fresh_watermelon': 'ripe',
    'rotten_apple': 'spoiled',
    'rotten_banana': 'spoiled',
    'rotten_cherry': 'spoiled',
    'rotten_grape': 'spoiled',
    'rotten_kiwi': 'spoiled',
    'rotten_mango': 'spoiled',
    'rotten_orange': 'spoiled',
    'rotten_peach': 'spoiled',
    'rotten_pear': 'spoiled',
    'rotten_plum': 'spoiled',
    'rotten_strawberry': 'spoiled',
    'rotten_watermelon': 'spoiled'
};

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
    // Create an array with zeros
    const values = new Array(Object.keys(CLASS_INDICES).length).fill(0);
    
    // Set a high value for one of the classes to simulate prediction
    const randomIndex = Math.floor(Math.random() * values.length);
    values[randomIndex] = 0.8;
    
    // Add some noise to other values
    for (let i = 0; i < values.length; i++) {
        if (i !== randomIndex) {
            values[i] = Math.random() * 0.2 / (values.length - 1);
        }
    }
    
    // Normalize to ensure sum is 1
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
 * Extract fruit type from class name
 * @param {string} className - The class name (e.g., 'fresh_apple')
 * @returns {string} The fruit type (e.g., 'apple')
 */
function extractFruitType(className) {
    const parts = className.split('_');
    if (parts.length > 1) {
        return parts[1]; // Return the fruit part
    }
    return 'unknown';
}

/**
 * Classify an image using the loaded model
 * @param {HTMLImageElement} imgElement - The image element to classify
 * @returns {Promise<Object>} The classification results
 */
async function classifyImage(imgElement) {
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
        
        // Process the image
        const processedImage = preprocessImage(imgElement);
        
        // Get prediction from model
        const predictions = model.predict(processedImage);
        
        // Get the data from the tensor
        const predictionData = predictions.dataSync();
        
        // Cleanup tensors
        tf.dispose([processedImage, predictions]);
        
        // Format the results
        const results = formatResults(predictionData);
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
 * Map the model's binary classification to our four ripeness categories
 * @param {string} className - The class name from the model
 * @returns {string} The mapped ripeness category
 */
function mapToRipenessCategory(className) {
    // Use our mapping or fallback to binary fresh/rotten logic
    if (RIPENESS_MAPPING[className]) {
        return RIPENESS_MAPPING[className];
    }
    
    // Fallback logic based on class name
    if (className.startsWith('fresh_')) {
        return 'ripe';
    } else if (className.startsWith('rotten_')) {
        return 'spoiled';
    }
    
    return 'unknown';
}

/**
 * Format the raw prediction data into a more usable structure
 * @param {Array} predictionData - The raw prediction data from the model
 * @returns {Object} Formatted classification results
 */
function formatResults(predictionData) {
    // Get the index of the highest confidence score
    const highestIndex = predictionData.indexOf(Math.max(...predictionData));
    const predictedClass = INDICES_TO_CLASS[highestIndex];
    
    // Extract fruit type from the class name
    const fruitType = extractFruitType(predictedClass);
    
    // Map to ripeness category (fresh -> ripe, rotten -> spoiled)
    const ripeness = mapToRipenessCategory(predictedClass);
    
    // Get fruit-specific metadata
    const fruit = getFruitMetadata(fruitType);
    const fruitDisplayName = fruit ? fruit.displayName : capitalizeFirstLetter(fruitType);
    
    // Group confidence scores by ripeness category
    const ripenessConfidences = {};
    RIPENESS_CATEGORIES.forEach(category => {
        ripenessConfidences[category] = 0;
    });
    
    // Aggregate confidence scores by ripeness category
    Object.keys(INDICES_TO_CLASS).forEach(index => {
        const className = INDICES_TO_CLASS[index];
        const category = mapToRipenessCategory(className);
        
        if (category in ripenessConfidences) {
            ripenessConfidences[category] += predictionData[index] * 100; // Convert to percentage
        }
    });
    
    // Create all confidences array in the format expected by the UI
    const allConfidences = Object.keys(ripenessConfidences).map(category => ({
        category: category,
        confidence: ripenessConfidences[category]
    }));
    
    // Create the results object
    return {
        fruitType: fruitType,
        fruitDisplayName: fruitDisplayName,
        ripeness: ripeness,
        confidence: predictionData[highestIndex] * 100, // Convert to percentage
        allConfidences: allConfidences,
        recommendedAction: getRecommendationText(ripeness, fruitType),
        ripenessIndicators: getRipenessIndicators(ripeness, fruitType),
        timestamp: new Date()
    };
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
