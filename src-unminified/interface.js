/**
 * The First Dungeon - UI Interface
 * Handles all user interface elements and updates
 */

import { log, error } from './utils/helpers.js';

export class Interface {
    constructor () {
        this.playerStats = null;
        this.messageQueue = [];
        this.currentMessage = null;
        this.messageTimer = 0;
        this.uiInitialized = false;

        // Don't initialize UI in constructor - wait for DOM to be ready
        // InitializeUI will be called when Show() is first called
    }

    /**
     * Initialize UI elements
     */
    InitializeUI () {
        // Prevent double initialization
        if (this.uiInitialized) {return;}
        
        // Check if document.body is available
        if (!document.body) {
            error('[UI] Cannot initialize - document.body is null');
            return;
        }

        // Create player stats container if not exists
        if (!document.getElementById('player-stats')) {
            this.CreatePlayerStatsUI();
        }

        // Create message display if not exists
        if (!document.getElementById('message-display')) {
            this.CreateMessageUI();
        }

        this.uiInitialized = true;
        log('[UI] Interface initialized');
    }

    /**
     * Create player stats UI
     */
    CreatePlayerStatsUI () {
        const statsContainer = document.createElement('div');
        statsContainer.id = 'player-stats';
        statsContainer.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #4A90D9;
            border-radius: 8px;
            padding: 15px;
            color: white;
            font-family: Arial, sans-serif;
            min-width: 200px;
            z-index: 1000;
        `;

        statsContainer.innerHTML = `
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #4A90D9;">
                Player Stats
            </div>
            <div id="hp-bar-container" style="margin-bottom: 8px;">
                <div style="font-size: 12px; margin-bottom: 3px;">HP</div>
                <div style="background: #333; height: 16px; border-radius: 3px; overflow: hidden;">
                    <div id="hp-bar" style="background: linear-gradient(to right, #ff4444, #ff6666); height: 100%; width: 100%; transition: width 0.3s;"></div>
                </div>
                <div id="hp-text" style="font-size: 11px; text-align: right; margin-top: 2px;">100/100</div>
            </div>
            <div id="exp-bar-container" style="margin-bottom: 8px;">
                <div style="font-size: 12px; margin-bottom: 3px;">EXP</div>
                <div style="background: #333; height: 10px; border-radius: 3px; overflow: hidden;">
                    <div id="exp-bar" style="background: linear-gradient(to right, #44ff44, #66ff66); height: 100%; width: 0%; transition: width 0.3s;"></div>
                </div>
                <div id="exp-text" style="font-size: 11px; text-align: right; margin-top: 2px;">0/100</div>
            </div>
            <div id="level-display" style="font-size: 14px; margin-bottom: 5px;">Level: 1</div>
            <div id="gold-display" style="font-size: 14px; color: #FFD700;">Gold: 0</div>
        `;

        document.body.appendChild(statsContainer);
        this.playerStats = statsContainer;
    }

    /**
     * Create message display UI
     */
    CreateMessageUI () {
        const messageDisplay = document.createElement('div');
        messageDisplay.id = 'message-display';
        messageDisplay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #FFFFFF;
            border-radius: 8px;
            padding: 20px 40px;
            color: white;
            font-family: Arial, sans-serif;
            font-size: 18px;
            text-align: center;
            z-index: 2000;
            display: none;
            animation: fadeInOut 2s ease-in-out;
        `;

        document.body.appendChild(messageDisplay);
    }

    /**
     * Update player stats display
     * @param {Object} stats - Player stats object
     */
    UpdatePlayerStats (stats) {
        if (!this.playerStats) {return;}

        // Update HP bar
        const hpBar = document.getElementById('hp-bar');
        const hpText = document.getElementById('hp-text');
        if (hpBar && hpText) {
            const hpPercent = (stats.hp / stats.maxHp) * 100;
            hpBar.style.width = `${Math.max(0, Math.min(100, hpPercent))}%`;
            hpText.textContent = `${Math.floor(stats.hp)}/${stats.maxHp}`;

            // Change color based on HP percentage
            if (hpPercent < 30) {
                hpBar.style.background = 'linear-gradient(to right, #ff0000, #ff3333)';
            } else if (hpPercent < 60) {
                hpBar.style.background = 'linear-gradient(to right, #ffaa00, #ffcc00)';
            } else {
                hpBar.style.background = 'linear-gradient(to right, #44ff44, #66ff66)';
            }
        }

        // Update EXP bar
        const expBar = document.getElementById('exp-bar');
        const expText = document.getElementById('exp-text');
        if (expBar && expText) {
            const expPercent = (stats.exp / stats.expToNext) * 100;
            expBar.style.width = `${Math.max(0, Math.min(100, expPercent))}%`;
            expText.textContent = `${stats.exp}/${stats.expToNext}`;
        }

        // Update level
        const levelDisplay = document.getElementById('level-display');
        if (levelDisplay) {
            levelDisplay.textContent = `Level: ${stats.level}`;
        }

        // Update gold
        const goldDisplay = document.getElementById('gold-display');
        if (goldDisplay) {
            goldDisplay.textContent = `Gold: ${stats.gold}`;
        }
    }

