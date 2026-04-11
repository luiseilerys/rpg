/**
 * The First Dungeon - Player Entity
 * Player character with movement, combat, and progression systems
 */

import { CONFIG, DIRECTIONS, ENTITY_TYPES } from './core/constants.js';
import { Entity } from './entities/entity.js';

export class Player extends Entity {
    constructor (id, x, y, map) {
        super(id, x, y, ENTITY_TYPES.PLAYER);

        // Movement
        this.speed = 3;
        this.moving = false;
        this.direction = DIRECTIONS.DOWN;
        this.keysPressed = {};

        // Stats
        this.level = 1;
        this.exp = 0;
        this.expToNextLevel = 100;
        this.hp = 100;
        this.maxHp = 100;
        this.attack = 10;
        this.defense = 5;

        // Combat
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.attackDuration = 300;
        this.invincible = false;
        this.invincibleTimer = 0;

        // Animation
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.walkCycle = 0;

        // Inventory
        this.inventory = [];
        this.gold = 0;

        // Map reference
        this.map = map;

        // Initialize sprite
        this.InitializeSprite();

        // Load saved data if available
        this.LoadFromSave();
    }

    /**
     * Initialize player sprite
     */
    InitializeSprite () {
        const texture = PIXI.Texture.from('player_sprite');
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.sprite.position.set(this.x, this.y);
        this.addChild(this.sprite);

        // Set initial bounds for collision
        this.bounds = {
            x: this.x - 16,
            y: this.y - 16,
            width: 32,
            height: 32
        };
    }

    /**
     * Load saved player data
     */
    LoadFromSave () {
        try {
            const saveData = getLocalStorage('save_data');
            if (saveData && saveData.stats) {
                this.level = saveData.stats.level || 1;
                this.exp = saveData.stats.exp || 0;
                this.hp = saveData.stats.hp || this.maxHp;
                this.maxHp = saveData.stats.maxHp || 100;
                this.attack = saveData.stats.attack || 10;
                this.defense = saveData.stats.defense || 5;
                this.inventory = saveData.inventory || [];

                log(`[PLAYER] Loaded level ${this.level} character`);
            }
        } catch (error) {
            error('[ERROR] Failed to load player data:', error);
        }
    }

    /**
     * Handle key down events
     */
    OnKeyDown (e) {
        this.keysPressed[e.key.toLowerCase()] = true;

        // Attack on spacebar
        if (e.code === 'Space') {
            this.PerformAttack();
        }

        // Interact on E
        if (e.key.toLowerCase() === 'e') {
            this.Interact();
        }
    }

    /**
     * Handle key up events
     */
    OnKeyUp (e) {
        this.keysPressed[e.key.toLowerCase()] = false;
    }

    /**
     * Update player state each tick
     */
    OnTickUpdate (game) {
        // Update cooldowns
        if (this.attackCooldown > 0) {
            this.attackCooldown -= 16;
        }

        if (this.invincible && this.invincibleTimer > 0) {
            this.invincibleTimer -= 16;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
            // Blink effect
            this.sprite.alpha = Math.sin(Date.now() / 50) > 0 ? 1 : 0.5;
        } else {
            this.sprite.alpha = 1;
        }

        // Handle movement
        this.HandleMovement();

        // Update animation
        this.UpdateAnimation();

        // Update bounds
        this.bounds.x = this.x - 16;
        this.bounds.y = this.y - 16;

        // Sync sprite position
        this.sprite.position.set(this.x, this.y);

        // Update camera
        if (game.map) {
            game.map.centerCamera(this);
        }

        // Update UI
        this.UpdateUI();
    }

    /**
     * Handle player movement
     */
    HandleMovement () {
        let dx = 0;
        let dy = 0;

        // Check input keys
        if (this.keysPressed['w'] || this.keysPressed['arrowup']) {
            dy = -1;
            this.direction = DIRECTIONS.UP;
        }
        if (this.keysPressed['s'] || this.keysPressed['arrowdown']) {
            dy = 1;
            this.direction = DIRECTIONS.DOWN;
        }
        if (this.keysPressed['a'] || this.keysPressed['arrowleft']) {
            dx = -1;
            this.direction = DIRECTIONS.LEFT;
        }
        if (this.keysPressed['d'] || this.keysPressed['arrowright']) {
            dx = 1;
            this.direction = DIRECTIONS.RIGHT;
        }

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }

        // Apply movement if not attacking
        if (!this.isAttacking && (dx !== 0 || dy !== 0)) {
            const newX = this.x + dx * this.speed;
            const newY = this.y + dy * this.speed;

            // Collision detection with map
            if (!this.map.isColliding(newX, this.y)) {
                this.x = newX;
            }
            if (!this.map.isColliding(this.x, newY)) {
                this.y = newY;
            }

            this.moving = true;
            this.walkCycle += 0.3;
        } else {
            this.moving = false;
        }

