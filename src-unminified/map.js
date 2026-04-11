/**
 * The First Dungeon - Map System
 * Handles map loading, rendering, and collision detection
 */

import { CONFIG } from './core/constants.js';

export class Map extends PIXI.Container {
    constructor () {
        super();

        this.tileSize = 32;
        this.tiles = [];
        this.width = 0;
        this.height = 0;
        this.basePosition = { x: 0, y: 0 };
        this.camera = { x: 0, y: 0 };
        this.loaded = false;

        // Collision data
        this.collisionLayer = [];

        // Visual layers
        this.layers = {
            ground: new PIXI.Container(),
            objects: new PIXI.Container(),
            overlay: new PIXI.Container()
        };

        // Add layers to container
        this.addChild(this.layers.ground);
        this.addChild(this.layers.objects);
        this.addChild(this.layers.overlay);
    }

    /**
     * Load map data
     * @param {string} mapName - Name of the map to load
     * @param {Function} callback - Callback when map is loaded
     */
    Load (mapName, callback) {
        log(`[MAP] Loading map: ${mapName}`);

        // Load map JSON data
        fetch(`${ASSETS_PATH}maps/${mapName}.json`, {
            cache: 'force-cache'
        })
            .then(response => response.json())
            .then(data => {
                this.ParseMapData(data);
                this.RenderMap();
                this.loaded = true;
                log(`[MAP] ${mapName} loaded successfully`);
                callback();
            })
            .catch(error => {
                error(`[ERROR] Failed to load map ${mapName}:`, error);
                callback();
            });
    }

    /**
     * Parse map data from JSON
     * @param {Object} data - Map data object
     */
    ParseMapData (data) {
        this.width = data.width || 100;
        this.height = data.height || 50;
        this.tileSize = data.tileSize || 32;

        // Set base position (spawn point)
        this.basePosition = {
            x: data.spawnX || (this.width * this.tileSize) / 2,
            y: data.spawnY || (this.height * this.tileSize) / 2
        };

        // Parse tile layers
        if (data.layers) {
            data.layers.forEach(layer => {
                if (layer.type === 'tilelayer') {
                    if (layer.name === 'collision' || layer.properties?.collision) {
                        this.collisionLayer = layer.data;
                    } else if (layer.name === 'ground') {
                        this.groundLayer = layer.data;
                    }
                }
            });
        }

        // If no specific layers, use raw tiles
        if (!this.groundLayer && data.tiles) {
            this.tiles = data.tiles;
        }
    }

    /**
     * Render map tiles
     */
    RenderMap () {
        log('[MAP] Rendering map...');

        // Create tilemap texture for better performance
        const texture = PIXI.Texture.from('map_tileset');

        // For large maps, use tiling sprite
        if (this.width > 50 || this.height > 50) {
            this.renderTiledMap(texture);
        } else {
            this.renderTileByTile(texture);
        }
    }

    /**
     * Render map using TilingSprite (optimized for large maps)
     */
    renderTiledMap (texture) {
        const tilingSprite = new PIXI.TilingSprite(texture, this.width * this.tileSize, this.height * this.tileSize);

        this.layers.ground.addChild(tilingSprite);
    }

    /**
     * Render map tile by tile (for smaller maps or detailed areas)
     */
    renderTileByTile (texture) {
        const tileSize = this.tileSize;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tileIndex = y * this.width + x;
                const tileId = this.tiles[tileIndex] || 0;

                if (tileId > 0) {
                    const sprite = new PIXI.Sprite(texture);
                    sprite.position.set(x * tileSize, y * tileSize);

                    // Set texture frame based on tile ID
                    // Assuming tiles are arranged in a grid in the tileset
                    const tilesPerRow = Math.floor(texture.width / tileSize);
                    const frameX = (tileId % tilesPerRow) * tileSize;
                    const frameY = Math.floor(tileId / tilesPerRow) * tileSize;

                    sprite.texture.frame = new PIXI.Rectangle(frameX, frameY, tileSize, tileSize);

                    this.layers.ground.addChild(sprite);
                }
            }
        }
    }

    /**
     * Update map each tick
     * @param {Game} game - Game instance
     */
    OnTickUpdate (game) {
        // Update camera position
        if (game.player) {
            this.updateCamera(game.player);
        }
    }

    /**
     * Center camera on target entity
     * @param {Entity} target - Entity to follow
     */
    centerCamera (target) {
        this.camera.x = target.x - window.innerWidth / 2;
        this.camera.y = target.y - window.innerHeight / 2;

        // Clamp to map bounds
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.width * this.tileSize - window.innerWidth));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.height * this.tileSize - window.innerHeight));

        this.updateCameraTransform();
    }

    /**
     * Update camera transform
     */
    updateCamera () {
        this.updateCameraTransform();
    }

    /**
     * Apply camera transform to map layers
     */
    updateCameraTransform () {
        this.layers.ground.position.set(-this.camera.x, -this.camera.y);
        this.layers.objects.position.set(-this.camera.x, -this.camera.y);
        this.layers.overlay.position.set(-this.camera.x, -this.camera.y);
    }

    /**
     * Check collision at world position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean}
     */
    isColliding (x, y) {
        // Convert world position to tile coordinates
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);

        // Check bounds
        if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
            return true; // Out of bounds is collidable
        }

        // Check collision layer
        if (this.collisionLayer.length > 0) {
            const index = tileY * this.width + tileX;
            return this.collisionLayer[index] !== 0;
        }

        return false;
    }

    /**
     * Check collision for rectangle (AABB)
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} width - Width
     * @param {number} height - Height
     * @returns {boolean}
     */
    isRectColliding (x, y, width, height) {
        // Check all four corners
        return (
            this.isColliding(x, y) ||
            this.isColliding(x + width, y) ||
            this.isColliding(x, y + height) ||
            this.isColliding(x + width, y + height)
        );
    }

    /**
     * Get tile at world position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {number} Tile ID
     */
    getTileAt (x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);

        if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
            return 0;
        }

        const index = tileY * this.width + tileX;
        return this.tiles[index] || 0;
    }

    /**
     * Set tile at world position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} tileId - Tile ID
     */
    setTileAt (x, y, tileId) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);

        if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
            return;
        }

        const index = tileY * this.width + tileX;
        this.tiles[index] = tileId;
    }

    /**
     * Convert world coordinates to screen coordinates
     * @param {number} x - World X
     * @param {number} y - World Y
     * @returns {{x: number, y: number}}
     */
    worldToScreen (x, y) {
        return {
            x: x - this.camera.x,
            y: y - this.camera.y
        };
    }

    /**
     * Convert screen coordinates to world coordinates
     * @param {number} x - Screen X
     * @param {number} y - Screen Y
     * @returns {{x: number, y: number}}
     */
    screenToWorld (x, y) {
        return {
            x: x + this.camera.x,
            y: y + this.camera.y
        };
    }

    /**
     * Destroy map and cleanup
     */
    destroy () {
        this.layers.ground.removeChildren();
        this.layers.objects.removeChildren();
        this.layers.overlay.removeChildren();
        super.destroy();
    }
}
