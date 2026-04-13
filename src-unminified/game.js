/**
 * The First Dungeon - Game Core
 * Main game loop, initialization, and state management
 */

import { CONFIG, ASSETS, DEVELOPMENT, GAME_STATES } from './core/constants.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { EffectSystem } from './systems/EffectSystem.js';
import { Player } from './entities/player.js';
import { Map } from './map.js';
import { log, error, show, hide, getLocalStorage, setLocalStorage } from './utils/helpers.js';

const LOADER = PIXI.Loader.shared;
let entityID = 1;

export class Game {
    width = window.innerWidth;
    height = window.innerHeight;
    proto = {};
    lastSave = 0;
    running = false;
    app = null;
    player = null;
    map = null;
    collisionSystem = null;
    effectSystem = null;
    currentState = GAME_STATES.MENU;

    constructor () {
        window.onresize = () => {
            this.width = this.app.width = window.innerWidth;
            this.height = this.app.height = window.innerHeight;
        };
    }

    /**
     * Main game loop with delta time
     */
    GameLoop (deltaTime) {
        if (!this.running || !this.player) {return;}

        // Update entities
        this.player.OnTickUpdate(this);
        this.map?.OnTickUpdate(this);

        // Update systems
        this.collisionSystem?.update();
        this.effectSystem?.update(deltaTime);

        // Auto-save
        this.Save();
    }

    /**
     * Start the game
     */
    StartGame () {
        if (this.running) {return;}

        hide('#main-menu');
        show('#loading-window');
        this.currentState = GAME_STATES.LOADING;

        // Initialize interface now that we're starting the game
        if (!gameInterface) {
            gameInterface = new Interface();
            window.gameInterface = gameInterface;
        }

        this.__initGame();
    }

