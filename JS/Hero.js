// Hero.js - Canvas layout with text and video integration
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

// Configuration object for styling text and video elements
const config = {
    text: {
        fontSize: 14, // in svh
        marginLeft: 10, // in svw
        marginTop: 5, // in svh
        lineHeight: 18, // in svh
        gap: 2, // in svw
        fontWeight: 700,
        fontFamily: 'Montserrat, sans-serif',
        color: '#ffffff'
    },
    video: {
        width: 20, // in svw
        height: 20, // in svh
        borderRadius: 20, // in px (for CSS styling)
        marginLeft: 11, // in svw
        marginTop: 20, // in svh
        marginRight: 2 // in svw (gap between video and next word)
    },
    particles: {
        particlesPerLetter: 1000, // particles per letter instead of per word
        size: 0.1, // size of particles in pixels
        color: '#ffffff', // color of particles
        initialOpacity: 0, // start with invisible particles
        targetOpacity: 3, // target opacity after fade-in
        fadeInDuration: 1.2, // fade-in duration in seconds
        density: 1.5, // initial density of particles (0-1)
        targetDensity: 0.5, // target density when animation completes
        densityTransitionDuration: 3.0, // transition duration in seconds (slower)
        staggerDelay: 0.4, // delay between words in seconds
        sizeVariation: 0.8, // variation in particle size (0-1)
        xGap: 1, // horizontal gap between sampling points in pixels
        yGap: 3, // vertical gap between sampling points in pixels
        randomOffset: 1.5, // small random offset for natural look (0-1)
        alphaThreshold: 50, // threshold for alpha channel (0-255)
        cornerRadius: 20, // radius for rounded corners in pixels
        autoAnimate: false, // automatically start animation on page load
        repulsion: {
            enabled: true, // enable mouse repulsion effect
            radius: 80, // radius of influence in pixels
            strength: 90, // repulsion force strength
            easing: 0.15, // easing factor for smooth movement (0-1, lower = smoother)
            maxSpeed: 15, // maximum speed particles can move
            friction: 0.92, // friction to apply to particle velocity (0-1)
            stiffness: 0.05, // spring stiffness for return to original position (0-1)
            damping: 1, // damping factor for spring oscillation (0-1)
            interactiveArea: 4.5, // multiplier for the effective area of interaction
            falloff: 4, // power of distance falloff (1 = linear, 2 = quadratic, etc.)
            returnSpeed: 0.5 // speed at which particles return to original position
        }
    }
};

// Text content for the three lines
const content = {
    line1: ['We', 'are', 'a', 'digital'],
    line2: ['design', 'and'],
    line3: ['motion', 'agency']
};

// Main class to handle the canvas layout
class HeroCanvas {
    constructor() {
        this.canvas = document.getElementById('Hero');
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.videoElement = null;
        this.particleSystems = [];
        this.particleData = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(-10000, -10000); // Start off-screen
        this.mouseWorldPos = new THREE.Vector3();
        this.hoveredMesh = null;
        
        // Animation properties
        this.wordDensities = new Map(); // Map to store density for each word
        this.wordTransitionStartTimes = new Map(); // Map to store transition start times
        this.originalParticlePositions = new Map(); // Map to store original particle positions
        this.particleVelocities = new Map(); // Map to store particle velocities for fluid simulation
        this.fadeInStartTime = 0; // Time when fade-in animation started
        this.isFadingIn = false; // Flag to track if fade-in is in progress
        this.isAnimating = false;
        this.animationStartTime = 0;
        this.lastRebuildTime = 0;
        this.rebuildCooldown = 100; // ms between rebuilds to avoid performance issues
        this.animationHasPlayed = false; // Track if animation has already played
        
        this.init();
    }
    
