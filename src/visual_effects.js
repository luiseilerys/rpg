// ============================================
// VISUAL EFFECTS SYSTEM v1.0
// Particles, Screen Shake, Flash, Lighting
// ============================================

class VisualEffects {
    constructor(app) {
        this.app = app;
        this.particles = [];
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.flashSprite = null;
        this.lightContainer = null;
        this.playerLight = null;
        this.__initFlash();
        this.__initLighting();
    }

    // ========== SCREEN SHAKE ==========
    StartShake(intensity = 5, duration = 300) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeStartTime = Date.now();
    }

    UpdateShake() {
        if (this.shakeDuration <= 0) return;
        
        const elapsed = Date.now() - this.shakeStartTime;
        const remaining = this.shakeDuration - elapsed;
        
        if (remaining <= 0) {
            this.shakeIntensity = 0;
            this.shakeDuration = 0;
            this.app.stage.x = 0;
            this.app.stage.y = 0;
            return;
        }
        
        const decay = remaining / this.shakeDuration;
        const currentIntensity = this.shakeIntensity * decay;
        
        this.app.stage.x = (Math.random() - 0.5) * currentIntensity * 2;
        this.app.stage.y = (Math.random() - 0.5) * currentIntensity * 2;
    }

    // ========== FLASH EFFECT ==========
    __initFlash() {
        this.flashSprite = new PIXI.Graphics();
        this.flashSprite.alpha = 0;
        this.flashSprite.zIndex = 9999;
        this.flashSprite.interactive = false;
        this.app.stage.addChild(this.flashSprite);
    }

    TriggerFlash(color = 0xffffff, intensity = 0.5, duration = 150) {
        const width = this.app.renderer.width;
        const height = this.app.renderer.height;
        
        this.flashSprite.clear();
        this.flashSprite.beginFill(color, intensity);
        this.flashSprite.drawRect(0, 0, width, height);
        this.flashSprite.endFill();
        this.flashSprite.alpha = intensity;
        
        const startTime = Date.now();
        const fadeOut = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1) {
                this.flashSprite.alpha = 0;
                return;
            }
            
            this.flashSprite.alpha = intensity * (1 - progress);
            requestAnimationFrame(fadeOut);
        };
        
        fadeOut();
    }

    // ========== LIGHTING SYSTEM ==========
    __initLighting() {
        this.lightContainer = new PIXI.Container();
        this.lightContainer.zIndex = 9998;
        this.app.stage.addChild(this.lightContainer);
        
        // Create vignette overlay
        this.vignette = new PIXI.Graphics();
        this.vignette.zIndex = 9997;
        this.app.stage.addChild(this.vignette);
    }

    UpdateLighting(playerX, playerY) {
        // Clear previous lights
        this.lightContainer.removeChildren();
        
        // Player light (torch effect)
        const playerLight = new PIXI.Graphics();
        playerLight.beginFill(0xFFD700, 0.3);
        playerLight.drawCircle(0, 0, 200);
        playerLight.endFill();
        playerLight.x = playerX;
        playerLight.y = playerY;
        playerLight.blendMode = PIXI.BLEND_MODES.MULTIPLY;
        this.lightContainer.addChild(playerLight);
        
        // Update vignette
        this.__updateVignette();
    }

    __updateVignette() {
        const width = this.app.renderer.width;
        const height = this.app.renderer.height;
        
        this.vignette.clear();
        this.vignette.beginFill(0x000000, 0.4);
        this.vignette.drawRect(0, 0, width, height);
        this.vignette.endFill();
        
        // Cut out center for vignette effect
        this.vignette.beginFill(0x000000, 1);
        this.vignette.drawCircle(width/2, height/2, Math.min(width, height) * 0.4);
        this.vignette.endFill();
        this.vignette.blendMode = PIXI.BLEND_MODES.DESTROY_OUT;
    }

    // ========== PARTICLE SYSTEM ==========
    SpawnParticle(config) {
        const particle = {
            x: config.x || 0,
            y: config.y || 0,
            vx: config.vx || (Math.random() - 0.5) * 10,
            vy: config.vy || (Math.random() - 0.5) * 10,
            life: config.life || 1000,
            maxLife: config.life || 1000,
            size: config.size || 5,
            color: config.color || 0xff0000,
            alpha: config.alpha || 1,
            gravity: config.gravity || 0.5,
            type: config.type || 'circle',
            rotation: config.rotation || 0,
            rotationSpeed: config.rotationSpeed || 0.1,
            sprite: null
        };
        
        // Create sprite
        if (config.texture) {
            particle.sprite = new PIXI.Sprite(config.texture);
            particle.sprite.anchor.set(0.5);
        } else {
            particle.sprite = new PIXI.Graphics();
            if (particle.type === 'circle') {
                particle.sprite.beginFill(particle.color);
                particle.sprite.drawCircle(0, 0, particle.size);
                particle.sprite.endFill();
            } else if (particle.type === 'square') {
                particle.sprite.beginFill(particle.color);
                particle.sprite.drawRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
                particle.sprite.endFill();
            } else if (particle.type === 'text') {
                const style = new PIXI.TextStyle({
                    fontFamily: 'Varela Round',
                    fontSize: particle.size,
                    fill: particle.color,
                    stroke: 0x000000,
                    strokeThickness: 2,
                    fontWeight: 'bold'
                });
                particle.sprite = new PIXI.Text(config.text || '', style);
                particle.sprite.anchor.set(0.5);
            }
        }
        
        particle.sprite.x = particle.x;
        particle.sprite.y = particle.y;
        particle.sprite.alpha = particle.alpha;
        particle.sprite.zIndex = 9000;
        
        this.app.stage.addChild(particle.sprite);
        this.particles.push(particle);
        
        return particle;
    }

    SpawnBlood(x, y, amount = 10) {
        for (let i = 0; i < amount; i++) {
            this.SpawnParticle({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 1) * 15,
                life: 800 + Math.random() * 400,
                size: 3 + Math.random() * 5,
                color: 0xcc0000,
                gravity: 0.8,
                type: 'circle'
            });
        }
    }

    SpawnSparks(x, y, amount = 15) {
        for (let i = 0; i < amount; i++) {
            this.SpawnParticle({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                life: 500 + Math.random() * 300,
                size: 2 + Math.random() * 3,
                color: 0xFFFF00,
                gravity: 0.3,
                type: 'square'
            });
        }
    }

    SpawnDamageNumber(x, y, damage, color = 0xffffff) {
        this.SpawnParticle({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: -5 - Math.random() * 3,
            life: 1500,
            size: 24,
            color: color,
            gravity: -0.1,
            type: 'text',
            text: `-${damage}`,
            rotationSpeed: 0
        });
    }

    SpawnHitEffect(x, y) {
        // White flash circle
        this.SpawnParticle({
            x: x,
            y: y,
            life: 300,
            size: 30,
            color: 0xffffff,
            alpha: 0.8,
            type: 'circle'
        });
    }

    SpawnLevelUp(x, y) {
        // Golden sparkles
        for (let i = 0; i < 30; i++) {
            this.SpawnParticle({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 25,
                vy: (Math.random() - 1) * 25,
                life: 1500 + Math.random() * 500,
                size: 4 + Math.random() * 4,
                color: 0xFFD700,
                gravity: 0.2,
                type: 'square'
            });
        }
        
        // Level up text
        setTimeout(() => {
            this.SpawnParticle({
                x: x,
                y: y - 50,
                vy: -2,
                life: 2000,
                size: 36,
                color: 0xFFD700,
                gravity: 0,
                type: 'text',
                text: '¡LEVEL UP!',
                rotationSpeed: 0
            });
        }, 200);
    }

    UpdateParticles() {
        const now = Date.now();
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            const age = now - (p.startTime || (p.startTime = now));
            
            if (age >= p.life) {
                // Remove particle
                if (p.sprite && p.sprite.parent) {
                    p.sprite.parent.removeChild(p.sprite);
                    if (p.sprite.destroy) {
                        p.sprite.destroy();
                    }
                }
                this.particles.splice(i, 1);
                continue;
            }
            
            // Update physics
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            
            // Update rotation
            if (p.rotationSpeed) {
                p.rotation += p.rotationSpeed;
                if (p.sprite) {
                    p.sprite.rotation = p.rotation;
                }
            }
            
            // Update position
            if (p.sprite) {
                p.sprite.x = p.x;
                p.sprite.y = p.y;
                
                // Fade out based on life
                const lifePercent = 1 - (age / p.life);
                if (lifePercent < 0.3) {
                    p.sprite.alpha = p.alpha * (lifePercent / 0.3);
                }
            }
        }
    }

    // ========== TRAIL EFFECT ==========
    SpawnTrail(x, y, color = 0x4CAF50, size = 10) {
        this.SpawnParticle({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            life: 300,
            size: size,
            color: color,
            alpha: 0.5,
            gravity: 0,
            type: 'circle'
        });
    }

    // ========== CLEAR ALL ==========
    ClearAll() {
        for (const p of this.particles) {
            if (p.sprite && p.sprite.parent) {
                p.sprite.parent.removeChild(p.sprite);
            }
        }
        this.particles = [];
    }
}

