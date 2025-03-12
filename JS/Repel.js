// /**
//  * TextParticleEffect.js
//  * A high-performance particle system that converts text to interactive particles
//  * with repulsion and crunching effects
//  */

// class TextParticleEffect {
//     constructor() {
//         // Canvas setup
//         this.canvas = document.createElement('canvas');
//         this.canvas.id = 'textParticleCanvas';
//         this.canvas.style.position = 'absolute';
//         this.canvas.style.top = '0';
//         this.canvas.style.left = '0';
//         this.canvas.style.width = '100%';
//         this.canvas.style.height = '100%';
//         this.canvas.style.pointerEvents = 'none';
//         this.canvas.style.zIndex = '5';
//         document.body.appendChild(this.canvas);
        
//         this.ctx = this.canvas.getContext('2d', { alpha: true });
        
//         // Performance optimization: disable image smoothing
//         this.ctx.imageSmoothingEnabled = false;
        
//         // Set canvas dimensions with device pixel ratio
//         const dpr = window.devicePixelRatio || 1;
//         this.canvas.width = window.innerWidth * dpr;
//         this.canvas.height = window.innerHeight * dpr;
//         this.ctx.scale(dpr, dpr);
        
//         // Text elements and particles storage
//         this.textElements = [];
//         this.particles = [];
        
//         // Mouse tracking with improved responsiveness
//         this.mouse = {
//             x: undefined,
//             y: undefined,
//             radius: 100,  // Increased radius for better interaction
//             velocity: { x: 0, y: 0 },
//             lastX: undefined,
//             lastY: undefined
//         };
//         this.lastMouseMoveTime = 0;
//         this.mouseMoveThrottle = 2; // Reduced to 2ms for more responsive tracking
        
//         // Animation time
//         this.time = 0;
//         this.lastFrameTime = 0;
//         this.deltaTime = 0;
        
//         // Particle state tracking
//         this.particlesState = 'line';
//         this.formingStartTime = 0;
//         this.formingDuration = 1000; // Reduced for snappier transitions
        
//         // Performance tracking
//         this.frameCount = 0;
//         this.lastFpsUpdate = 0;
//         this.fps = 0;
        
//         // Enhanced Configuration
//         this.config = {
//             repel: {
//                 force: 8,           // Increased for more dramatic repulsion
//                 returnSpeed: 0.15,   // Faster return
//                 particleSize: 1.2,   // Slightly larger particles
//                 friction: 0.92,      // More momentum
//                 maxSpeed: 15        // Speed cap to prevent erratic behavior
//             },
//             crunch: {
//                 force: 7,
//                 returnSpeed: 0.15,
//                 minSize: 0.3,
//                 particleSize: 0.9,
//                 shrinkSpeed: 0.92,
//                 growSpeed: 1.08
//             },
//             sampling: 1,
//             maxParticles: 5000,
//             particleSpacing: 2,
//             boldWeight: 800,
//             lightWeight: 300,
//             line: {
//                 y: window.innerHeight / 2,
//                 formingEase: 0.05  // Faster easing
//             }
//         };
        
//         // Initialize
//         this.init();
//     }
    
//     init() {
//         this.boundHandleResize = this.handleResize.bind(this);
//         this.boundHandleMouseMove = this.handleMouseMove.bind(this);
//         this.boundHandleMouseOut = this.handleMouseOut.bind(this);
//         this.boundAnimate = this.animate.bind(this);
        
//         window.addEventListener('resize', this.boundHandleResize);
//         window.addEventListener('mousemove', this.boundHandleMouseMove);
//         window.addEventListener('mouseout', this.boundHandleMouseOut);
        
//         this.initTextElements();
        
//         this.lastFrameTime = performance.now();
//         requestAnimationFrame(this.boundAnimate);
//     }
    
//     // Clean up resources to prevent memory leaks
//     destroy() {
//         // Remove event listeners
//         window.removeEventListener('resize', this.boundHandleResize);
//         window.removeEventListener('mousemove', this.boundHandleMouseMove);
//         window.removeEventListener('mouseout', this.boundHandleMouseOut);
        
//         // Remove canvas from DOM
//         if (this.canvas && this.canvas.parentNode) {
//             this.canvas.parentNode.removeChild(this.canvas);
//         }
        