    init() {
        // Set up camera
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        this.camera = new THREE.OrthographicCamera(
            width / -2, width / 2, 
            height / 2, height / -2, 
            1, 1000
        );
        this.camera.position.z = 10;
        
        // Set up renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Start fade-in animation immediately if configured
        if (config.particles.autoAnimate) {
            this.isFadingIn = true;
            this.fadeInStartTime = Date.now();
        }
        
        // Create text elements
        this.createTextLayout();
        
        // Initialize all words with initial density
        this.particleData.forEach(data => {
            this.wordDensities.set(data.text, config.particles.density);
        });
        
        // Add event listeners
        window.addEventListener('resize', this.onResize.bind(this));
        this.canvas.addEventListener('click', this.onClick.bind(this));
        
        // Add mouse move event listener for repulsion effect
        if (config.particles.repulsion.enabled) {
            document.addEventListener('mousemove', this.onMouseMove.bind(this));
            document.addEventListener('mouseleave', this.onMouseLeave.bind(this));
        }
        
        // Add mouse enter event listener for density transition
        document.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
        
        // Auto-start animation if configured
        if (config.particles.autoAnimate) {
            // Small delay to ensure everything is loaded
            setTimeout(() => this.startAnimation(), 500);
        }
        
        // Start animation loop
        this.animate();
    }
    
    // Convert SVW to pixels
    svwToPx(svw) {
        return (svw / 100) * window.innerWidth;
    }
    
    // Convert SVH to pixels
    svhToPx(svh) {
        return (svh / 100) * window.innerHeight;
    }
    
    createTextLayout() {
        // Create first line
        let xPos = this.svwToPx(config.text.marginLeft) - this.canvas.clientWidth / 2;
        let yPos = -this.svhToPx(config.text.marginTop) + this.canvas.clientHeight / 2;
        
        content.line1.forEach(word => {
            const textData = this.createTextData(word, xPos, yPos);
            this.createParticleSystem(textData);
            xPos += this.getTextWidth(word) + this.svwToPx(config.text.gap);
        });
        
        // Create second line (with video)
        xPos = this.svwToPx(config.video.marginLeft) - this.canvas.clientWidth / 2;
        yPos -= this.svhToPx(config.text.lineHeight);
        
        // Add video as first element in second line
        this.createVideoMesh(xPos, yPos);
        
        // Position for text after video
        xPos = this.svwToPx(config.video.marginLeft + config.video.width + config.video.marginRight) - this.canvas.clientWidth / 2;
        
        // Add remaining text in second line
        content.line2.forEach(word => {
            const textData = this.createTextData(word, xPos, yPos);
            this.createParticleSystem(textData);
            xPos += this.getTextWidth(word) + this.svwToPx(config.text.gap);
        });
        
        // Create third line
        xPos = this.svwToPx(config.text.marginLeft) - this.canvas.clientWidth / 2;
        yPos -= this.svhToPx(config.text.lineHeight);
        
        content.line3.forEach(word => {
            const textData = this.createTextData(word, xPos, yPos);
            this.createParticleSystem(textData);
            xPos += this.getTextWidth(word) + this.svwToPx(config.text.gap);
        });
    }
    
    createTextData(text, x, y) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Calculate font size in pixels
        const fontSizePx = this.svhToPx(config.text.fontSize);
        
        // Set canvas size based on text - REDUCED HEIGHT
        canvas.width = this.getTextWidth(text, fontSizePx) + 20; // Add padding
        canvas.height = Math.round(fontSizePx * 0.7) + 30; // Reduced height by 30% + extra padding for descenders
        
        // Draw text on canvas
        context.font = `${config.text.fontWeight} ${fontSizePx}px ${config.text.fontFamily}`;
        context.fillStyle = config.text.color;
        context.textBaseline = 'top'; // Set baseline to top
        context.fillText(text, 10, 0); // Start drawing from the top
        
        // Get image data for particle generation
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Create rounded corners
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        context.moveTo(10 + config.particles.cornerRadius, 10);
        context.lineTo(canvas.width - 10 - config.particles.cornerRadius, 10);
        context.quadraticCurveTo(canvas.width - 10, 10, canvas.width - 10, 10 + config.particles.cornerRadius);
        context.lineTo(canvas.width - 10, canvas.height - 10 - config.particles.cornerRadius);
        context.quadraticCurveTo(canvas.width - 10, canvas.height - 10, canvas.width - 10 - config.particles.cornerRadius, canvas.height - 10);
        context.lineTo(10 + config.particles.cornerRadius, canvas.height - 10);
        context.quadraticCurveTo(10, canvas.height - 10, 10, canvas.height - 10 - config.particles.cornerRadius);
        context.lineTo(10, 10 + config.particles.cornerRadius);
        context.quadraticCurveTo(10, 10, 10 + config.particles.cornerRadius, 10);
        context.clip();
        context.drawImage(canvas, 0, 0);
        
