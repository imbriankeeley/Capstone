// File: fruit-ripeness-classifier/js/upload.js
// Image upload functionality for Fruit Ripeness Classification System

/**
 * Initialize the upload component
 * Sets up the drag-and-drop and file selection functionality
 */
function initializeUploadComponent() {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');
    
    if (!dropArea || !fileInput || !uploadButton) {
        console.error('Upload component elements not found');
        return;
    }
    
    console.log('Initializing upload component');
    
    // Set up event listeners for drag and drop
    setupDragAndDropEvents(dropArea);
    
    // Set up file input change event
    fileInput.addEventListener('change', (e) => {
        handleFileUpload(e.target.files[0]);
    });
    
    // Set up upload button click event
    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });
    
    console.log('Upload component initialized');
}

/**
 * Set up drag and drop event listeners
 * @param {HTMLElement} dropArea - The drop area element
 */
function setupDragAndDropEvents(dropArea) {
    // Prevent default behaviors for drag events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when dragging over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    // Remove highlight when dragging leaves drop area
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);
}

/**
 * Prevent default behaviors for events
 * @param {Event} e - The event object
 */
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

/**
 * Highlight the drop area
 * @param {Event} e - The event object
 */
function highlight(e) {
    document.getElementById('drop-area').classList.add('active');
}

/**
 * Remove highlight from the drop area
 * @param {Event} e - The event object
 */
function unhighlight(e) {
    document.getElementById('drop-area').classList.remove('active');
}

/**
 * Handle file drop event
 * @param {DragEvent} e - The drag event object
 */
function handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    handleFileUpload(file);
}

/**
 * Handle the uploaded file
 * @param {File} file - The uploaded file
 */
function handleFileUpload(file) {
    if (!file) {
        console.error('No file provided');
        return;
    }
    
    if (!file.type.match('image.*')) {
        showNotification('Please upload an image file', 'error');
        return;
    }
    
    console.log('File uploaded:', file.name);
    
    // Show loading indicator
    showLoadingIndicator(true);
    
    // Display the uploaded image
    displayUploadedImage(file);
    
    // Update application state
    appState.updateState({
        currentImage: file
    });
}

/**
 * Display the uploaded image in the preview area
 * @param {File} file - The image file to display
 */
function displayUploadedImage(file) {
    const preview = document.getElementById('image-preview');
    
    if (!preview) {
        console.error('Image preview element not found');
        showLoadingIndicator(false);
        return;
    }
    
    // Clear previous preview
    preview.innerHTML = '';
    
    // Create image element
    const img = document.createElement('img');
    img.file = file;
    img.classList.add('preview-image');
    
    // Add to preview
    preview.appendChild(img);
    
    // Read and set the image
    const reader = new FileReader();
    reader.onload = (function(aImg) {
        return function(e) {
            aImg.src = e.target.result;
            
            // Once image is loaded, trigger classification
            aImg.onload = function() {
                // Check if we need to wait for model loading
                if (window.model) {
                    processImageClassification(aImg, file);
                } else {
                    // Initialize classifier if not already done
                    initializeClassifier().then(() => {
                        processImageClassification(aImg, file);
                    }).catch(err => {
                        console.error('Error initializing classifier:', err);
                        showNotification('Error loading classification model', 'error');
                        showLoadingIndicator(false);
                    });
                }
            };
        };
    })(img);
    
    reader.readAsDataURL(file);
}

/**
 * Process image classification
 * @param {HTMLImageElement} img - The image element
 * @param {File} file - The original file for metadata
 */
function processImageClassification(img, file) {
    // Ensure the results section is visible
    document.getElementById('results-section').classList.remove('hidden');
    
    // Classify the image
    classifyImage(img, file).then(results => {
        // Hide loading indicator
        showLoadingIndicator(false);
    }).catch(err => {
        console.error('Classification error:', err);
        showNotification('Error processing image', 'error');
        showLoadingIndicator(false);
    });
}

/**
 * Show or hide the loading indicator
 * @param {boolean} show - Whether to show the loading indicator
 */
function showLoadingIndicator(show) {
    const loadingIndicator = document.getElementById('loading-indicator');
    
    if (loadingIndicator) {
        if (show) {
            loadingIndicator.classList.remove('hidden');
        } else {
            loadingIndicator.classList.add('hidden');
        }
    }
}

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (info, success, error)
 */
function showNotification(message, type = 'info') {
    // You can implement a toast notification here
    // For simplicity, we'll just use console.log
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
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Export functions globally
window.initializeUploadComponent = initializeUploadComponent;
