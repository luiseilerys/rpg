/**
 * Virtual Joystick for Touch Controls
 * Mobile-friendly touch input system
 */

export class VirtualJoystick {
    constructor (container, options = {}) {
        this.container = container;
        this.baseX = options.baseX || 100;
        this.baseY = options.baseY || window.innerHeight - 100;
        this.radius = options.radius || 50;
        this.knobRadius = options.knobRadius || 25;
        this.active = false;
        this.touchId = null;
        this.position = { x: 0, y: 0 };
        this.normalized = { x: 0, y: 0 };
        this.angle = 0;
        this.distance = 0;

        // Visual elements
        this.graphics = new PIXI.Graphics();
        this.container.addChild(this.graphics);

        this.setupEvents();
        this.render();
    }

    setupEvents () {
        const canvas =
            this.container.parent.children.find(c => c instanceof PIXI.CanvasRenderer) ||
            this.container.parent.children.find(c => c._canvas);

        if (canvas) {
            canvas.addEventListener('touchstart', e => this.handleTouchStart(e));
            canvas.addEventListener('touchmove', e => this.handleTouchMove(e));
            canvas.addEventListener('touchend', e => this.handleTouchEnd(e));
        }

        // Also support mouse for testing
        canvas?.addEventListener('mousedown', e => this.handleMouseDown(e));
        canvas?.addEventListener('mousemove', e => this.handleMouseMove(e));
        canvas?.addEventListener('mouseup', e => this.handleMouseUp(e));
    }

    handleTouchStart (e) {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const rect = this.getCanvasRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            // Check if touch is near joystick base
            const dx = x - this.baseX;
            const dy = y - this.baseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.radius * 2) {
                this.active = true;
                this.touchId = touch.identifier;
                this.updatePosition(x, y);
                break;
            }
        }
    }

    handleTouchMove (e) {
        e.preventDefault();
        if (!this.active) {return;}

        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.touchId) {
                const touch = e.changedTouches[i];
                const rect = this.getCanvasRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                this.updatePosition(x, y);
                break;
            }
        }
    }

    handleTouchEnd (e) {
        e.preventDefault();
        if (!this.active) {return;}

        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.touchId) {
                this.reset();
                break;
            }
        }
    }

    handleMouseDown (e) {
        const rect = this.getCanvasRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const dx = x - this.baseX;
        const dy = y - this.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.radius * 2) {
            this.active = true;
            this.updatePosition(x, y);
        }
    }

    handleMouseMove (e) {
        if (!this.active) {return;}

        const rect = this.getCanvasRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.updatePosition(x, y);
    }

    handleMouseUp () {
        if (this.active) {
            this.reset();
        }
    }

    getCanvasRect () {
        const canvas =
            this.container.parent.children.find(c => c instanceof PIXI.CanvasRenderer)?.parent ||
            document.querySelector('canvas');
        return canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0 };
    }

    updatePosition (x, y) {
        const dx = x - this.baseX;
        const dy = y - this.baseY;

        this.distance = Math.sqrt(dx * dx + dy * dy);
        this.angle = Math.atan2(dy, dx);

        // Clamp to radius
        const clampedDistance = Math.min(this.distance, this.radius);

        this.position.x = this.baseX + Math.cos(this.angle) * clampedDistance;
        this.position.y = this.baseY + Math.sin(this.angle) * clampedDistance;

        // Normalize output (-1 to 1)
        this.normalized.x = (clampedDistance / this.radius) * Math.cos(this.angle);
        this.normalized.y = (clampedDistance / this.radius) * Math.sin(this.angle);

        // Apply deadzone
        const deadzone = 0.1;
        if (Math.abs(this.normalized.x) < deadzone) {this.normalized.x = 0;}
        if (Math.abs(this.normalized.y) < deadzone) {this.normalized.y = 0;}

        this.render();
    }

    reset () {
        this.active = false;
        this.touchId = null;
        this.position = { x: this.baseX, y: this.baseY };
        this.normalized = { x: 0, y: 0 };
        this.angle = 0;
        this.distance = 0;
        this.render();
    }

    render () {
        this.graphics.clear();

        // Draw base circle (semi-transparent)
        this.graphics.lineStyle(2, 0xffffff, 0.5);
        this.graphics.beginFill(0x000000, 0.3);
        this.graphics.drawCircle(this.baseX, this.baseY, this.radius);
        this.graphics.endFill();

        // Draw knob
        this.graphics.lineStyle(2, 0xffffff, 0.8);
        this.graphics.beginFill(0x4a90d9, 0.7);
        this.graphics.drawCircle(this.position.x, this.position.y, this.knobRadius);
        this.graphics.endFill();

        // Draw direction indicator
        if (this.active) {
            this.graphics.lineStyle(2, 0xffffff, 0.5);
            this.graphics.moveTo(this.position.x, this.position.y);
            this.graphics.lineTo(
                this.position.x + Math.cos(this.angle) * this.knobRadius * 1.5,
                this.position.y + Math.sin(this.angle) * this.knobRadius * 1.5
            );
        }
    }

    /**
     * Get normalized direction vector
     * @returns {{x: number, y: number}} Normalized vector (-1 to 1)
     */
    getDirection () {
        return { ...this.normalized };
    }

    /**
     * Check if joystick is being used
     */
    isActive () {
        return this.active && (Math.abs(this.normalized.x) > 0.1 || Math.abs(this.normalized.y) > 0.1);
    }

    /**
     * Reposition joystick
     */
    setPosition (x, y) {
        this.baseX = x;
        this.baseY = y;
        if (!this.active) {
            this.position = { x: this.baseX, y: this.baseY };
        }
        this.render();
    }

    /**
     * Show/hide joystick
     */
    setVisible (visible) {
        this.graphics.visible = visible;
    }

    /**
     * Destroy joystick
     */
    destroy () {
        this.container.removeChild(this.graphics);
        this.graphics.destroy();
    }
}

