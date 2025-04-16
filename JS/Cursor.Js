const cursor = document.querySelector('.Cursor');

// Set initial position
gsap.set(cursor, {
    xPercent: -90,
    yPercent: -90
});

// Create smooth following effect
window.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.8,
        ease: "power2.out"
    });
});

class MagneticCursor {
    constructor(outerCursor, innerCursor) {
        this.outerCursor = outerCursor;
        this.innerCursor = innerCursor;
        this.clientX = 0;
        this.clientY = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.stuckX = 0;
        this.stuckY = 0;
        this.isStuck = false;
        this.magneticRadius = 120; // Increased from 80 to 120 for an even wider pull range
        this.magnetStrength = 150; // Increased significantly for a much stronger pull effect
        this.maxScale = 2;
        
        this.innerStuckX = 0;
        this.innerStuckY = 0;
        this.innerIsStuck = false;
        this.shouldFollowHamburger = false;
        
        this.shapeBounds = {
            width: 75,
            height: 75
        };
        this.noiseScale = 150;
        this.noiseRange = 2;
        
        this.setupCanvas();
        this.init();
        this.initHovers();
    }

    setupCanvas() {
        paper.setup(this.outerCursor);
        
        const computedStyle = getComputedStyle(document.documentElement);
        const strokeColor = computedStyle.getPropertyValue('--accent-color').trim();
        
        this.strokeWidth = 1;
        const segments = 8;
        const radius = 15;
        
        // Create base polygon
        this.polygon = new paper.Path.RegularPolygon(
            new paper.Point(0, 0),
            segments,
            radius
        );
        
        this.polygon.strokeColor = strokeColor;
        this.polygon.strokeWidth = this.strokeWidth;
        this.polygon.smooth();
        
        // Store original positions
        this.originalPoints = this.polygon.segments.map(segment => ({
            x: segment.point.x,
            y: segment.point.y
        }));
        
        this.group = new paper.Group([this.polygon]);
        this.group.applyMatrix = false;
        
        this.initialSize = this.polygon.bounds.size;
        this.currentScale = 1;

        this.noiseObjects = this.polygon.segments.map(() => new SimplexNoise());

        paper.view.onFrame = (event) => {
            // Update outer cursor position
            if (!this.isStuck) {
                this.lastX = lerp(this.lastX, this.clientX, 0.15);
                this.lastY = lerp(this.lastY, this.clientY, 0.15);
            } else {
                this.lastX = lerp(this.lastX, this.stuckX, 0.15);
                this.lastY = lerp(this.lastY, this.stuckY, 0.15);
            }

            // Update group position
            this.group.position = new paper.Point(this.lastX, this.lastY);
            
            // Update inner cursor with GSAP animation
            if (!this.innerIsStuck) {
                gsap.to(this.innerCursor, {
                    x: this.lastX,
                    y: this.lastY,
                    duration: 0.15,
                    ease: "power2.out"
                });
            } else {
                gsap.to(this.innerCursor, {
                    x: this.innerStuckX,
                    y: this.innerStuckY,
                    duration: 0.15,
                    ease: "power2.out"
                });
            }

            // Keep stroke width constant
            this.polygon.strokeWidth = this.strokeWidth;

            // Apply noise effect
            if (this.isStuck) {
                this.polygon.segments.forEach((segment, i) => {
                    const originalX = this.originalPoints[i].x;
                    const originalY = this.originalPoints[i].y;

                    const noise = this.noiseObjects[i].noise2D(event.count / this.noiseScale, 0);
                    const distortionX = map(noise, -1, 1, -this.noiseRange, this.noiseRange);
                    const distortionY = map(noise, -1, 1, -this.noiseRange, this.noiseRange);

                    segment.point.x = originalX + distortionX;
                    segment.point.y = originalY + distortionY;
                });
                this.polygon.smooth();
            } else {
                this.polygon.segments.forEach((segment, i) => {
                    segment.point.x = this.originalPoints[i].x;
                    segment.point.y = this.originalPoints[i].y;
                });
                this.polygon.smooth();
            }

            paper.view.draw();
        };
    }

    scaleGroup(targetScale, duration = 0.3) {
        this.currentScale = targetScale;
        
        // Scale the group
        gsap.to(this.group.scaling, {
            x: targetScale,
            y: targetScale,
            duration: duration,
            ease: "power2.out"
        });
        
        // Adjust noise range based on scale
        this.noiseRange = 2 * targetScale;
        
        paper.view.update();
    }

    calculateMagneticForce(mouseX, mouseY, targetX, targetY, strength = 0.5) {
        const deltaX = targetX - mouseX;
        const deltaY = targetY - mouseY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // More controlled magnetic pull
        const pull = Math.min(1, (1 - Math.pow(distance / this.magneticRadius, 2)) * strength);
        
        return {
            x: mouseX + (deltaX * pull),
            y: mouseY + (deltaY * pull)
        };
    }

    init() {
        // Track cursor position
        document.addEventListener('mousemove', e => {
            this.clientX = e.clientX;
            this.clientY = e.clientY;
        });
    }

