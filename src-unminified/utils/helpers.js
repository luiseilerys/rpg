/**
 * The First Dungeon - Utility Functions
 * Global helper functions for DOM manipulation and logging
 */

/**
 * Log message to console with timestamp
 * @param {...any} args - Arguments to log
 */
export function log(...args) {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    console.log(`[${timestamp}]`, ...args);
}

/**
 * Log error message to console
 * @param {...any} args - Arguments to log as error
 */
export function error(...args) {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    console.error(`[${timestamp}] ERROR:`, ...args);
}

/**
 * Show a DOM element
 * @param {string} selector - CSS selector for the element
 */
export function show(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.style.display = 'flex';
        if (element.id === 'game-ui') {
            element.style.display = 'block';
        }
    } else {
        console.warn(`[UI] Element not found: ${selector}`);
    }
}

/**
 * Hide a DOM element
 * @param {string} selector - CSS selector for the element
 */
export function hide(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.style.display = 'none';
    } else {
        console.warn(`[UI] Element not found: ${selector}`);
    }
}

/**
 * Get item from localStorage
 * @param {string} key - Storage key
 * @returns {any} Parsed value or null
 */
export function getLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        error(`[STORAGE] Failed to get ${key}:`, e);
        return null;
    }
}

/**
 * Set item in localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        error(`[STORAGE] Failed to set ${key}:`, e);
    }
}

// Make functions available globally for legacy code
if (typeof window !== 'undefined') {
    window.log = log;
    window.error = error;
    window.show = show;
    window.hide = hide;
    window.getLocalStorage = getLocalStorage;
    window.setLocalStorage = setLocalStorage;
}
