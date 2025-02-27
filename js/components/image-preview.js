// File: fruit-ripeness-classifier/js/components/image-preview.js
// Image preview component for the Fruit Ripeness Classification System

/**
 * Image Preview Component
 * Handles the display and manipulation of uploaded images
 */

/**
 * Initialize the image preview component
 */
function initializeImagePreview() {
    console.log('Initializing image preview component');
    
    // Get the image preview container
    const previewContainer = document.getElementById('image-preview');
    
    if (!previewContainer) {
        console.error('Image preview container not found');
        return;
    }
    
    // Add any event listeners or setup needed for the preview component
    
    console.log('Image preview component initialized');
}

/**
 * Clear the image preview
 */
function clearImagePreview() {
    const previewContainer = document.getElementById('image-preview');
    
    if (!previewContainer) {
        console.error('Image preview container not found');
        return;
    }
    
    previewContainer.innerHTML = '';
}

/**
 * Set the image in the preview container
 * @param {HTMLImageElement} imgElement - The image element to display
 */
function setPreviewImage(imgElement) {
    const previewContainer = document.getElementById('image-preview');
    
    if (!previewContainer) {
        console.error('Image preview container not found');
        return;
    }
    
    // Clear previous content
    clearImagePreview();
    
    // Add the new image
    previewContainer.appendChild(imgElement);
}

/**
 * Create an image element from a file
 * @param {File} file - The image file
 * @returns {Promise<HTMLImageElement>} A promise that resolves to the created image element
 */
function createImageFromFile(file) {
    return new Promise((resolve, reject) => {
        if (!file.type.match('image.*')) {
            reject(new Error('File is not an image'));
            return;
        }
        
        const img = document.createElement('img');
        img.file = file;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
            img.onload = () => resolve(img);
        };
        reader.onerror = (e) => reject(e);
        
        reader.readAsDataURL(file);
    });
}

/**
 * Apply visual effect to the preview image to indicate processing
 * @param {boolean} isProcessing - Whether the image is being processed
 */
function setProcessingState(isProcessing) {
    const previewContainer = document.getElementById('image-preview');
    
    if (!previewContainer) {
        console.error('Image preview container not found');
        return;
    }
    
    if (isProcessing) {
        previewContainer.classList.add('processing');
    } else {
        previewContainer.classList.remove('processing');
    }
}

/**
 * Get the current image element from the preview
 * @returns {HTMLImageElement|null} The current image element or null if not found
 */
function getCurrentPreviewImage() {
    const previewContainer = document.getElementById('image-preview');
    
    if (!previewContainer) {
        console.error('Image preview container not found');
        return null;
    }
    
    return previewContainer.querySelector('img');
}

// Export functions for use in other modules
// Note: In a real application with modules, we would use proper export statements
window.imagePreview = {
    initialize: initializeImagePreview,
    clear: clearImagePreview,
    setImage: setPreviewImage,
    createFromFile: createImageFromFile,
    setProcessingState: setProcessingState,
    getCurrentImage: getCurrentPreviewImage
};
