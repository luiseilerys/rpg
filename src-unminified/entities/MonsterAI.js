/**
 * Enhanced Monster AI with Finite State Machine
 * Implements patrol, chase, attack, and retreat behaviors
 */

import { DIRECTIONS } from '../core/constants.js';

export const AI_STATES = {
    IDLE: 'idle',
    PATROL: 'patrol',
    CHASE: 'chase',
    ATTACK: 'attack',
    RETREAT: 'retreat',
    STUNNED: 'stunned'
};

export class MonsterAI {
    constructor (monster, config = {}) {
        this.monster = monster;
        this.state = AI_STATES.IDLE;
        this.previousState = null;

        // AI Configuration
        this.detectionRange = config.detectionRange || 300;
        this.attackRange = config.attackRange || 50;
        this.patrolSpeed = config.patrolSpeed || 0.5;
        this.chaseSpeed = config.chaseSpeed || 1.2;
        this.retreatSpeed = config.retreatSpeed || 0.8;
        this.attackCooldown = config.attackCooldown || 1000;
        this.patrolRadius = config.patrolRadius || 100;

        // State variables
        this.patrolTarget = null;
        this.patrolTimer = 0;
        this.attackTimer = 0;
        this.stunTimer = 0;
        this.lastKnownPlayerPos = null;
        this.searchTimer = 0;

        // Behavior flags
        this.isAggressive = config.aggressive || false;
        this.canRetreat = config.canRetreat || false;
        this.retreatHealthThreshold = config.retreatHealthThreshold || 0.3;
    }

    update (deltaTime, player, map) {
        if (this.state === AI_STATES.STUNNED) {
            this.updateStunned(deltaTime);
            return;
        }

        const distanceToPlayer = this.getDistanceToPlayer(player);
        const healthPercent = this.monster.hp / this.monster.maxHp;

        // State machine
        switch (this.state) {
        case AI_STATES.IDLE:
            this.updateIdle(deltaTime, player, distanceToPlayer);
            break;
        case AI_STATES.PATROL:
            this.updatePatrol(deltaTime, player, distanceToPlayer, map);
            break;
        case AI_STATES.CHASE:
            this.updateChase(deltaTime, player, distanceToPlayer, map);
            break;
        case AI_STATES.ATTACK:
            this.updateAttack(deltaTime, player, distanceToPlayer);
            break;
        case AI_STATES.RETREAT:
            this.updateRetreat(deltaTime, player, distanceToPlayer, map);
            break;
        }

        // Check for state transitions
        this.checkStateTransitions(player, distanceToPlayer, healthPercent);
    }

    updateIdle (deltaTime, player, distanceToPlayer) {
        this.patrolTimer += deltaTime;

        // Random idle animation or small movements
        if (this.patrolTimer > 2000) {
            this.patrolTimer = 0;
            if (Math.random() < 0.3) {
                this.startPatrol();
            }
        }
    }

    updatePatrol (deltaTime, player, distanceToPlayer, map) {
        if (!this.patrolTarget) {
            this.choosePatrolTarget();
        }

        if (this.patrolTarget) {
            const dx = this.patrolTarget.x - this.monster.x;
            const dy = this.patrolTarget.y - this.monster.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 10) {
                this.patrolTarget = null;
                this.state = AI_STATES.IDLE;
            } else {
                const moveX = (dx / distance) * this.patrolSpeed;
                const moveY = (dy / distance) * this.patrolSpeed;

                if (!map.isColliding(this.monster.x + moveX, this.monster.y)) {
                    this.monster.x += moveX;
                }
                if (!map.isColliding(this.monster.x, this.monster.y + moveY)) {
                    this.monster.y += moveY;
                }

                this.monster.direction = this.getDirection(moveX, moveY);
            }
        }

