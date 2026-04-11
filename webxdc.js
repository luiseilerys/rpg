// Webxdc API Polyfill for development and testing
// This file provides a mock implementation of the Webxdc API
// When running in Delta Chat, the real webxdc API will be available

(function() {
  if (window.webxdc) {
    // Webxdc API already exists (running in Delta Chat)
    return;
  }

  // Mock Webxdc API for browser development
  window.webxdc = {
    // Send data to other instances
    sendUpdate: function(update, description) {
      console.log('[Webxdc] sendUpdate:', update, description);
      // In development mode, just log it
    },

    // Get the last known update
    getLastUpdate: function() {
      console.log('[Webxdc] getLastUpdate');
      return null;
    },

    // Get all updates
    getUpdates: function(serial = 0) {
      console.log('[Webxdc] getUpdates:', serial);
      return [];
    },

    // Send a message to the chat
    sendToChat: async function(message) {
      console.log('[Webxdc] sendToChat:', message);
      if (message.file && message.text) {
        alert('Send to chat: ' + message.text + ' (file included)');
      } else if (message.text) {
        alert('Send to chat: ' + message.text);
      }
    },

    // Set an event listener for updates
    setUpdateListener: function(listener, serial = 0) {
      console.log('[Webxdc] setUpdateListener:', serial);
      // In development mode, we don't actually call the listener
    },

    // Remove the update listener
    removeUpdateListener: function() {
      console.log('[Webxdc] removeUpdateListener');
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
      window.open(url, '_blank');
    }
  };

  console.log('[Webxdc] Polyfill loaded - running in development mode');
})();