        return {
            text,
            imageData,
            width: canvas.width,
            height: canvas.height,
            x: x + canvas.width / 2,
            y: y - canvas.height / 2,
            letterCount: text.length
        };
    }
    
    createParticleSystem(textData) {
        const { imageData, width, height, x, y, text, letterCount } = textData;
        
        // Get current density for this word (or use default)
        const currentDensity = this.wordDensities.get(text) || config.particles.density;
        
        // Set alpha threshold based on current density
        // Lower density = higher threshold = fewer particles
        const alphaThreshold = config.particles.alphaThreshold + (1 - currentDensity) * (255 - config.particles.alphaThreshold);
        
        // Count potential particle positions
        let potentialPositions = 0;
        for (let py = 0; py < height; py += config.particles.yGap) {
            for (let px = 0; px < width; px += config.particles.xGap) {
                const i = (py * width + px) * 4;
                if (imageData.data[i + 3] > alphaThreshold) {
                    potentialPositions++;
                }
            }
        }
        
        // Calculate sampling rate to achieve target particle count based on letter count
        const targetCount = config.particles.particlesPerLetter * letterCount;
        const samplingRate = Math.min(1, targetCount / Math.max(1, potentialPositions));
        
        const particles = [];
        const particlePositions = [];
        const originalPositions = [];
        const particleSizes = [];
        const particleOpacities = [];
        const velocities = []; // For fluid simulation
        
        // Initially set all particles to invisible
        const initialOpacity = this.isFadingIn ? config.particles.initialOpacity : config.particles.targetOpacity;
        
        // Sample the image data to create particles
        for (let py = 0; py < height; py += config.particles.yGap) {
            for (let px = 0; px < width; px += config.particles.xGap) {
                const i = (py * width + px) * 4;
                // Only create particles where the alpha channel is above threshold
                if (imageData.data[i + 3] > alphaThreshold && Math.random() < samplingRate) {
                    // Calculate position relative to the center of the text
                    // Flip the Y coordinate to fix upside-down text
                    const pX = px - width / 2 + x;
                    const pY = height - py - height / 2 + y;
                    
                    // Add very small random offset for natural look
                    const randX = (Math.random() - 0.5) * config.particles.randomOffset;
                    const randY = (Math.random() - 0.5) * config.particles.randomOffset;
                    
                    const finalX = pX + randX;
                    const finalY = pY + randY;
                    
                    // Store original position for repulsion effect
                    originalPositions.push(finalX, finalY, 0);
                    
                    // Initialize velocity for fluid simulation
                    velocities.push(0, 0, 0);
                    
                    particlePositions.push(finalX, finalY, 0);
                    
                    // Vary particle size slightly
                    const size = config.particles.size * (1 - config.particles.sizeVariation + Math.random() * config.particles.sizeVariation);
                    particleSizes.push(size);
                    
                    // Use initial opacity for fade-in effect
                    const opacity = initialOpacity * (0.8 + Math.random() * 0.2);
                    particleOpacities.push(opacity);
                    
                    particles.push({
                        x: finalX,
                        y: finalY,
                        size: size,
                        opacity: opacity
                    });
                }
            }
        }
        
        // Create geometry and add attributes
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(particleSizes, 1));
        geometry.setAttribute('opacity', new THREE.Float32BufferAttribute(particleOpacities, 1));
        
        // Store original positions for repulsion effect
        this.originalParticlePositions.set(text, {
            positions: originalPositions,
            count: particles.length
        });
        
        // Store velocities for fluid simulation
        this.particleVelocities.set(text, {
            velocities: velocities,
            count: particles.length
        });
        
        // Create shader material for particles
        const material = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(config.particles.color) },
                pointTexture: { value: this.createParticleTexture() }
            },
            vertexShader: `
                attribute float size;
                attribute float opacity;
                varying float vOpacity;
                void main() {
                    vOpacity = opacity;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform sampler2D pointTexture;
                varying float vOpacity;
                void main() {
                    gl_FragColor = vec4(color, vOpacity) * texture2D(pointTexture, gl_PointCoord);
                }
            `,
            blending: THREE.NormalBlending,
            depthTest: false,
            transparent: true
        });
        
        // Create particle system
        const particleSystem = new THREE.Points(geometry, material);
        particleSystem.userData = { 
            type: 'particles', 
            text
        };
        
        this.scene.add(particleSystem);
        this.particleSystems.push(particleSystem);
        this.particleData.push({
            system: particleSystem,
            particles: particles,
            text: text
        });
        
        console.log(`Created particle system for "${text}" (${letterCount} letters) with ${particles.length} particles`);
        
        return particleSystem;
    }
    
    createParticleTexture() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 32;
        canvas.height = 32;
        
        // Create a circular particle texture
        const gradient = context.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.width / 2
        );
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }
    
    createVideoMesh(x, y) {
        // Create video element
        this.videoElement = document.createElement('video');
        this.videoElement.src = './Vids/Hero Vid.mp4';
        this.videoElement.loop = true;
        this.videoElement.muted = true;
        this.videoElement.playsInline = true;
        this.videoElement.autoplay = true;
        this.videoElement.className = 'HeVid video-fade-in'; // Add video-fade-in class for animation
        
        // Append video to DOM for CSS styling
        document.querySelector('.HeroSec').appendChild(this.videoElement);
        
        // Calculate dimensions in viewport units
        const videoWidthVw = config.video.width;
        const videoHeightVh = config.video.height;
        
        // Position the video element using CSS
        this.videoElement.style.position = 'absolute';
        this.videoElement.style.left = `${config.video.marginLeft}svw`;
        this.videoElement.style.top = `${config.video.marginTop}svh`;
        this.videoElement.style.width = `${videoWidthVw}svw`;
        this.videoElement.style.height = `${videoHeightVh}svh`;
        this.videoElement.style.borderRadius = `${config.video.borderRadius}px`;
        this.videoElement.style.objectFit = 'cover';
        this.videoElement.style.zIndex = '2';
        
        // Load and play video
        this.videoElement.load();
        this.videoElement.play().catch(e => {
            console.error('Error playing video:', e);
        });
    }
    
    getTextWidth(text, fontSizePx) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        // Use provided font size or calculate it
        const fontSize = fontSizePx || this.svhToPx(config.text.fontSize);
        context.font = `${config.text.fontWeight} ${fontSize}px ${config.text.fontFamily}`;
        return context.measureText(text).width;
    }
    
    onResize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        this.camera.left = width / -2;
        this.camera.right = width / 2;
        this.camera.top = height / 2;
        this.camera.bottom = height / -2;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        
        // Clear existing particle systems
        this.particleSystems.forEach(system => this.scene.remove(system));
        this.particleSystems = [];
        this.particleData = [];
        
        // Remove old video element if it exists
        if (this.videoElement) {
            this.videoElement.remove();
        }
        
        // Recreate layout with new dimensions
        this.createTextLayout();
    }
    
    onClick(event) {
        // Handle click events
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / this.canvas.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / this.canvas.clientHeight) * 2 + 1;
        
        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Check for intersections
        const intersects = this.raycaster.intersectObjects(this.particleSystems);
        
        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            console.log(`Clicked on: ${intersectedObject.userData.text}`);
        }
    }
    
    onMouseMove(event) {
        // Update mouse position
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / this.canvas.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / this.canvas.clientHeight) * 2 + 1;
        
        // Convert mouse position to world coordinates
        this.mouseWorldPos.set(
            this.mouse.x * this.canvas.clientWidth / 2,
            this.mouse.y * this.canvas.clientHeight / 2,
            0
        );
    }
    
    onMouseLeave() {
        // Move mouse far away when leaving canvas
        this.mouse.x = -10000;
        this.mouse.y = -10000;
        this.mouseWorldPos.set(-10000, -10000, 0);
    }
    
    handleMouseEnter() {
        // Only start animation if it hasn't played yet
        if (!this.animationHasPlayed) {
            this.startAnimation();
        }
    }
    
    startAnimation() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.animationStartTime = Date.now();
        this.animationHasPlayed = true; // Mark animation as played
        
        // Set initial transition start times with staggered delays
        // Line 1
        let delay = 0;
        content.line1.forEach(word => {
            this.wordTransitionStartTimes.set(word, this.animationStartTime + delay * 1000);
            delay += config.particles.staggerDelay;
        });
        
        // Line 2
        content.line2.forEach(word => {
            this.wordTransitionStartTimes.set(word, this.animationStartTime + delay * 1000);
            delay += config.particles.staggerDelay;
        });
        
        // Line 3
        content.line3.forEach(word => {
            this.wordTransitionStartTimes.set(word, this.animationStartTime + delay * 1000);
            delay += config.particles.staggerDelay;
        });
        
        console.log('Starting staggered animation');
    }
    
    updateAnimation() {
        if (!this.isAnimating) return;
        
        const now = Date.now();
        let needsRebuild = false;
        
        // Update density for each word based on its individual transition
        this.particleData.forEach(data => {
            const { text } = data;
            
            // Get transition start time for this word
            const startTime = this.wordTransitionStartTimes.get(text);
            
            // Skip if this word's animation hasn't started yet
            if (now < startTime) return;
            
            const currentDensity = this.wordDensities.get(text);
            const elapsed = (now - startTime) / 1000; // in seconds
            const duration = config.particles.densityTransitionDuration;
            
            if (elapsed >= duration) {
                // Transition complete for this word
                if (currentDensity !== config.particles.targetDensity) {
                    this.wordDensities.set(text, config.particles.targetDensity);
                    needsRebuild = true;
                }
            } else {
                // Calculate progress using easeOutQuart easing for smoother feel
                const t = elapsed / duration;
                const progress = 1 - Math.pow(1 - t, 4);
                
                // Interpolate between initial and target density
                const newDensity = config.particles.density + (config.particles.targetDensity - config.particles.density) * progress;
                
                // Only rebuild if density changed significantly
                if (Math.abs(newDensity - currentDensity) > 0.01) {
                    this.wordDensities.set(text, newDensity);
                    needsRebuild = true;
                }
            }
        });
        
        // Check if all words have completed their transition
        const allComplete = Array.from(this.wordDensities.values()).every(
            density => Math.abs(density - config.particles.targetDensity) < 0.01
        );
        
        if (allComplete) {
            this.isAnimating = false;
            console.log('Animation complete');
        }
        
        // Update opacity for fade-in effect
        this.updateFadeIn();
        
        // Rebuild particle systems if needed (with cooldown to prevent too frequent rebuilds)
        if (needsRebuild && (now - this.lastRebuildTime > this.rebuildCooldown)) {
            this.rebuildParticleSystems();
            this.lastRebuildTime = now;
        }
    }
    
    // New method to handle fade-in animation
    updateFadeIn() {
        if (!this.isFadingIn) return;
        
        const now = Date.now();
        const elapsed = (now - this.fadeInStartTime) / 1000; // in seconds
        const duration = config.particles.fadeInDuration;
        
        if (elapsed >= duration) {
            // Fade-in complete
            this.isFadingIn = false;
            
            // Set all particle systems to full opacity
            this.particleData.forEach(data => {
                const { system } = data;
                if (system && system.geometry.attributes.opacity) {
                    const opacityAttribute = system.geometry.attributes.opacity;
                    for (let i = 0; i < opacityAttribute.count; i++) {
                        opacityAttribute.array[i] = config.particles.targetOpacity * (0.8 + Math.random() * 0.2);
                    }
                    opacityAttribute.needsUpdate = true;
                }
            });
            
            return;
        }
        
        // Calculate progress using easeOutCubic
        const t = elapsed / duration;
        const progress = 1 - Math.pow(1 - t, 3);
        
        // Interpolate between initial and target opacity
        const newOpacity = config.particles.initialOpacity + 
            (config.particles.targetOpacity - config.particles.initialOpacity) * progress;
        
        // Update opacity in all particle systems
        this.particleData.forEach(data => {
            const { system } = data;
            if (system && system.geometry.attributes.opacity) {
                const opacityAttribute = system.geometry.attributes.opacity;
                for (let i = 0; i < opacityAttribute.count; i++) {
                    opacityAttribute.array[i] = newOpacity * (0.8 + Math.random() * 0.2);
                }
                opacityAttribute.needsUpdate = true;
            }
        });
    }
    
    rebuildParticleSystems() {
        // Remove existing particle systems
        this.particleSystems.forEach(system => this.scene.remove(system));
        this.particleSystems = [];
        
        // Keep track of particle data text
        const textData = this.particleData.map(data => data.text);
        this.particleData = [];
        
        // Recreate layout with new densities
        this.createTextLayout();
        
        console.log('Rebuilt particle systems');
    }
    
    updateParticleRepulsion() {
        if (!config.particles.repulsion.enabled) return;
        
        const repulsion = config.particles.repulsion;
        const radius = repulsion.radius;
        const radiusSq = radius * radius;
        const strength = repulsion.strength;
        const easing = repulsion.easing;
        const maxSpeed = repulsion.maxSpeed;
        const friction = repulsion.friction;
        const stiffness = repulsion.stiffness;
        const damping = repulsion.damping;
        const falloff = repulsion.falloff;
        const returnSpeed = repulsion.returnSpeed;
        
        // Update each particle system
        this.particleData.forEach(data => {
            const { text, system } = data;
            
            // Get original positions and velocities
            const originalData = this.originalParticlePositions.get(text);
            const velocityData = this.particleVelocities.get(text);
            
            if (!originalData || !velocityData || !system) return;
            
            const { positions: origPositions, count } = originalData;
            const { velocities } = velocityData;
            
            // Get position attribute from system
            const positionAttribute = system.geometry.getAttribute('position');
            
            // Apply repulsion to each particle
            for (let i = 0; i < count; i++) {
                const index = i * 3;
                
                // Current position
                const px = positionAttribute.array[index];
                const py = positionAttribute.array[index + 1];
                
                // Original position (target)
                const origX = origPositions[index];
                const origY = origPositions[index + 1];
                
                // Current velocity
                let vx = velocities[index];
                let vy = velocities[index + 1];
                
                // Calculate distance to mouse
                const dx = px - this.mouseWorldPos.x;
                const dy = py - this.mouseWorldPos.y;
                const distSq = dx * dx + dy * dy;
                
                // Apply repulsion force if within radius
                if (distSq < radiusSq * repulsion.interactiveArea) {
                    const dist = Math.sqrt(distSq);
                    const force = strength * Math.pow(1 - Math.min(dist / radius, 1), falloff);
                    
                    // Normalized direction vector
                    const nx = dx / (dist || 1);
                    const ny = dy / (dist || 1);
                    
                    // Apply force to velocity
                    vx += nx * force * easing;
                    vy += ny * force * easing;
                }
                
                // Apply spring force to return to original position
                const springX = origX - px;
                const springY = origY - py;
                
                vx += springX * stiffness;
                vy += springY * stiffness;
                
                // Apply damping to velocity
                vx *= damping;
                vy *= damping;
                
                // Apply friction
                vx *= friction;
                vy *= friction;
                
                // Limit speed
                const speed = Math.sqrt(vx * vx + vy * vy);
                if (speed > maxSpeed) {
                    vx = (vx / speed) * maxSpeed;
                    vy = (vy / speed) * maxSpeed;
                }
                
                // Update velocity
                velocities[index] = vx;
                velocities[index + 1] = vy;
                
                // Update position
                positionAttribute.array[index] += vx;
                positionAttribute.array[index + 1] += vy;
            }
            
            // Mark position attribute as needing update
            positionAttribute.needsUpdate = true;
        });
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Update animation if active
        if (this.isAnimating) {
            this.updateAnimation();
        } else if (this.isFadingIn) {
            // Continue updating fade-in even if main animation is not active
            this.updateFadeIn();
        }
        
        // Update particle repulsion
        this.updateParticleRepulsion();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize hero canvas
    try {
        const heroCanvas = new HeroCanvas();
        console.log('Hero canvas initialized');
    } catch (error) {
        console.error('Error initializing hero canvas:', error);
    }
});