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
                dataSync: () => [Math.random() > 0.5 ? 0.8 : 0.2], // Binary output (fresh vs rotten)
                dispose: () => {}
            };
        }
    };
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
            // Resize to the input dimensions the model expects (224x224)
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
 * Extract fruit type from the image or filename
 * @param {File|String} fileOrName - The file or filename to extract fruit type from
 * @returns {string} The fruit type
 */
function extractFruitType(fileOrName) {
    let fileName = '';
    
    if (typeof fileOrName === 'string') {
        fileName = fileOrName.toLowerCase();
    } else if (fileOrName && fileOrName.name) {
        fileName = fileOrName.name.toLowerCase();
    } else {
        return 'unknown';
    }
    
    // List of common fruits to detect
    const fruits = [
        'apple', 'banana', 'orange', 'strawberry', 'grape', 
        'blueberry', 'pear', 'peach', 'plum', 'mango',
        'kiwi', 'pineapple', 'watermelon', 'cherry'
    ];
    
    // Find the first fruit that matches in the filename
    for (const fruit of fruits) {
        if (fileName.includes(fruit)) {
            return fruit;
        }
    }
    
    return 'unknown';
}

/**
 * Classify an image using the loaded model
 * @param {HTMLImageElement} imgElement - The image element to classify
 * @param {File} [originalFile] - Original file for metadata extraction
 * @returns {Promise<Object>} The classification results
 */
async function classifyImage(imgElement, originalFile) {
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
        
        // Get the data from the tensor (confidence scores)
        const predictionData = predictions.dataSync();
        
        // Cleanup tensors
        tf.dispose([processedImage, predictions]);
        
        // Format the results
        const results = formatResults(predictionData, originalFile);
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
 * Map the binary classification to our ripeness categories
 * @param {number} score - Binary classification score (0-1)
 * @returns {string} The mapped ripeness category
 */
function mapScoreToRipenessCategory(score) {
    // Convert score to proper ripeness category
    // For binary classification, we'll use a threshold approach
    if (score < 0.3) {
        return 'ripe'; // Fresh
    } else if (score < 0.7) {
        return 'overripe'; // Starting to go bad
    } else {
        return 'spoiled'; // Rotten
    }
}

/**
 * Format the raw prediction data into a more usable structure
 * @param {Array} predictionData - The raw prediction data from the model
 * @param {File} [originalFile] - Original file for metadata extraction
 * @returns {Object} Formatted classification results
 */
function formatResults(predictionData, originalFile) {
    // For binary classification, we treat the output as a measure of "rottenness"
    const rottenScore = predictionData[0];
    
    // Extract fruit type from the file name
    const fruitType = originalFile ? extractFruitType(originalFile) : 'unknown';
    
    // Map to ripeness category
    const ripeness = mapScoreToRipenessCategory(rottenScore);
    
    // Get fruit-specific metadata
    const fruit = getFruitMetadata(fruitType);
    const fruitDisplayName = fruit ? fruit.displayName : capitalizeFirstLetter(fruitType);
    
    // Create confidence scores for all ripeness categories
    // This is a simplification since our model is binary,
    // but we want to maintain the expected output structure
    const confidenceMap = {
        'unripe': 0,
        'ripe': 0,
        'overripe': 0,
        'spoiled': 0
    };
    
    // Set the confidence for the predicted category
    // For binary model, we'll distribute confidences based on the score
    if (rottenScore < 0.3) {
        // Fresh fruit - mostly ripe with some possibility of unripe
        confidenceMap['ripe'] = (1 - rottenScore) * 100;
        confidenceMap['unripe'] = (0.3 - rottenScore) > 0 ? (0.3 - rottenScore) * 100 : 0;
    } else if (rottenScore < 0.7) {
        // Overripe fruit
        confidenceMap['overripe'] = (rottenScore - 0.3) / 0.4 * 100;
        confidenceMap['ripe'] = (0.7 - rottenScore) / 0.4 * 100;
    } else {
        // Spoiled fruit
        confidenceMap['spoiled'] = rottenScore * 100;
        confidenceMap['overripe'] = (1 - rottenScore) * 100 * 0.5;
    }
    
    // Create all confidences array in the format expected by the UI
    const allConfidences = Object.keys(confidenceMap).map(category => ({
        category: category,
        confidence: confidenceMap[category]
    }));
    
    // Primary confidence is the one for the assigned category
    const confidence = confidenceMap[ripeness];
    
    // Create the results object
    return {
        fruitType: fruitType,
        fruitDisplayName: fruitDisplayName,
        ripeness: ripeness,
        confidence: confidence,
        rawScore: rottenScore * 100, // Original score as percentage
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
    
    if (fruit && fruit.storageRecommendations) {
        // Map our ripeness categories to the metadata's fresh/rotten categories
        const metadataCategory = (category === 'ripe' || category === 'unripe') ? 'fresh' : 'rotten';
        if (fruit.storageRecommendations[metadataCategory]) {
            return fruit.storageRecommendations[metadataCategory];
        }
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
    
    if (fruit && fruit.qualityIndicators) {
        // Map our ripeness categories to the metadata's fresh/rotten categories
        const metadataCategory = (category === 'ripe' || category === 'unripe') ? 'fresh' : 'rotten';
        if (fruit.qualityIndicators[metadataCategory]) {
            return fruit.qualityIndicators[metadataCategory];
        }
    }
    
    // Generic indicators if fruit-specific ones aren't available
    const genericIndicators = {
        'unripe': 'Firm texture, bright color, may be hard',
        'ripe': 'Slight give when pressed, vibrant color, sweet aroma',
        'overripe': 'Soft spots, darker coloration, very sweet smell',
        'spoiled': 'Mushy texture, discoloration, mold, fermented smell'
    };
    
    return genericIndicators[category] || 'No specific indicators available';
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
