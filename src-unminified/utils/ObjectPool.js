/**
 * Object Pool Implementation
 * Reusable object pool for performance optimization
 */

export class ObjectPool {
    constructor (createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.active = new Set();

        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }

    acquire () {
        let obj;
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.createFn();
        }
        this.active.add(obj);
        return obj;
    }

    release (obj) {
        if (this.active.has(obj)) {
            this.active.delete(obj);
            this.resetFn(obj);
            this.pool.push(obj);
        }
    }

    releaseAll () {
        this.active.forEach(obj => {
            this.resetFn(obj);
            this.pool.push(obj);
        });
        this.active.clear();
    }

    get activeCount () {
        return this.active.size;
    }

    get poolCount () {
        return this.pool.length;
    }
}

/**
 * Projectile Pool Manager
 * Manages projectile objects for combat
 */
export class ProjectilePool extends ObjectPool {
    constructor (scene, initialSize = 20) {
        super(
            () => this.createProjectile(scene),
            proj => this.resetProjectile(proj),
            initialSize
        );
        this.scene = scene;
    }

    createProjectile (scene) {
        return {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            damage: 0,
            active: false,
            sprite: null,
            lifetime: 0,
            maxLifetime: 3000
        };
    }

    resetProjectile (proj) {
        proj.active = false;
        proj.x = 0;
        proj.y = 0;
        proj.vx = 0;
        proj.vy = 0;
        proj.damage = 0;
        proj.lifetime = 0;
        if (proj.sprite) {
            proj.sprite.visible = false;
        }
    }

    fire (x, y, vx, vy, damage, texture) {
        const proj = this.acquire();
        proj.x = x;
        proj.y = y;
        proj.vx = vx;
        proj.vy = vy;
        proj.damage = damage;
        proj.active = true;
        proj.lifetime = Date.now();

        if (!proj.sprite) {
            proj.sprite = new PIXI.Sprite(texture);
            proj.sprite.anchor.set(0.5);
            this.scene.addChild(proj.sprite);
        }

        proj.sprite.position.set(x, y);
        proj.sprite.visible = true;

        return proj;
    }

    update (deltaTime) {
        const now = Date.now();
        this.active.forEach(proj => {
            if (!proj.active) {return;}

            proj.x += proj.vx * deltaTime;
            proj.y += proj.vy * deltaTime;
            proj.sprite.position.set(proj.x, proj.y);

            if (now - proj.lifetime > proj.maxLifetime) {
                this.release(proj);
            }
        });
    }

    clear () {
        this.active.forEach(proj => {
            if (proj.sprite) {
                this.scene.removeChild(proj.sprite);
                proj.sprite.destroy();
                proj.sprite = null;
            }
        });
        this.releaseAll();
    }
}