//         // Clear arrays
//         this.textElements = [];
//         this.particles = [];
        
//         // Cancel any pending animation frame
//         if (this.animationFrameId) {
//             cancelAnimationFrame(this.animationFrameId);
//         }
//     }
    
//     handleResize() {
//         // Debounce resize events
//         if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
        
//         this.resizeTimeout = setTimeout(() => {
//             // Update canvas dimensions
//             const dpr = window.devicePixelRatio || 1;
//             this.canvas.width = window.innerWidth * dpr;
//             this.canvas.height = window.innerHeight * dpr;
//             this.ctx.scale(dpr, dpr);
            
//             // Update line position
//             this.config.line.y = window.innerHeight / 2;
            
//             // Reset particles and reinitialize text elements
//             this.particles = [];
//             this.textElements = [];
//             this.initTextElements();
//         }, 200);
//     }
    
//     handleMouseMove(e) {
//         const now = performance.now();
//         if (now - this.lastMouseMoveTime < this.mouseMoveThrottle) return;
        
//         // Calculate mouse velocity
//         if (this.mouse.lastX !== undefined) {
//             this.mouse.velocity.x = e.clientX - this.mouse.lastX;
//             this.mouse.velocity.y = e.clientY - this.mouse.lastY;
//         }
        
//         this.mouse.lastX = e.clientX;
//         this.mouse.lastY = e.clientY;
//         this.lastMouseMoveTime = now;
//         this.mouse.x = e.clientX;
//         this.mouse.y = e.clientY;
        
//         // Dynamic radius based on mouse speed
//         const speed = Math.sqrt(
//             this.mouse.velocity.x * this.mouse.velocity.x + 
//             this.mouse.velocity.y * this.mouse.velocity.y
//         );
//         this.mouse.radius = Math.min(100 + speed * 0.5, 150);
        
//         if (this.particlesState === 'line') {
//             this.particlesState = 'forming';
//             this.formingStartTime = Date.now();
//         }
//     }
    
//     handleMouseOut() {
//         this.mouse.x = undefined;
//         this.mouse.y = undefined;
        
//         // When mouse leaves, go back to line
//         this.particlesState = 'line';
//     }
    
//     initTextElements() {
//         // Define text elements to process
//         const textSelectors = [
//             { selector: '.Hero .line-1 .raks-text', type: 'repel', weight: this.config.boldWeight },
//             { selector: '.Hero .line-2 .design-text', type: 'repel', weight: this.config.boldWeight },
//             { selector: '.Hero .line-2 .raks-text:not(.design-text)', type: 'repel', weight: this.config.boldWeight },
//             { selector: '.Hero .line-4 .raks-text', type: 'repel', weight: this.config.boldWeight }
//         ];
        
//         // Process each text element
//         textSelectors.forEach(item => {
//             const elements = document.querySelectorAll(item.selector);
            
//             elements.forEach(element => {
//                 // Skip if element is not visible
//                 if (!element || !element.offsetParent) return;
                
//                 // Get text content and position
//                 const text = element.textContent;
//                 const rect = element.getBoundingClientRect();
                
//                 // Get computed style
//                 const style = window.getComputedStyle(element);
//                 const fontSize = parseFloat(style.fontSize);
//                 const fontFamily = style.fontFamily;
//                 const color = style.color;
                
//                 // Create text element object
//                 const textElement = {
//                     element,
//                     text,
//                     rect,
//                     style: {
//                         fontSize,
//                         fontFamily,
//                         fontWeight: item.weight,
//                         color
//                     },
//                     type: item.type
//                 };
                
//                 // Add to text elements array
//                 this.textElements.push(textElement);
                
//                 // Create particles for this text
//                 this.createParticlesForText(textElement);
                
//                 // Hide original text
//                 element.style.opacity = '0';
//             });
//         });
//     }
    
//     createParticlesForText(textElement) {
//         const { text, rect, style, type } = textElement;
        
//         // Create temporary canvas to render text
//         const tempCanvas = document.createElement('canvas');
//         const tempCtx = tempCanvas.getContext('2d', { alpha: true });
        
