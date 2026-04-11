/**
 * Visual Effects System (Juice)
 * Screen shake, floating damage numbers, particles, and hit effects
 */

export class EffectSystem {
    constructor (app) {
        this.app = app;
        this.effects = [];
        this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
        this.particlePool = [];
        this.maxParticles = 200;

        // Create particle container
        this.particleContainer = new PIXI.Container();
        this.app.stage.addChild(this.particleContainer);

        // Pre-create particles for pooling
        for (let i = 0; i < 50; i++) {
            this.particlePool.push(this.createParticle());
        }
    }

    createParticle () {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xffffff);
        graphics.drawCircle(0, 0, 3);
        graphics.endFill();
        graphics.visible = false;
        this.particleContainer.addChild(graphics);

        return {
            sprite: graphics,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            life: 0,
            maxLife: 1000,
            color: 0xffffff,
            size: 3,
            active: false
        };
    }

    getParticle () {
        let particle = this.particlePool.find(p => !p.active);
        if (!particle && this.particlePool.length < this.maxParticles) {
            particle = this.createParticle();
            this.particlePool.push(particle);
        }
        return particle;
    }

    /**
     * Add screen shake effect
     */
    addScreenShake (intensity = 5, duration = 300) {
        this.screenShake.intensity = Math.max(this.screenShake.intensity, intensity);
        this.screenShake.duration = Math.max(this.screenShake.duration, duration);
    }

    /**
     * Show floating damage number
     */
    showDamageNumber (x, y, damage, isCritical = false, color = 0xff0000) {
        const text = new PIXI.Text(damage.toString(), {
            fontFamily: 'Arial',
            fontSize: isCritical ? 24 : 16,
            fontWeight: 'bold',
            fill: color,
            stroke: 0x000000,
            strokeThickness: 3
        });

        text.anchor.set(0.5);
        text.position.set(x, y);
        this.app.stage.addChild(text);

        this.effects.push({
            type: 'damage_number',
            sprite: text,
            x: x,
            y: y,
            vy: -50,
            life: 0,
            maxLife: 1000,
            alpha: 1
        });

        if (isCritical) {
            // Add extra emphasis for critical hits
            this.addScreenShake(3, 200);
            this.spawnParticles(x, y, 10, color, 5);
        }
    }

    /**
     * Spawn particle explosion
     */
    spawnParticles (x, y, count, color, speed = 3) {
        for (let i = 0; i < count; i++) {
            const particle = this.getParticle();
            if (!particle) {break;}

            const angle = ((Math.PI * 2) / count) * i + Math.random() * 0.5;
            const velocity = speed * (0.5 + Math.random() * 0.5);

            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * velocity;
            particle.vy = Math.sin(angle) * velocity;
            particle.life = 0;
            particle.maxLife = 500 + Math.random() * 500;
            particle.color = color;
            particle.size = 2 + Math.random() * 3;
            particle.active = true;

            particle.sprite.clear();
            particle.sprite.beginFill(color);
            particle.sprite.drawCircle(0, 0, particle.size);
            particle.sprite.endFill();
            particle.sprite.position.set(x, y);
            particle.sprite.visible = true;
            particle.sprite.alpha = 1;
        }
    }

    /**
     * Create hit spark effect
     */
    createHitSpark (x, y) {
        const sparkCount = 8;
        const sparks = [];

        for (let i = 0; i < sparkCount; i++) {
            const spark = new PIXI.Graphics();
            spark.beginFill(0xffff00);
            spark.drawRect(-2, -2, 4, 4);
            spark.endFill();
            spark.position.set(x, y);
            this.app.stage.addChild(spark);

            const angle = ((Math.PI * 2) / sparkCount) * i;
            sparks.push({
                sprite: spark,
                vx: Math.cos(angle) * 100,
                vy: Math.sin(angle) * 100,
                life: 0,
                maxLife: 300
            });
        }

        this.effects.push({
            type: 'sparks',
            sparks: sparks
        });
    }

    /**
     * Create slash effect
     */
    createSlashEffect (x, y, direction, color = 0xffffff) {
        const slash = new PIXI.Graphics();
        slash.lineStyle(3, color, 0.8);

        const length = 40;
        if (direction === 0 || direction === 2) {
            // Up or Down
            slash.moveTo(0, -length / 2);
            slash.lineTo(0, length / 2);
        } else {
            // Left or Right
            slash.moveTo(-length / 2, 0);
            slash.lineTo(length / 2, 0);
        }

        slash.position.set(x, y);
        slash.rotation = (direction * Math.PI) / 2;
        this.app.stage.addChild(slash);

        this.effects.push({
            type: 'slash',
            sprite: slash,
            life: 0,
            maxLife: 200,
            alpha: 0.8
        });
    }

    /**
     * Update all effects
     */
    update (deltaTime) {
        // Update screen shake
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= deltaTime;
            const decay = this.screenShake.duration / 300;
            this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity * decay;
            this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity * decay;
            this.app.stage.position.set(this.screenShake.x, this.screenShake.y);
        } else {
            this.screenShake.x = 0;
            this.screenShake.y = 0;
            this.app.stage.position.set(0, 0);
        }

        // Update effects
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.life += deltaTime;

            if (effect.type === 'damage_number') {
                effect.y += effect.vy * (deltaTime / 1000);
                effect.vy *= 0.98; // Gravity
                effect.sprite.y = effect.y;
                effect.alpha = 1 - effect.life / effect.maxLife;
                effect.sprite.alpha = effect.alpha;

                if (effect.life >= effect.maxLife) {
                    this.app.stage.removeChild(effect.sprite);
                    effect.sprite.destroy();
                    this.effects.splice(i, 1);
                }
            } else if (effect.type === 'slash') {
                effect.alpha = 0.8 * (1 - effect.life / effect.maxLife);
                effect.sprite.alpha = effect.alpha;

                if (effect.life >= effect.maxLife) {
                    this.app.stage.removeChild(effect.sprite);
                    effect.sprite.destroy();
                    this.effects.splice(i, 1);
                }
            } else if (effect.type === 'sparks') {
                let allDead = true;
                effect.sparks.forEach(spark => {
                    spark.life += deltaTime;
                    if (spark.life < spark.maxLife) {
                        allDead = false;
                        spark.sprite.x += spark.vx * (deltaTime / 1000);
                        spark.sprite.y += spark.vy * (deltaTime / 1000);
                        spark.sprite.alpha = 1 - spark.life / spark.maxLife;
                    } else {
                        if (spark.sprite.parent) {
                            this.app.stage.removeChild(spark.sprite);
                            spark.sprite.destroy();
                        }
                    }
                });

                if (allDead) {
                    this.effects.splice(i, 1);
                }
            }
        }

        // Update particles
        this.particlePool.forEach(particle => {
            if (particle.active) {
                particle.life += deltaTime;
                if (particle.life >= particle.maxLife) {
                    particle.active = false;
                    particle.sprite.visible = false;
                } else {
                    particle.x += particle.vx * (deltaTime / 1000);
                    particle.y += particle.vy * (deltaTime / 1000);
                    particle.vy += 50 * (deltaTime / 1000); // Gravity
                    particle.sprite.position.set(particle.x, particle.y);
                    particle.sprite.alpha = 1 - particle.life / particle.maxLife;
                }
            }
        });
    }

    /**
     * Clear all effects
     */
    clear () {
        this.effects.forEach(effect => {
            if (effect.sprite) {
                this.app.stage.removeChild(effect.sprite);
                effect.sprite.destroy();
            } else if (effect.sparks) {
                effect.sparks.forEach(spark => {
                    this.app.stage.removeChild(spark.sprite);
                    spark.sprite.destroy();
                });
            }
        });
        this.effects = [];

        this.particlePool.forEach(particle => {
            particle.active = false;
            particle.sprite.visible = false;
        });

        this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
        this.app.stage.position.set(0, 0);
    }
}