        this.patrolTimer += deltaTime;
        if (this.patrolTimer > 5000) {
            this.patrolTimer = 0;
            this.choosePatrolTarget();
        }
    }

    updateChase (deltaTime, player, distanceToPlayer, map) {
        if (distanceToPlayer <= this.attackRange) {
            this.state = AI_STATES.ATTACK;
            return;
        }

        const dx = player.x - this.monster.x;
        const dy = player.y - this.monster.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const moveX = (dx / distance) * this.chaseSpeed;
        const moveY = (dy / distance) * this.chaseSpeed;

        // Simple pathfinding with collision avoidance
        if (!map.isColliding(this.monster.x + moveX, this.monster.y)) {
            this.monster.x += moveX;
        } else {
            // Try to slide along obstacles
            if (!map.isColliding(this.monster.x + moveX, this.monster.y + moveY * 0.5)) {
                this.monster.x += moveX;
                this.monster.y += moveY * 0.5;
            }
        }

        if (!map.isColliding(this.monster.x, this.monster.y + moveY)) {
            this.monster.y += moveY;
        } else {
            if (!map.isColliding(this.monster.x + moveX * 0.5, this.monster.y + moveY)) {
                this.monster.x += moveX * 0.5;
                this.monster.y += moveY;
            }
        }

        this.monster.direction = this.getDirection(dx, dy);
        this.lastKnownPlayerPos = { x: player.x, y: player.y };
    }

    updateAttack (deltaTime, player, distanceToPlayer) {
        this.attackTimer += deltaTime;

        if (this.attackTimer >= this.attackCooldown) {
            this.attackTimer = 0;

            if (distanceToPlayer <= this.attackRange * 1.5) {
                this.performAttack(player);
            }
        }

        // Keep facing the player
        const dx = player.x - this.monster.x;
        const dy = player.y - this.monster.y;
        this.monster.direction = this.getDirection(dx, dy);

        // Strafe slightly during attack cooldown
        if (this.attackTimer > this.attackCooldown * 0.5) {
            const strafeDir = Math.sin(Date.now() / 500) * 0.5;
            this.monster.x += strafeDir;
        }
    }

    updateRetreat (deltaTime, player, distanceToPlayer, map) {
        const dx = this.monster.x - player.x;
        const dy = this.monster.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const moveX = (dx / distance) * this.retreatSpeed;
        const moveY = (dy / distance) * this.retreatSpeed;

        if (!map.isColliding(this.monster.x + moveX, this.monster.y)) {
            this.monster.x += moveX;
        }
        if (!map.isColliding(this.monster.x, this.monster.y + moveY)) {
            this.monster.y += moveY;
        }

        this.monster.direction = this.getDirection(dx, dy);

        // Stop retreating if safe distance is reached
        if (distanceToPlayer > this.detectionRange * 0.7) {
            this.state = AI_STATES.PATROL;
        }
    }

    updateStunned (deltaTime) {
        this.stunTimer -= deltaTime;
        if (this.stunTimer <= 0) {
            this.state = this.previousState || AI_STATES.IDLE;
            this.stunTimer = 0;
        }
    }

    checkStateTransitions (player, distanceToPlayer, healthPercent) {
        const playerInRange = distanceToPlayer <= this.detectionRange;
        const playerInAttackRange = distanceToPlayer <= this.attackRange;

        // Retreat if low health and enabled
        if (this.canRetreat && healthPercent < this.retreatHealthThreshold && playerInRange) {
            if (this.state !== AI_STATES.RETREAT && this.state !== AI_STATES.STUNNED) {
                this.previousState = this.state;
                this.state = AI_STATES.RETREAT;
            }
            return;
        }

        // Chase if player detected
        if (playerInRange && this.state !== AI_STATES.STUNNED) {
            if (this.state !== AI_STATES.CHASE && this.state !== AI_STATES.ATTACK && this.state !== AI_STATES.RETREAT) {
                this.state = AI_STATES.CHASE;
            }
            return;
        }

        // Return to patrol if no player
        if (!playerInRange && this.state !== AI_STATES.STUNNED) {
            if (this.state === AI_STATES.CHASE || this.state === AI_STATES.ATTACK) {
                this.searchTimer += 16; // Approximate frame time
                if (this.searchTimer > 3000) {
                    this.state = AI_STATES.PATROL;
                    this.searchTimer = 0;
                }
            } else if (this.state === AI_STATES.IDLE || this.state === AI_STATES.PATROL) {
                // Stay in current state
            } else {
                this.state = AI_STATES.PATROL;
            }
        }
    }

    performAttack (player) {
        if (this.monster.attack) {
            this.monster.attack(player);
        }
    }

    startPatrol () {
        this.state = AI_STATES.PATROL;
        this.choosePatrolTarget();
    }

    choosePatrolTarget () {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * this.patrolRadius + 50;

        this.patrolTarget = {
            x: this.monster.startX + Math.cos(angle) * radius,
            y: this.monster.startY + Math.sin(angle) * radius
        };
    }

    stun (duration) {
        this.previousState = this.state;
        this.state = AI_STATES.STUNNED;
        this.stunTimer = duration;
    }

    getDistanceToPlayer (player) {
        const dx = player.x - this.monster.x;
        const dy = player.y - this.monster.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getDirection (dx, dy) {
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
        } else {
            return dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP;
        }
    }
}