//         // Performance optimization: disable image smoothing
//         tempCtx.imageSmoothingEnabled = false;
        
//         // Set canvas size to match text element with padding
//         tempCanvas.width = rect.width + 20;
//         tempCanvas.height = rect.height + 20;
        
//         // Set text style
//         tempCtx.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
//         tempCtx.fillStyle = 'white';
//         tempCtx.textBaseline = 'top';
        
//         // Draw text to canvas with padding
//         tempCtx.fillText(text, 10, 10);
        
//         // Get image data
//         const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
//         const data = imageData.data;
//         const width = imageData.width;
//         const height = imageData.height;
        
//         // Pre-calculate word positions for better performance
//         const wordPositions = this.calculateWordPositions(text, tempCtx);
        
//         // Create a map to track which word each pixel belongs to - use typed array for better performance
//         const wordMap = new Int16Array(width * height);
//         wordMap.fill(-1);
        
//         // Process each word to find its pixels
//         wordPositions.forEach((wordObj, wordIndex) => {
//             const word = wordObj.text;
            
//             // Create a temporary canvas for this word
//             const wordCanvas = document.createElement('canvas');
//             const wordCtx = wordCanvas.getContext('2d', { alpha: true });
            
//             // Performance optimization: disable image smoothing
//             wordCtx.imageSmoothingEnabled = false;
            
//             // Set canvas size
//             wordCanvas.width = width;
//             wordCanvas.height = height;
            
//             // Set text style
//             wordCtx.font = tempCtx.font;
//             wordCtx.fillStyle = 'white';
//             wordCtx.textBaseline = 'top';
            
//             // Draw only this word
//             wordCtx.fillText(word, wordObj.x, 10);
            
//             // Get image data for this word
//             const wordImageData = wordCtx.getImageData(0, 0, width, height);
//             const wordData = wordImageData.data;
            
//             // Mark pixels belonging to this word - use optimized loop
//             for (let y = 0; y < height; y++) {
//                 const rowOffset = y * width;
//                 for (let x = 0; x < width; x++) {
//                     const index = (rowOffset + x) * 4;
//                     if (wordData[index + 3] > 50) {
//                         wordMap[rowOffset + x] = wordIndex;
//                     }
//                 }
//             }
            
//             // Clean up
//             wordCanvas.width = 1;
//             wordCanvas.height = 1;
//         });
        
//         // Collect potential particle positions with word information
//         const positions = [];
//         // Use consistent sampling for all words to ensure uniform appearance
//         const sampling = this.config.sampling;
        
//         // Use optimized loop for better performance
//         for (let y = 0; y < height; y += sampling) {
//             const rowOffset = y * width;
//             for (let x = 0; x < width; x += sampling) {
//                 const index = (rowOffset + x) * 4;
//                 const alpha = data[index + 3];
                
//                 // Only create particles where text is visible
//                 if (alpha > 50) {
//                     const wordIndex = wordMap[rowOffset + x];
                    
//                     // Skip if we couldn't determine which word this pixel belongs to
//                     if (wordIndex === -1) continue;
                    
//                     const wordObj = wordPositions[wordIndex];
//                     const word = wordObj.text;
//                     const wordLength = word.length;
                    
//                     // Consistent handling for all words regardless of length
//                     // But still ensure short words have enough particles
//                     const isShortWord = wordLength <= 2;
                    
//                     // For short words, ensure we don't skip too many positions
//                     if (isShortWord && Math.random() < 0.3) {
//                         continue; // Skip fewer positions for short words
//                     } else if (!isShortWord && Math.random() < 0.5) {
//                         continue; // Skip more positions for longer words to match density
//                     }
                    
//                     const halfLength = Math.floor(wordLength / 2);
                    
//                     // Determine if this is in the first or second half of the word
//                     const relativeX = x - 10; // Adjust for padding
//                     const charWidth = wordObj.width / Math.max(1, wordLength);
//                     const charPosition = Math.floor(relativeX / charWidth);
                    
//                     const isFirstHalf = charPosition <= halfLength;
                    
//                     positions.push({
//                         x: x - 10 + rect.left, // Adjust for padding
//                         y: y - 10 + rect.top,  // Adjust for padding
//                         wordIndex,
//                         isFirstHalf,
//                         isShortWord
//                     });
//                 }
//             }
//         }
        
