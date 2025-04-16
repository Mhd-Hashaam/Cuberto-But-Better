const createTransitionNoise = (config = {}) => {
    // Default configuration with expanded options
    const defaultConfig = {
        density: 10.08,           // Density of noise particles
        fps: 30,                 // Frames per second for animation
        duration: 2000,          // Duration of transition in milliseconds
        zIndex: '2200',          // z-index of the canvas
        noiseColor: '0xffffff',  // Color of noise particles (hex)
        noiseOpacity: 0.2,       // Opacity of noise particles (0-1)
        backgroundColor: 'rgba(0, 0, 0, 0.92)', // Background color
        blurAmount: '100px',      // Amount of backdrop blur
        particleSize: 10,         // Size multiplier for particles
        noiseVariation: 0.5,     // Variation in noise intensity (0-1)
        animated: true,          // Whether noise should animate
        grainMovement: 0.5       // How much the grain moves between frames (0-1)
    };
    
    // Merge provided config with defaults
    const mergedConfig = { ...defaultConfig, ...config };
    
    let canvas, ctx;
    let wWidth, wHeight;
    let noiseData = [];
    let frame = 0;
    let loopTimeout;
    let isTransitioning = false;
    let opacity = 0;
    let targetOpacity = 0;
    let active = false;
    let startTime = 0;
    
    const createNoise = () => {
        const idata = ctx.createImageData(wWidth, wHeight);
        const buffer32 = new Uint32Array(idata.data.buffer);
        const buffer8 = new Uint8ClampedArray(idata.data.buffer);
        const len = buffer32.length;
        
        // Convert hex color to RGB
        const hexColor = parseInt(mergedConfig.noiseColor.replace(/^0x|#/g, ''), 16);
        const r = (hexColor >> 16) & 255;
        const g = (hexColor >> 8) & 255;
        const b = hexColor & 255;
        const a = Math.round(mergedConfig.noiseOpacity * 255);

        // Create noise with improved pattern
        for (let i = 0; i < len; i++) {
            // Apply density and variation
            if (Math.random() < (mergedConfig.density * (1 + (Math.random() - 0.5) * mergedConfig.noiseVariation))) {
                // For more control over color and opacity:
                const index = i * 4;
                buffer8[index] = r;     // R
                buffer8[index + 1] = g; // G
                buffer8[index + 2] = b; // B
                buffer8[index + 3] = a; // A
                
                // Apply particle size if > 1
                if (mergedConfig.particleSize > 1 && i + 1 < len && i + wWidth < len) {
                    const size = Math.floor(mergedConfig.particleSize);
                    for (let sx = 0; sx < size && i % wWidth + sx < wWidth; sx++) {
                        for (let sy = 0; sy < size && i + sy * wWidth < len; sy++) {
                            if (sx === 0 && sy === 0) continue; // Skip the original pixel
                            const neighborIndex = i + sx + sy * wWidth;
                            if (neighborIndex < len) {
                                buffer8[neighborIndex * 4] = r;
                                buffer8[neighborIndex * 4 + 1] = g;
                                buffer8[neighborIndex * 4 + 2] = b;
                                buffer8[neighborIndex * 4 + 3] = a;
                            }
                        }
                    }
                }
            }
        }
        
        noiseData.push(idata);
    };
    
    const paintNoise = () => {
        if (!canvas) return;
        
        if (mergedConfig.animated) {
            if (frame === 9) {
                frame = 0;
            } else {
                frame++;
            }
        }
        
        if (isTransitioning) {
            const currentTime = performance.now();
            const elapsed = Math.min((currentTime - startTime) / mergedConfig.duration, 1);
            
            // Improved easing function for smoother transition
            const ease = (t) => {
                return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
            };
            
            opacity = targetOpacity === 1 ? ease(elapsed) : 1 - ease(elapsed);
            canvas.style.opacity = opacity.toString();
            
            if (elapsed >= 1) {
                isTransitioning = false;
                if (targetOpacity === 0) {
                    cleanup();
                }
            }
        }
        
        ctx.putImageData(noiseData[frame], 0, 0);
    };
    
    const setup = () => {
        if (canvas) cleanup();
        
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');
        
        wWidth = window.innerWidth;
        wHeight = window.innerHeight;
        
        canvas.width = wWidth;
        canvas.height = wHeight;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = mergedConfig.zIndex;
        canvas.style.opacity = '0';
        canvas.style.backgroundColor = mergedConfig.backgroundColor;
        canvas.style.backdropFilter = `blur(${mergedConfig.blurAmount})`;
        document.body.appendChild(canvas);
        
        noiseData = [];
        for (let i = 0; i < 10; i++) {
            createNoise();
        }
        
        loop();
    };
    
    const cleanup = () => {
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
            window.clearTimeout(loopTimeout);
            canvas = null;
            ctx = null;
            noiseData = [];
        }
    };
    
    const loop = () => {
        if (!canvas) return;
        paintNoise();
        loopTimeout = window.setTimeout(() => {
            window.requestAnimationFrame(loop);
        }, 1000 / mergedConfig.fps);
    };
    
    return {
        reveal: (callback) => {
            if (!canvas) setup();
            isTransitioning = true;
            targetOpacity = 1;
            startTime = performance.now();
            
            // After the reveal animation completes
            setTimeout(() => {
                if (callback) callback();
                // Start the exit animation
                isTransitioning = true;
                targetOpacity = 0;
                startTime = performance.now();
            }, mergedConfig.duration);
        },
        
        // Add method to update config dynamically
        updateConfig: (newConfig) => {
            Object.assign(mergedConfig, newConfig);
            if (canvas) {
                canvas.style.zIndex = mergedConfig.zIndex;
                canvas.style.backgroundColor = mergedConfig.backgroundColor;
                canvas.style.backdropFilter = `blur(${mergedConfig.blurAmount})`;
                
                // Regenerate noise if needed
                if (newConfig.density !== undefined || 
                    newConfig.noiseColor !== undefined || 
                    newConfig.noiseOpacity !== undefined ||
                    newConfig.particleSize !== undefined ||
                    newConfig.noiseVariation !== undefined) {
                    noiseData = [];
                    for (let i = 0; i < 10; i++) {
                        createNoise();
                    }
                }
            }
            return mergedConfig; // Return current config
        },
        
        // Get current configuration
        getConfig: () => {
            return { ...mergedConfig };
        }
    };
};

// Create transition instance with custom config
export const menuTransition = createTransitionNoise({
    density: 0.12,           // Increased density
    fps: 60,                 // Higher framerate for smoother animation
    duration: 2000,
    zIndex: '999',
    noiseColor: '0xffffff',  // White noise
    noiseOpacity: 2.25,      // Slightly more visible
    particleSize: 11.5,       // Larger particles
    noiseVariation: 0.6,     // More variation in noise pattern
    grainMovement: 0.7       // More movement between frames
});

// Export the factory function for creating additional instances with different configs
export const createNoise = createTransitionNoise;