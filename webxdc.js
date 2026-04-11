// Webxdc API Polyfill for development and testing
// This file provides a mock implementation of the Webxdc API
// When running in Delta Chat, the real webxdc API will be available

(function() {
  if (window.webxdc) {
    // Webxdc API already exists (running in Delta Chat)
    return;
  }

  // Persistent storage for development mode
  const STORAGE_KEY = 'webxdc_dev_storage';
  let updateListeners = [];
  let updates = [];
  let serialCounter = 0;

  // Load persisted state
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        updates = state.updates || [];
        serialCounter = state.serialCounter || 0;
      }
    } catch (e) {
      console.warn('[Webxdc] Failed to load state:', e);
    }
  }

  // Save state
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        updates,
        serialCounter
      }));
    } catch (e) {
      console.warn('[Webxdc] Failed to save state:', e);
    }
  }

  loadState();

  // Mock Webxdc API for browser development
  window.webxdc = {
    // Send data to other instances
    sendUpdate: function(update, description) {
      console.log('[Webxdc] sendUpdate:', update, description);
      serialCounter++;
      const updateObj = {
        payload: update,
        description: description,
        serial: serialCounter,
        info: this.getInfo()
      };
      updates.push(updateObj);
      saveState();
      
      // Notify all listeners
      updateListeners.forEach(listener => {
        try {
          listener(updateObj);
        } catch (e) {
          console.error('[Webxdc] Error in update listener:', e);
        }
      });
    },

    // Get the last known update
    getLastUpdate: function() {
      console.log('[Webxdc] getLastUpdate');
      return updates.length > 0 ? updates[updates.length - 1] : null;
    },

    // Get all updates
    getUpdates: function(serial = 0) {
      console.log('[Webxdc] getUpdates:', serial);
      return updates.filter(u => u.serial > serial);
    },

    // Send a message to the chat
    sendToChat: async function(message) {
      console.log('[Webxdc] sendToChat:', message);
      if (message.file && message.text) {
        const confirmed = confirm(`Send to chat: ${message.text}\n(File included: ${message.file.name})`);
        if (confirmed) {
          alert('✓ Message sent to chat!');
        }
      } else if (message.text) {
        const confirmed = confirm(`Send to chat: ${message.text}`);
        if (confirmed) {
          alert('✓ Message sent to chat!');
        }
      }
    },

    // Set an event listener for updates
    setUpdateListener: function(listener, serial = 0) {
      console.log('[Webxdc] setUpdateListener:', serial);
      updateListeners.push(listener);
      
      // Replay missed updates
      const missedUpdates = updates.filter(u => u.serial > serial);
      missedUpdates.forEach(update => {
        try {
          listener(update);
        } catch (e) {
          console.error('[Webxdc] Error replaying update:', e);
        }
      });
    },

    // Remove the update listener
    removeUpdateListener: function() {
      console.log('[Webxdc] removeUpdateListener');
      updateListeners = [];
    },

    // Get info about the webxdc instance
    getInfo: function() {
      console.log('[Webxdc] getInfo');
      return {
        addr: 'dev@example.com',
        displayname: 'Developer',
        name: 'The First Dungeon',
        selfAddr: 'dev@example.com',
        selfDisplayName: 'Developer'
      };
    },

    // Get account info
    getAccountInfo: function() {
      console.log('[Webxdc] getAccountInfo');
      return {
        addr: 'dev@example.com',
        displayname: 'Developer'
      };
    },

    // Navigate to a URL in the default browser
    openUrl: function(url) {
      console.log('[Webxdc] openUrl:', url);
      if (confirm(`Open external URL: ${url}?`)) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  console.log('[Webxdc] Polyfill loaded - running in development mode with persistence');
})();