//         // Limit number of particles
//         const maxParticles = Math.min(positions.length, this.config.maxParticles);
        
//         // Use a more efficient selection algorithm
//         const selectedPositions = this.selectPositionsEfficiently(positions, maxParticles, this.config.particleSpacing);
        
//         // Calculate horizontal line position
//         const lineY = this.config.line.y;
        
//         // Create particles from selected positions
//         selectedPositions.forEach((pos, index) => {
//             // Use consistent size for all particles, with slight adjustment for short words
//             const sizeMultiplier = pos.isShortWord ? 1.1 : 1.0;
            
//             // Calculate initial position on horizontal line
//             // Distribute particles evenly along the line
//             const lineX = (window.innerWidth * 0.1) + (window.innerWidth * 0.8 * (index / selectedPositions.length));
            
//             const particle = {
//                 x: lineX, // Start on horizontal line
//                 y: lineY, // Start on horizontal line
//                 baseX: pos.x, // Final text position
//                 baseY: pos.y, // Final text position
//                 size: this.config.repel.particleSize * sizeMultiplier * (0.9 + Math.random() * 0.2),
//                 color: style.color,
//                 type: type,
//                 vx: 0,
//                 vy: 0,
//                 scale: 1, // For crunch effect
//                 wordIndex: pos.wordIndex,
//                 isFirstHalf: pos.isFirstHalf,
//                 isShortWord: pos.isShortWord,
//                 angle: Math.random() * Math.PI * 2
//             };
            
//             this.particles.push(particle);
//         });
        
//         // Clean up
//         tempCanvas.width = 1;
//         tempCanvas.height = 1;
//     }
    
//     // Helper method to calculate word positions
//     calculateWordPositions(text, ctx) {
//         const words = [];
//         let currentPosition = 0;
        
//         // Process each word to find its position and length
//         text.split(/\s+/).forEach(word => {
//             if (word.trim() === '') return;
            
//             // Find the exact position of this word in the original text
//             // Skip past the current position to handle repeated words
//             const wordStart = text.indexOf(word, currentPosition);
//             if (wordStart === -1) return; // Skip if word not found
            
//             // Update current position for next search
//             currentPosition = wordStart + word.length;
            
//             // Measure text to find position
//             const beforeText = text.substring(0, wordStart);
//             const metrics = ctx.measureText(beforeText);
//             const wordX = 10 + metrics.width;
            
//             // Measure word width
//             const wordMetrics = ctx.measureText(word);
            
//             // Store word with its position and width
//             words.push({
//                 text: word,
//                 startIndex: wordStart,
//                 x: wordX,
//                 width: wordMetrics.width
//             });
//         });
        
//         return words;
//     }
    
//     // Helper method to select positions efficiently
//     selectPositionsEfficiently(positions, maxCount, spacing) {
//         // Shuffle positions using Fisher-Yates algorithm (more efficient than sort)
//         const shuffled = [...positions];
//         for (let i = shuffled.length - 1; i > 0; i--) {
//             const j = Math.floor(Math.random() * (i + 1));
//             [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//         }
        
//         const selected = [];
//         const spacingSquared = spacing * spacing;
        
//         // Use a more efficient algorithm for position selection
//         for (let i = 0; i < shuffled.length && selected.length < maxCount; i++) {
//             const pos = shuffled[i];
            
//             // Use consistent spacing for all words, with slight adjustment for short words
//             const effectiveSpacing = pos.isShortWord ? spacing * 0.8 : spacing;
//             const effectiveSpacingSquared = effectiveSpacing * effectiveSpacing;
            
//             // Check if this position is far enough from already selected positions
//             let tooClose = false;
//             for (let j = 0; j < selected.length; j++) {
//                 const existing = selected[j];
//                 const dx = pos.x - existing.x;
//                 const dy = pos.y - existing.y;
//                 // Use squared distance to avoid square root calculation
//                 const distanceSquared = dx * dx + dy * dy;
                
//                 if (distanceSquared < effectiveSpacingSquared) {
//                     tooClose = true;
//                     break;
//                 }
//             }
            
//             if (!tooClose) {
//                 selected.push(pos);
//             }
//         }
        
