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
        alert('Please upload an image file');
        return;
    }
    
    console.log('File uploaded:', file.name);
    
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
        return;
    }
    
    // Clear previous preview
    preview.innerHTML = '';
    
    // Create image element
    const img = document.createElement('img');
    img.file = file;
    
    // Add to preview
    preview.appendChild(img);
    
    // Read and set the image
    const reader = new FileReader();
    reader.onload = (function(aImg) {
        return function(e) {
            aImg.src = e.target.result;
            
            // Once image is loaded, trigger classification
            aImg.onload = function() {
                // Only classify if model is loaded
                if (model) {
                    classifyImage(aImg).catch(err => {
                        console.error('Classification error:', err);
                    });
                } else {
                    console.warn('Model not loaded, waiting for model');
                    // TODO: Implement waiting for model to load
                }
            };
        };
    })(img);
    
    reader.readAsDataURL(file);
}

// TODO: Add additional upload-related functions as needed