        // World bounds
        this.x = Math.max(0, Math.min(CONFIG.worldWidth, this.x));
        this.y = Math.max(0, Math.min(CONFIG.worldHeight, this.y));
    }

    /**
     * Perform attack action
     */
    PerformAttack () {
        if (this.attackCooldown > 0 || this.isAttacking) {return;}

        this.isAttacking = true;
        this.attackCooldown = this.attackDuration + 200;

        // Create slash effect
        const slashX = this.x + Math.cos((this.direction * Math.PI) / 2) * 30;
        const slashY = this.y + Math.sin((this.direction * Math.PI) / 2) * 30;

        if (gameInstance?.effectSystem) {
            gameInstance.effectSystem.createSlashEffect(slashX, slashY, this.direction);
            gameInstance.effectSystem.addScreenShake(2, 150);
        }

        // Check for hits
        this.CheckAttackHits();

        // Reset attack state
        setTimeout(() => {
            this.isAttacking = false;
        }, this.attackDuration);
    }

    /**
     * Check if attack hits any enemies
     */
    CheckAttackHits () {
        const attackRange = 50;
        const attackDamage = this.attack;

        // Get nearby monsters from collision system
        if (gameInstance?.collisionSystem) {
            const candidates = gameInstance.collisionSystem.entities.filter(
                entity => entity.type === ENTITY_TYPES.MONSTER
            );

            candidates.forEach(monster => {
                const dx = monster.x - this.x;
                const dy = monster.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < attackRange) {
                    // Hit!
                    monster.TakeDamage(attackDamage, this);

                    // Visual feedback
                    if (gameInstance?.effectSystem) {
                        gameInstance.effectSystem.createHitSpark(monster.x, monster.y);
                    }
                }
            });
        }
    }

    /**
     * Take damage from enemy
     */
    TakeDamage (amount, attacker) {
        if (this.invincible) {return;}

        // Apply defense reduction
        const actualDamage = Math.max(1, amount - this.defense);
        this.hp -= actualDamage;

        // Visual feedback
        if (gameInstance?.effectSystem) {
            gameInstance.effectSystem.showDamageNumber(this.x, this.y - 20, actualDamage, false, 0xff0000);
            gameInstance.effectSystem.addScreenShake(3, 200);
        }

        // Invincibility frames
        this.invincible = true;
        this.invincibleTimer = 1000;

        // Check death
        if (this.hp <= 0) {
            this.OnDeath();
        }

        // Update UI
        this.UpdateUI();
    }

    /**
     * Gain experience points
     */
    GainExp (amount) {
        this.exp += amount;

        // Level up check
        while (this.exp >= this.expToNextLevel && this.level < CONFIG.maxLevel) {
            this.LevelUp();
        }

        this.UpdateUI();
    }

    /**
     * Level up the player
     */
    LevelUp () {
        this.level++;
        this.exp -= this.expToNextLevel;
        this.expToNextLevel = Math.floor(this.expToNextLevel * 1.5);

        // Stat increases
        this.maxHp += 10;
        this.hp = this.maxHp;
        this.attack += 2;
        this.defense += 1;

        // Visual feedback
        if (gameInstance?.effectSystem) {
            gameInstance.effectSystem.showDamageNumber(this.x, this.y - 40, 'LEVEL UP!', false, 0xffff00);
            gameInstance.effectSystem.spawnParticles(this.x, this.y, 20, 0xffff00, 8);
        }

        log(`[PLAYER] Level up! Now level ${this.level}`);
        gameInterface?.ShowMessage(`Level Up! You are now level ${this.level}!`);
    }

    /**
     * Handle player death
     */
    OnDeath () {
        log('[PLAYER] Player died!');

        // Respawn at last safe location
        this.hp = this.maxHp;
        this.x = this.map.basePosition.x;
        this.y = this.map.basePosition.y;

        // Penalty (lose some gold)
        const goldLoss = Math.floor(this.gold * 0.1);
        this.gold -= goldLoss;

        gameInterface?.ShowMessage(`You died! Lost ${goldLoss} gold.`);

        // Save after death
        setTimeout(() => {
            gameInstance?.Save();
        }, 1000);
    }

    /**
     * Interact with nearby objects
     */
    Interact () {
        // Implementation for interacting with NPCs, chests, etc.
        log('[PLAYER] Interact pressed');
    }

    /**
     * Update player animation
     */
    UpdateAnimation () {
        this.animationTimer += 16;

        if (this.moving) {
            // Walking animation
            if (this.animationTimer > 150) {
                this.animationFrame = (this.animationFrame + 1) % 4;
                this.animationTimer = 0;
            }

            // Bobbing effect
            this.sprite.scale.y = 1 + Math.sin(this.walkCycle) * 0.05;
            this.sprite.scale.x = 1 + Math.cos(this.walkCycle) * 0.05;
        } else {
            // Idle animation
            if (this.animationTimer > 500) {
                this.animationFrame = 0;
                this.animationTimer = 0;
            }

            // Reset scale
            this.sprite.scale.set(1);
        }

        // Flip sprite based on direction
        if (this.direction === DIRECTIONS.LEFT) {
            this.sprite.scale.x *= -1;
        }
    }

    /**
     * Update UI elements
     */
    UpdateUI () {
        if (gameInterface) {
            gameInterface.UpdatePlayerStats({
                hp: this.hp,
                maxHp: this.maxHp,
                exp: this.exp,
                expToNext: this.expToNextLevel,
                level: this.level,
                gold: this.gold
            });
        }
    }

    /**
     * Add item to inventory
     */
    AddItem (item) {
        this.inventory.push(item);
        log(`[PLAYER] Added ${item.name} to inventory`);

        // Show pickup notification
        gameInterface?.ShowMessage(`Picked up: ${item.name}`);
    }

    /**
     * Use item from inventory
     */
    UseItem (index) {
        if (index < 0 || index >= this.inventory.length) {return false;}

        const item = this.inventory[index];

        // Apply item effects
        if (item.type === 'potion') {
            this.hp = Math.min(this.maxHp, this.hp + item.healAmount);
            this.UpdateUI();
        }

        // Remove item
        this.inventory.splice(index, 1);

        return true;
    }
}