    initHovers() {
        const menuWord = document.querySelector('.Menu-Word');
        const hamburger = document.querySelector('.Hamburger');
        const cuberto = document.querySelector('.Cuberto');
        let hamburgerBox = hamburger.getBoundingClientRect();
        let menuBox = menuWord.getBoundingClientRect();
        this.magneticRadius = 120; // Set radius to 120 units to match constructor

        const updateBoxes = () => {
            hamburgerBox = hamburger.getBoundingClientRect();
            menuBox = menuWord.getBoundingClientRect();
        };

        window.addEventListener('scroll', updateBoxes);
        window.addEventListener('resize', updateBoxes);

        const handleMagneticMove = (e) => {
            const centerX = (hamburgerBox.left + menuBox.left + menuBox.width) / 2;
            const centerY = (hamburgerBox.top + menuBox.top + menuBox.height) / 2;

            const distanceToCenter = Math.hypot(
                e.clientX - centerX,
                e.clientY - centerY
            );

            const isNearCenter = distanceToCenter < this.magneticRadius;

            if (isNearCenter) {
                this.isStuck = true;
                this.stuckX = hamburgerBox.left + hamburgerBox.width / 2;
                this.stuckY = hamburgerBox.top + hamburgerBox.height / 2;

                const scaleValue = Math.min(
                    this.maxScale,
                    1 + (1 - distanceToCenter / this.magneticRadius) * 0.6
                );
                this.scaleGroup(scaleValue);

                this.innerIsStuck = false;
            } else {
                if (this.isStuck) {
                    const snapBackStrength = 0.2;
                    const pullX = (e.clientX - this.stuckX) * snapBackStrength;
                    const pullY = (e.clientY - this.stuckY) * snapBackStrength;

                    gsap.to(hamburger, {
                        x: pullX,
                        y: pullY,
                        duration: 0.2,
                        onComplete: () => {
                            gsap.to(hamburger, {
                                x: 0,
                                y: 0,
                                duration: 0.8,
                                ease: "elastic.out(1, 0.3)"
                            });
                        }
                    });
                }

                this.isStuck = false;
                this.scaleGroup(1);
            }
        };

        const handleMagneticLeave = (e) => {
            const relatedTarget = e.relatedTarget;
            if (!menuWord.contains(relatedTarget) && !hamburger.contains(relatedTarget)) {
                this.isStuck = false;
                this.scaleGroup(1);

                gsap.to(hamburger, {
                    x: 0,
                    y: 0,
                    duration: 0.8,
                    ease: "elastic.out(1, 0.3)"
                });
            }
        };

        [menuWord, hamburger].forEach(el => {
            el.addEventListener('mousemove', handleMagneticMove);
            el.addEventListener('mouseleave', handleMagneticLeave);
        });

        // Add hover effects for inner cursor
        const handleMouseEnter = () => {
            gsap.to(this.innerCursor, {
                width: '10px',
                height: '10px',
                marginLeft: '-5px',
                marginTop: '-5px',
                duration: 0.3,
                ease: "power2.out"
            });
        };

        const handleMouseLeave = () => {
            gsap.to(this.innerCursor, {
                width: '5px',
                height: '5px',
                marginLeft: '-2.5px',
                marginTop: '-2.5px',
                duration: 0.3,
                ease: "power2.out"
            });
        };

        // Add event listeners for hover effects
        [menuWord, hamburger, cuberto].forEach(element => {
            element.addEventListener('mouseenter', handleMouseEnter);
            element.addEventListener('mouseleave', handleMouseLeave);
        });

        // Handle Cuberto scaling with movement
        const handleOtherElementEnter = (e) => {
            const element = e.currentTarget;
            this.isStuck = true;
            this.innerIsStuck = true;

            if (element.classList.contains('Cuberto')) {
                this.scaleGroup(1.8);
            } else {
                this.scaleGroup(1.2);
            }
        };

        const handleOtherElementMove = (e) => {
            if (!this.isStuck) return;
            
            const element = e.currentTarget;
            const elementBox = element.getBoundingClientRect();
            const elementCenter = {
                x: elementBox.left + elementBox.width / 2,
                y: elementBox.top + elementBox.height / 2
            };

            // Calculate offset based on mouse position relative to element center
            const offsetX = (e.clientX - elementCenter.x) * 0.5;
            const offsetY = (e.clientY - elementCenter.y) * 0.5;

            this.stuckX = elementCenter.x + offsetX;
            this.stuckY = elementCenter.y + offsetY;
            this.innerStuckX = this.stuckX;
            this.innerStuckY = this.stuckY;
        };

        const handleOtherElementLeave = () => {
            this.isStuck = false;
            this.innerIsStuck = false;
            this.scaleGroup(1);
        };

        const otherElements = document.querySelectorAll('a:not(.Menu-Word):not(.Hamburger), button:not(.Menu-Word):not(.Hamburger), .Cuberto');
        otherElements.forEach(el => {
            el.addEventListener('mouseenter', handleOtherElementEnter);
            el.addEventListener('mousemove', handleOtherElementMove);
            el.addEventListener('mouseleave', handleOtherElementLeave);
        });
    }
}

function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

function map(value, in_min, in_max, out_min, out_max) {
    return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

const outerCursor = document.querySelector(".circle-cursor--outer");
const innerCursor = document.querySelector(".circle-cursor--inner");
const oldCursor = document.querySelector('.Cursor');
if (oldCursor) oldCursor.remove();

new MagneticCursor(outerCursor, innerCursor);