//         return selected;
//     }
    
//     updateParticles() {
//         const mouseX = this.mouse.x;
//         const mouseY = this.mouse.y;
//         const mouseRadius = this.mouse.radius;
        
//         // Check if text has fully formed - only once per frame
//         if (this.particlesState === 'forming') {
//             const elapsedTime = Date.now() - this.formingStartTime;
            
//             // Log progress occasionally (reduced frequency)
//             if (this.frameCount % 30 === 0) {
//                 const progress = Math.min(100, Math.round((elapsedTime / this.formingDuration) * 100));
//                 console.log(`Text forming progress: ${progress}%`);
//             }
            
//             // Check if forming is complete
//             if (elapsedTime >= this.formingDuration) {
//                 this.particlesState = 'formed';
//                 console.log('Text fully formed, state changed to: formed');
//             }
//         }
        
//         // Log current state less frequently to reduce console overhead
//         if (this.frameCount % 60 === 0) {
//             console.log('Current state:', this.particlesState, 'FPS:', this.fps.toFixed(1));
//         }
        
//         // Process particles in batches for better performance
//         const batchSize = 100;
//         const particleCount = this.particles.length;
        
//         for (let i = 0; i < particleCount; i += batchSize) {
//             const end = Math.min(i + batchSize, particleCount);
            
//             for (let j = i; j < end; j++) {
//                 const particle = this.particles[j];
//                 this.updateParticle(particle, mouseX, mouseY, mouseRadius, this.deltaTime);
//             }
            
//             // Allow other tasks to run between batches if we have a lot of particles
//             if (particleCount > 1000 && i + batchSize < particleCount) {
//                 // Use a small timeout to yield to the main thread
//                 // This is commented out as it would make animation less smooth
//                 // setTimeout(() => this.processBatch(i + batchSize, mouseX, mouseY, mouseRadius), 0);
//                 // return;
//             }
//         }
//     }
    
//     // Unified update method for all particle types
//     updateParticle(particle, mouseX, mouseY, mouseRadius, deltaTime) {
//         // Handle based on current state
//         if (this.particlesState === 'line') {
//             // In line state - particles stay in a horizontal line
//             // No need to do anything, they're already positioned on the line
//             return;
//         } 
//         else if (this.particlesState === 'forming') {
//             // In forming state - animate from line to text position
//             const elapsedTime = Date.now() - this.formingStartTime;
//             const progress = Math.min(1, elapsedTime / this.formingDuration);
            
//             // Ease-in-out function: accelerate, then decelerate
//             const easeInOut = progress < 0.5 
//                 ? 2 * progress * progress 
//                 : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
//             // Interpolate between line position and text position
//             const targetX = particle.x + (particle.baseX - particle.x) * easeInOut;
//             const targetY = particle.y + (particle.baseY - particle.y) * easeInOut;
            
//             // Move towards target position
//             particle.x = targetX;
//             particle.y = targetY;
            
//             // Reset velocity
//             particle.vx = 0;
//             particle.vy = 0;
            
//             // Restore size gradually if needed
//             if (particle.scale !== 1) {
//                 particle.scale = Math.min(1, particle.scale * this.config.crunch.growSpeed);
//             }
            
//             return; // Skip the bounce effect
//         }
//         else if (this.particlesState === 'formed') {
//             // In formed state - apply bounce effect with improved repulsion
//             if (mouseX && mouseY) {
//                 const dx = particle.x - mouseX;  
//                 const dy = particle.y - mouseY;
//                 const distanceSquared = dx * dx + dy * dy;
//                 const distance = Math.sqrt(distanceSquared);
                
//                 if (distance < mouseRadius) {
//                     // Normalize direction vector once for efficiency
//                     const invDistance = 1 / distance;
//                     const directionX = dx * invDistance;
//                     const directionY = dy * invDistance;
                    
//                     // Smoother force falloff curve
//                     const forceFalloff = Math.pow(1 - distance / mouseRadius, 1.5);
                    
