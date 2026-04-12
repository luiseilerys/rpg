/**
 * The First Dungeon - Base Entity Class
 * Abstract base class for all game entities
 */

import { ENTITY_TYPES } from '../core/constants.js';

export class Entity extends PIXI.Container {
    constructor (id, x, y, type) {
        super();

        this.id = id;
        this.x = x;
        this.y = y;
        this.type = type;

        // Physics
        this.vx = 0;
        this.vy = 0;
        this.speed = 1;

        // Bounds for collision
        this.bounds = {
            x: x - 16,
            y: y - 16,
            width: 32,
            height: 32
        };

        // State
        this.active = true;
        this.visible = true;

        // Sprite reference
        this.sprite = null;
    }

    /**
     * Update entity state
     * @param {Game} game - Game instance
     */
    OnTickUpdate (game) {
        // Override in subclasses
    }

    /**
     * Handle keyboard input
     * @param {KeyboardEvent} e - Key event
     */
    OnKeyDown (e) {
        // Override in subclasses
    }

    /**
     * Handle keyboard release
     * @param {KeyboardEvent} e - Key event
     */
    OnKeyUp (e) {
        // Override in subclasses
    }

    /**
     * Take damage
     * @param {number} amount - Damage amount
     * @param {Entity} attacker - Attacking entity
     */
    TakeDamage (amount, attacker) {
        // Override in subclasses
    }

    /**
     * Update bounds based on position
     */
    updateBounds () {
        this.bounds.x = this.x - this.bounds.width / 2;
        this.bounds.y = this.y - this.bounds.height / 2;
    }

    /**
     * Check if entity is colliding with another
     * @param {Entity} other - Other entity
     * @returns {boolean}
     */
    isCollidingWith (other) {
        return (
            this.bounds.x < other.bounds.x + other.bounds.width &&
            this.bounds.x + this.bounds.width > other.bounds.x &&
            this.bounds.y < other.bounds.y + other.bounds.height &&
            this.bounds.y + this.bounds.height > other.bounds.y
        );
    }

    /**
     * Get distance to another entity
     * @param {Entity} other - Other entity
     * @returns {number}
     */
    getDistanceTo (other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Destroy entity and cleanup
     */
    destroy () {
        this.active = false;
        if (this.sprite) {
            this.removeChild(this.sprite);
            this.sprite.destroy();
        }
        super.destroy();
    }
}
