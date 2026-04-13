/**
 * The First Dungeon - Main Entry Point
 * Modern ES6 module structure with hot reload support
 */

import { CONFIG, DEVELOPMENT } from './core/constants.js';
import { Game } from './game.js';
import { Interface } from './interface.js';
import { log, error, show, hide, getLocalStorage, setLocalStorage } from './utils/helpers.js';

// Global instances
let gameInstance = null;
let gameInterface = null;

// Initialize when DOM is ready
$(document).ready(() => {
    // Set document title
    $('title').text(CONFIG.title);

    // Initialize game first (without interface)
    gameInstance = new Game();
    
    // Expose to global scope for HTML onclick handlers
    window.gameInstance = gameInstance;

    // Setup keyboard listeners
    document.addEventListener('keypress', e => gameInstance.OnKeyDown(e));
    document.addEventListener('keyup', e => gameInstance.OnKeyUp(e));

    // Log initialization
    if (DEVELOPMENT) {
        log(`[DEV] ${CONFIG.title} v${CONFIG.version} initialized`);
        log('[DEV] Hot reload enabled');
    }
});

// Export for external access
export { gameInstance, gameInterface };

// Handle page visibility changes (save on tab switch)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && gameInstance) {
        gameInstance.Save();
        log('[INFO] Game saved on background');
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (gameInstance) {
        gameInstance.Save();
    }
});