//                     if (particle.type === 'repel') {
//                         // Direct repulsion away from mouse
//                         const repelForce = forceFalloff * this.config.repel.force;
//                         particle.vx += directionX * repelForce;
//                         particle.vy += directionY * repelForce;
//                     } else if (particle.type === 'crunch') {
//                         // Direct attraction towards mouse
//                         const crunchForce = forceFalloff * this.config.crunch.force;
//                         particle.vx -= directionX * crunchForce;
//                         particle.vy -= directionY * crunchForce;
                        
//                         // Shrink particle with smooth transition
//                         particle.scale = Math.max(this.config.crunch.minSize, 
//                                                particle.scale * this.config.crunch.shrinkSpeed);
//                     }
//                 } else if (particle.type === 'crunch') {
//                     // Restore size gradually
//                     particle.scale = Math.min(1, particle.scale * this.config.crunch.growSpeed);
//                 }
//             } else if (particle.type === 'crunch') {
//                 // Restore size gradually when mouse is out
//                 particle.scale = Math.min(1, particle.scale * this.config.crunch.growSpeed);
//             }
            
//             // Update position with current velocity
//             particle.x += particle.vx;
//             particle.y += particle.vy;
            
//             // Apply friction
//             particle.vx *= this.config.repel.friction;
//             particle.vy *= this.config.repel.friction;
            
//             // Apply speed limit
//             const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
//             if (speed > this.config.repel.maxSpeed) {
//                 const scale = this.config.repel.maxSpeed / speed;
//                 particle.vx *= scale;
//                 particle.vy *= scale;
//             }
            
//             // Spring force return to original position
//             const dx = particle.baseX - particle.x;
//             const dy = particle.baseY - particle.y;
//             const returnDistance = Math.sqrt(dx * dx + dy * dy);
            
//             // Stronger return force when further away
//             const returnStrength = Math.min(1.5, returnDistance / 80);
//             const returnSpeed = particle.type === 'repel' ? 
//                 this.config.repel.returnSpeed : 
//                 this.config.crunch.returnSpeed;
            
//             particle.vx += dx * returnSpeed * returnStrength;
//             particle.vy += dy * returnSpeed * returnStrength;
//         }
//     }
    
//     drawParticles() {
//         // Clear only the used area of the canvas for better performance
//         const ctx = this.ctx;
        
//         // Clear the entire canvas
//         ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
//         // Use faster drawing techniques
//         ctx.beginPath();
        
//         // Draw particles in batches
//         const particleCount = this.particles.length;
//         let lastColor = null;
        
//         for (let i = 0; i < particleCount; i++) {
//             const particle = this.particles[i];
            
//             // Skip extremely small particles
//             const size = particle.size * particle.scale;
//             if (size < 0.3) continue;
            
//             // Batch particles by color for fewer context switches
//             if (particle.color !== lastColor) {
//                 if (lastColor !== null) {
//                     ctx.fill();
//                     ctx.beginPath();
//                 }
//                 ctx.fillStyle = particle.color;
//                 lastColor = particle.color;
//             }
            
//             // Draw circle without unnecessary path operations
//             ctx.moveTo(particle.x + size, particle.y);
//             ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
//         }
        
//         // Fill the last batch
//         if (lastColor !== null) {
//             ctx.fill();
//         }
//     }
    
//     animate(timestamp) {
//         // Calculate delta time for smooth animation
//         this.deltaTime = timestamp - this.lastFrameTime;
//         this.lastFrameTime = timestamp;
        
//         // Increment time for animation (scaled by delta time)
//         this.time += 0.01 * (this.deltaTime / 16.67); // Normalize to 60fps
        
//         // Update FPS counter
//         this.frameCount++;
//         if (timestamp - this.lastFpsUpdate > 1000) {
//             this.fps = this.frameCount / ((timestamp - this.lastFpsUpdate) / 1000);
//             this.frameCount = 0;
//             this.lastFpsUpdate = timestamp;
//         }
        
//         // Update and draw particles
//         this.updateParticles();
//         this.drawParticles();
        
//         // Request next frame
//         this.animationFrameId = requestAnimationFrame(this.boundAnimate);
//     }
// }

// // Initialize when DOM is fully loaded
// document.addEventListener('DOMContentLoaded', () => {
//     // Wait for text elements to be properly rendered
//     setTimeout(() => {
//         window.textParticleEffect = new TextParticleEffect();
//     }, 500);
// });