/**
 * Touch Button for actions
 */
export class TouchButton {
    constructor (container, x, y, radius, label, callback) {
        this.container = container;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.label = label;
        this.callback = callback;
        this.pressed = false;
        this.touchId = null;

        this.graphics = new PIXI.Graphics();
        this.container.addChild(this.graphics);

        this.setupEvents();
        this.render();
    }

    setupEvents () {
        const canvas = document.querySelector('canvas');
        canvas?.addEventListener('touchstart', e => this.handleTouchStart(e));
        canvas?.addEventListener('touchend', e => this.handleTouchEnd(e));
        canvas?.addEventListener('mousedown', e => this.handleMouseDown(e));
        canvas?.addEventListener('mouseup', e => this.handleMouseUp(e));
    }

    handleTouchStart (e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const rect = this.getCanvasRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            const dx = x - this.x;
            const dy = y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.radius) {
                this.pressed = true;
                this.touchId = touch.identifier;
                this.callback?.();
                this.render();
                break;
            }
        }
    }

    handleTouchEnd (e) {
        if (!this.pressed) {return;}

        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.touchId) {
                this.pressed = false;
                this.touchId = null;
                this.render();
                break;
            }
        }
    }

    handleMouseDown (e) {
        const rect = this.getCanvasRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const dx = x - this.x;
        const dy = y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.radius) {
            this.pressed = true;
            this.callback?.();
            this.render();
        }
    }

    handleMouseUp () {
        if (this.pressed) {
            this.pressed = false;
            this.render();
        }
    }

    getCanvasRect () {
        return document.querySelector('canvas')?.getBoundingClientRect() || { left: 0, top: 0 };
    }

    render () {
        this.graphics.clear();

        const color = this.pressed ? 0xd94a4a : 0x4ad94a;
        const alpha = this.pressed ? 0.9 : 0.6;

        this.graphics.lineStyle(2, 0xffffff, 0.8);
        this.graphics.beginFill(color, alpha);
        this.graphics.drawCircle(this.x, this.y, this.radius);
        this.graphics.endFill();

        // Draw label
        if (this.label) {
            const text = new PIXI.Text(this.label, {
                fontFamily: 'Arial',
                fontSize: 14,
                fontWeight: 'bold',
                fill: 0xffffff
            });
            text.anchor.set(0.5);
            text.position.set(this.x, this.y);
            this.graphics.addChild(text);
        }
    }

    destroy () {
        this.container.removeChild(this.graphics);
        this.graphics.destroy();
    }
}
