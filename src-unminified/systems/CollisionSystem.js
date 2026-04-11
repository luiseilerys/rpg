/**
 * QuadTree Spatial Partitioning
 * Optimizes collision detection by dividing space into quadrants
 */

export class QuadTree {
    constructor (x, y, width, height, maxObjects = 10, maxLevels = 5, level = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.maxObjects = maxObjects;
        this.maxLevels = maxLevels;
        this.level = level;

        this.objects = [];
        this.nodes = [];
    }

    clear () {
        this.objects = [];
        this.nodes.forEach(node => node.clear());
        this.nodes = [];
    }

    split () {
        const subWidth = Math.floor(this.width / 2);
        const subHeight = Math.floor(this.height / 2);
        const offsetX = this.x + subWidth;
        const offsetY = this.y + subHeight;

        this.nodes[0] = new QuadTree(
            offsetX,
            this.y,
            subWidth,
            subHeight,
            this.maxObjects,
            this.maxLevels,
            this.level + 1
        );
        this.nodes[1] = new QuadTree(
            this.x,
            this.y,
            subWidth,
            subHeight,
            this.maxObjects,
            this.maxLevels,
            this.level + 1
        );
        this.nodes[2] = new QuadTree(
            this.x,
            offsetY,
            subWidth,
            subHeight,
            this.maxObjects,
            this.maxLevels,
            this.level + 1
        );
        this.nodes[3] = new QuadTree(
            offsetX,
            offsetY,
            subWidth,
            subHeight,
            this.maxObjects,
            this.maxLevels,
            this.level + 1
        );
    }

    getIndex (rect) {
        let index = -1;
        const verticalMidpoint = this.x + Math.floor(this.width / 2);
        const horizontalMidpoint = this.y + Math.floor(this.height / 2);

        const topQuadrant = rect.y < horizontalMidpoint && rect.y + rect.height < horizontalMidpoint;
        const bottomQuadrant = rect.y > horizontalMidpoint;

        if (rect.x < verticalMidpoint && rect.x + rect.width < verticalMidpoint) {
            if (topQuadrant) {index = 1;}
            else if (bottomQuadrant) {index = 2;}
        } else if (rect.x > verticalMidpoint) {
            if (topQuadrant) {index = 0;}
            else if (bottomQuadrant) {index = 3;}
        }

        return index;
    }

    insert (obj) {
        if (this.nodes.length > 0) {
            const index = this.getIndex(obj.bounds);
            if (index !== -1) {
                this.nodes[index].insert(obj);
                return;
            }
        }

        this.objects.push(obj);

        if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
            if (this.nodes.length === 0) {
                this.split();
            }

            let i = 0;
            while (i < this.objects.length) {
                const index = this.getIndex(this.objects[i].bounds);
                if (index !== -1) {
                    this.nodes[index].insert(this.objects.splice(i, 1)[0]);
                } else {
                    i++;
                }
            }
        }
    }

    retrieve (rect) {
        const returnObjects = [];

        if (this.nodes.length > 0) {
            const index = this.getIndex(rect);
            if (index !== -1) {
                returnObjects.push(...this.nodes[index].retrieve(rect));
            } else {
                this.nodes.forEach(node => {
                    returnObjects.push(...node.retrieve(rect));
                });
            }
        }

        returnObjects.push(...this.objects);
        return returnObjects;
    }

    /**
     * Find potential collisions for an object
     */
    findPotentialCollisions (obj) {
        const candidates = this.retrieve(obj.bounds);
        return candidates.filter(candidate => candidate !== obj);
    }
}

/**
 * Collision Detection System
 * Handles all collision detection using spatial partitioning
 */
export class CollisionSystem {
    constructor (worldWidth, worldHeight) {
        this.quadTree = new QuadTree(0, 0, worldWidth, worldHeight);
        this.entities = [];
    }

    addEntity (entity) {
        this.entities.push(entity);
        this.quadTree.insert(entity);
    }

    removeEntity (entity) {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
        this.rebuild();
    }

    rebuild () {
        this.quadTree.clear();
        this.entities.forEach(entity => this.quadTree.insert(entity));
    }

    checkCollisions () {
        const collisions = [];

        this.entities.forEach(entity => {
            const candidates = this.quadTree.findPotentialCollisions(entity);
            candidates.forEach(other => {
                if (this.isColliding(entity, other)) {
                    collisions.push({ entity1: entity, entity2: other });
                }
            });
        });

        return collisions;
    }

    isColliding (a, b) {
        return (
            a.bounds.x < b.bounds.x + b.bounds.width &&
            a.bounds.x + a.bounds.width > b.bounds.x &&
            a.bounds.y < b.bounds.y + b.bounds.height &&
            a.bounds.y + a.bounds.height > b.bounds.y
        );
    }

    update () {
        this.rebuild();
        return this.checkCollisions();
    }
}