    /**
     * Show a message to the player
     * @param {string} message - Message to display
     * @param {number} duration - Display duration in ms
     */
    ShowMessage (message, duration = 2000) {
        const messageDisplay = document.getElementById('message-display');
        if (!messageDisplay) {return;}

        messageDisplay.textContent = message;
        messageDisplay.style.display = 'block';
        messageDisplay.style.animation = 'none';
        messageDisplay.offsetHeight; // Trigger reflow
        messageDisplay.style.animation = `fadeInOut ${duration}ms ease-in-out`;

        setTimeout(() => {
            messageDisplay.style.display = 'none';
        }, duration);
    }

    /**
     * Set loading text
     * @param {string} text - Loading text
     */
    SetLoadingText (text) {
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = text;
        }
        log(`[LOAD] ${text}`);
    }

    /**
     * Show/hide UI element
     * @param {string} selector - CSS selector
     */
    ToggleUI (selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.style.display = element.style.display === 'none' ? 'block' : 'none';
        }
    }

    /**
     * Create damage popup (alternative to PIXI-based)
     * @param {number} x - Screen X
     * @param {number} y - Screen Y
     * @param {number} damage - Damage amount
     */
    ShowDamagePopup (x, y, damage) {
        const popup = document.createElement('div');
        popup.textContent = damage;
        popup.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            color: #ff4444;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 2px 2px 0 #000;
            pointer-events: none;
            z-index: 1500;
            animation: floatUp 1s ease-out forwards;
        `;

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 1000);
    }

    /**
     * Create inventory UI
     */
    CreateInventoryUI () {
        const inventoryContainer = document.createElement('div');
        inventoryContainer.id = 'inventory-ui';
        inventoryContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #4A90D9;
            border-radius: 8px;
            padding: 20px;
            color: white;
            font-family: Arial, sans-serif;
            z-index: 3000;
            display: none;
            max-width: 400px;
            max-height: 500px;
            overflow-y: auto;
        `;

        inventoryContainer.innerHTML = `
            <div style="font-size: 20px; font-weight: bold; margin-bottom: 15px; text-align: center;">
                Inventory
            </div>
            <div id="inventory-items" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;">
                <!-- Items will be added here -->
            </div>
            <div style="text-align: center; margin-top: 15px; font-size: 12px; color: #888;">
                Press I to close
            </div>
        `;

        document.body.appendChild(inventoryContainer);
        return inventoryContainer;
    }

    /**
     * Update inventory display
     * @param {Array} items - Array of item objects
     */
    UpdateInventory (items) {
        const inventoryItems = document.getElementById('inventory-items');
        if (!inventoryItems) {return;}

        inventoryItems.innerHTML = '';

        items.forEach((item, index) => {
            const itemSlot = document.createElement('div');
            itemSlot.style.cssText = `
                width: 50px;
                height: 50px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid #666;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                position: relative;
            `;
            itemSlot.title = item.name;
            itemSlot.onclick = () => this.UseItem(index);

            if (item.icon) {
                itemSlot.innerHTML = `<img src="${item.icon}" style="width: 32px; height: 32px;">`;
            } else {
                itemSlot.textContent = item.name.charAt(0).toUpperCase();
            }

            // Quantity badge
            if (item.quantity > 1) {
                const badge = document.createElement('span');
                badge.textContent = item.quantity;
                badge.style.cssText = `
                    position: absolute;
                    bottom: 2px;
                    right: 2px;
                    font-size: 10px;
                    color: white;
                    background: rgba(0, 0, 0, 0.7);
                    padding: 1px 4px;
                    border-radius: 3px;
                `;
                itemSlot.appendChild(badge);
            }

            inventoryItems.appendChild(itemSlot);
        });
    }

    /**
     * Use item from inventory
     * @param {number} index - Item index
     */
    UseItem (index) {
        if (gameInstance?.player) {
            const used = gameInstance.player.UseItem(index);
            if (used) {
                this.UpdateInventory(gameInstance.player.inventory);
                this.UpdatePlayerStats({
                    hp: gameInstance.player.hp,
                    maxHp: gameInstance.player.maxHp,
                    exp: gameInstance.player.exp,
                    expToNext: gameInstance.player.expToNextLevel,
                    level: gameInstance.player.level,
                    gold: gameInstance.player.gold
                });
            }
        }
    }

    /**
     * Add CSS animations for UI effects
     */
    InjectAnimations () {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                90% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
            
            @keyframes floatUp {
                0% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-50px); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Inject animations on load
if (typeof document !== 'undefined') {
    const ui = new Interface();
    ui.InjectAnimations();
}