// Global instance (will be created when game starts)
let visualEffects = null;

// Hook into existing game functions
const originalPlayerDamage = Player.prototype.Damage;
if (originalPlayerDamage) {
    Player.prototype.Damage = function(damage) {
        const result = originalPlayerDamage.call(this, damage);
        
        // Visual feedback
        const xy = this.GetXY();
        if (visualEffects) {
            visualEffects.TriggerFlash(0xff0000, 0.3, 200);
            visualEffects.StartShake(8, 300);
            visualEffects.SpawnBlood(xy.x, xy.y - 20, 15);
            visualEffects.SpawnDamageNumber(xy.x, xy.y - 40, damage, 0xff0000);
        }
        
        return result;
    };
}

// Hook monster damage
const originalMonsterDamage = Monster.prototype.Damage;
if (originalMonsterDamage) {
    Monster.prototype.Damage = function(damage) {
        const result = originalMonsterDamage.call(this, damage);
        
        // Visual feedback
        const xy = this.GetXY();
        if (visualEffects) {
            visualEffects.SpawnBlood(xy.x, xy.y - 20, 10);
            visualEffects.SpawnDamageNumber(xy.x, xy.y - 40, damage, 0xffffff);
            visualEffects.SpawnHitEffect(xy.x, xy.y - 20);
        }
        
        return result;
    };
}

// Hook monster death
const originalMonsterDie = Monster.prototype.Die;
if (originalMonsterDie) {
    Monster.prototype.Die = function() {
        const xy = this.GetXY();
        
        if (visualEffects) {
            visualEffects.SpawnBlood(xy.x, xy.y - 20, 20);
            visualEffects.SpawnSparks(xy.x, xy.y - 20, 20);
        }
        
        return originalMonsterDie.call(this);
    };
}

// Hook player attack
const originalPlayerAttackInput = Player.prototype.AttackInput;
if (originalPlayerAttackInput) {
    Player.prototype.AttackInput = function(key) {
        const result = originalPlayerAttackInput.call(this, key);
        
        // Attack trail effect
        const xy = this.GetXY();
        if (visualEffects && !this.IsState('DIE')) {
            const direction = this.direction || 1;
            visualEffects.SpawnTrail(xy.x + direction * 30, xy.y - 20, 0xffffff, 15);
        }
        
        return result;
    };
}
