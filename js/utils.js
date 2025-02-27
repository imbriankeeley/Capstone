// File: fruit-ripeness-classifier/js/utils.js
// Utility functions for Fruit Ripeness Classification System

/**
 * Utility module containing helper functions used across the application
 */

/**
 * Format a decimal number as a percentage
 * @param {number} value - The decimal value to format
 * @param {number} [precision=1] - Number of decimal places
 * @returns {string} Formatted percentage string
 */
function formatPercentage(value, precision = 1) {
    return value.toFixed(precision) + '%';
}

/**
 * Get the appropriate color for a ripeness category
 * @param {string} category - The ripeness category
 * @returns {string} CSS color code
 */
function getRipenessColor(category) {
    const colors = {
        'unripe': '#8bc34a',    // Light green
        'ripe': '#4caf50',      // Green
        'overripe': '#ff9800',  // Orange
        'spoiled': '#f44336'    // Red
    };
    
    return colors[category] || '#9e9e9e'; // Default to gray if category not found
}

/**
 * Generate a color scale based on confidence value
 * @param {number} confidence - The confidence value (0-100)
 * @param {string} baseColor - The base color to scale from
 * @returns {string} CSS color code
 */
function getConfidenceColor(confidence, baseColor) {
    // Convert hex to RGB
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    // Calculate alpha based on confidence
    const alpha = confidence / 100;
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Create an element with given attributes and children
 * @param {string} tag - The HTML tag name
 * @param {Object} [attributes={}] - Element attributes
 * @param {Array|string} [children=[]] - Child elements or text content
 * @returns {HTMLElement} The created element
 */
function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'classList' && Array.isArray(value)) {
            element.classList.add(...value);
        } else {
            element.setAttribute(key, value);
        }
    }
    
    // Add children
    if (typeof children === 'string') {
        element.textContent = children;
    } else if (Array.isArray(children)) {
        children.forEach(child => {
            if (child instanceof HTMLElement) {
                element.appendChild(child);
            } else if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            }
        });
    }
    
    return element;
}

/**
 * Format a date to readable string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

/**
 * Debounce function to limit how often a function is called
 * @param {Function} func - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, delay) {
    let timeout;
    
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Get a simplified fruit name from a file name
 * @param {string} fileName - The file name to parse
 * @returns {string} Simplified fruit name
 */
function getFruitTypeFromFileName(fileName) {
    // Extract the file name without extension
    const name = fileName.split('.')[0].toLowerCase();
    
    // List of common fruits to detect
    const fruits = [
        'apple', 'banana', 'orange', 'strawberry', 'grape', 
        'blueberry', 'pear', 'peach', 'plum', 'mango',
        'kiwi', 'pineapple', 'watermelon', 'cherry'
    ];
    
    // Find the first fruit that matches in the filename
    for (const fruit of fruits) {
        if (name.includes(fruit)) {
            return fruit;
        }
    }
    
    // Default return if no match found
    return 'unknown';
}

/**
 * Get recommendation text based on ripeness category
 * @param {string} category - The ripeness category
 * @returns {string} Recommendation text
 */
function getRecommendationText(category) {
    const recommendations = {
        'unripe': 'Keep in storage for ripening',
        'ripe': 'Display for immediate sale',
        'overripe': 'Discount and prioritize for sale',
        'spoiled': 'Remove from inventory'
    };
    
    return recommendations[category] || 'Unknown recommendation';
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Expose utilities for use in other modules
// Note: In a real application with modules, we would use proper export statements
// window.utils = {
//     formatPercentage,
//     getRipenessColor,
//     getConfidenceColor,
//     createElement,
//     formatDate,
//     debounce,
//     getFruitTypeFromFileName,
//     getRecommendationText,
//     generateUniqueId
// };
