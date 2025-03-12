const createTransitionNoise = (config = {}) => {
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
        const len = buffer32.length;

        // Match the original noise pattern from Grained.js
        for (let i = 0; i < len; i++) {
            if (Math.random() < (config.density || 0.08)) {
                buffer32[i] = 0x33ffffff; // White with low opacity
            }
        }
        
        noiseData.push(idata);
    };
    
    const paintNoise = () => {
        if (!canvas) return;
        
        if (frame === 9) {
            frame = 0;
        } else {
            frame++;
        }
        
        if (isTransitioning) {
            const currentTime = performance.now();
            const elapsed = Math.min((currentTime - startTime) / (config.duration || 2000), 1);
            
            // Smooth easing function
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
        canvas.style.zIndex = '2200';
        canvas.style.opacity = '0';
        canvas.style.backgroundColor = 'rgba(0, 0, 0, 0.92)';
        canvas.style.backdropFilter = 'blur(10px)';
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
        }, 1000 / (config.fps || 30));
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
            }, config.duration || 2000);
        }
    };
};

// Create transition instance with custom config
export const menuTransition = createTransitionNoise({
    density: 0.08,
    fps: 60,
    duration: 2000,
    zIndex: '999'
});