    /**
     * Initialize game engine
     */
    __initGame () {
        // Create PIXI application with optimized settings
        this.app = new PIXI.Application({
            width: this.width,
            height: this.height,
            antialias: true,
            preserveDrawingBuffer: true,
            backgroundColor: 0x1a1a2e,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        document.body.appendChild(this.app.view);

        // Handle WebGL context lost
        this.app.view.addEventListener('webglcontextlost', e => {
            e.preventDefault();
            log('[ERROR] WebGL context lost, attempting restore...');
        });

        log('[INFO] Game init DONE!');
        gameInterface.SetLoadingText('Game initialization...');

        // Initialize systems
        this.collisionSystem = new CollisionSystem(CONFIG.worldWidth, CONFIG.worldHeight);
        this.effectSystem = new EffectSystem(this.app);

        // Load assets
        this.__loadAssets();

        // Start render loop
        this.app.ticker.add(deltaTime => this.GameLoop(deltaTime * 16));
    }

    /**
     * Load all game assets with caching optimization
     */
    __loadAssets () {
        gameInterface.SetLoadingText('Load assets...');

        const loader = PIXI.Loader.shared;

        // Optimize caching for production
        loader.defaultQueryString = DEVELOPMENT ? `v=${Date.now()}` : `v=${CONFIG.version}`;
        loader.baseUrl = ASSETS_PATH;

        // Progress tracking
        loader.onProgress.add((loader, resource) => {
            const progress = Math.round(loader.progress);
            gameInterface.SetLoadingText(`Loading: ${progress}%`);
            log(`[ASSET] ${resource.name}: ${progress}%`);
        });

        // Completion handler
        loader.onComplete.add(() => {
            log('[INFO] Load assets DONE!');
            this.__LoadProtoTables();
        });

        // Error handler
        loader.onError.add((error, loader, resource) => {
            error(`[ERROR] Failed to load ${resource.url}: ${error.message}`);
        });

        // Add all assets
        for (const key in ASSETS) {
            loader.add(key, ASSETS[key]);
        }

        loader.load();
    }

    /**
     * Load prototype tables
     */
    __LoadProtoTables () {
        this.__loadProto('monster_proto', () => {
            this.__loadProto('collision', () => {
                this.__loadProto('item_proto', () => {
                    this.__loadMap();
                });
            });
        });
    }

    /**
     * Load a single proto table with caching control
     */
    __loadProto (name, callback) {
        gameInterface.SetLoadingText(`Load ${name} table...`);

        fetch(`${ASSETS_PATH}${name}.json`, {
            cache: DEVELOPMENT ? 'no-store' : 'force-cache'
        })
            .then(response => response.json())
            .then(data => {
                this.proto[name] = data;
                log(`[INFO] ${name} load DONE!`);
                callback();
            })
            .catch(error => {
                error(`[ERROR] Failed to load ${name}: ${error.message}`);
            });
    }

    /**
     * Load map data
     */
    __loadMap () {
        gameInterface.SetLoadingText('Load map data...');

        this.map = new Map();
        this.map.Load('empire1', () => {
            log('[INFO] Map load DONE!');
            this.__loadCharacter();
        });

        this.app.stage.addChild(this.map);
    }

    /**
     * Load/create player character
     */
    __loadCharacter () {
        gameInterface.SetLoadingText('Load character...');

        // Calculate spawn position
        let spawnX = this.map.basePosition.x;
        let spawnY = this.map.basePosition.y;

        // Try to load saved position
        const saveData = getLocalStorage('save_data');
        if (saveData && saveData.position) {
            spawnX = saveData.position.x;
            spawnY = saveData.position.y;
        }

        // Create player instance
        this.player = new Player(entityID++, spawnX, spawnY, this.map);

        if (!this.player) {
            error('[ERROR] Player instance fail to create.');
            return;
        }

        // Add player to collision system
        this.collisionSystem.addEntity(this.player);

        // Add player to stage
        this.app.stage.addChild(this.player);

        // Center camera on player
        this.map.centerCamera(this.player);

        log('[INFO] Character load DONE!');

        // Game ready
        this.__gameReady();
    }

    /**
     * Game is ready to play
     */
    __gameReady () {
        hide('#loading-window');
        show('#game-ui');
        this.running = true;
        this.currentState = GAME_STATES.PLAYING;

        log('[INFO] Game ready!');

        // Show welcome message
        gameInterface.ShowMessage(`Welcome to ${CONFIG.title}!`);
    }

    /**
     * Save game state
     */
    Save () {
        const now = Date.now();
        if (now - this.lastSave < CONFIG.autoSaveInterval * 1000) {return;}

        if (!this.player) {return;}

        try {
            const saveData = {
                version: CONFIG.version,
                timestamp: now,
                position: {
                    x: this.player.x,
                    y: this.player.y
                },
                stats: {
                    level: this.player.level,
                    exp: this.player.exp,
                    hp: this.player.hp,
                    maxHp: this.player.maxHp,
                    attack: this.player.attack,
                    defense: this.player.defense
                },
                inventory: this.player.inventory || []
            };

            setLocalStorage('save_data', saveData);
            this.lastSave = now;

            if (DEVELOPMENT) {
                log('[SAVE] Game saved successfully');
            }
        } catch (error) {
            error('[ERROR] Failed to save game:', error);
        }
    }

    /**
     * Load game state
     */
    Load () {
        try {
            const saveData = getLocalStorage('save_data');
            if (!saveData) {return false;}

            if (saveData.version !== CONFIG.version) {
                log('[WARN] Save version mismatch');
            }

            return saveData;
        } catch (error) {
            error('[ERROR] Failed to load game:', error);
            return null;
        }
    }

    /**
     * Handle key down events
     */
    OnKeyDown (e) {
        if (!this.running || !this.player) {return;}
        this.player.OnKeyDown(e);
    }

    /**
     * Handle key up events
     */
    OnKeyUp (e) {
        if (!this.running || !this.player) {return;}
        this.player.OnKeyUp(e);
    }

    /**
     * Spawn monster
     */
    SpawnMonster (type, x, y) {
        // Implementation in monster.js
        log(`[GAME] Spawning ${type} at (${x}, ${y})`);
    }

    /**
     * Trigger screen shake
     */
    ShakeScreen (intensity, duration) {
        this.effectSystem?.addScreenShake(intensity, duration);
    }

    /**
     * Show damage number
     */
    ShowDamage (x, y, damage, isCritical = false) {
        this.effectSystem?.showDamageNumber(x, y, damage, isCritical);
    }
}
