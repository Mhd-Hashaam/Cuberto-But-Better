const noise = () => {
    // console.group('🎨 Noise Effect Initialization');
    // console.time('Total Setup Time');
    
    let canvas, ctx;
    let wWidth, wHeight;
    let noiseData = [];
    let frame = 0;
    let loopTimeout;
    
    const createNoise = () => {
        // console.log(`📊 Creating noise pattern ${noiseData.length + 1}/10`);
        const idata = ctx.createImageData(wWidth, wHeight);
        const buffer32 = new Uint32Array(idata.data.buffer);
        const len = buffer32.length;
        // console.log(`Buffer length: ${len} pixels`);

        for (let i = 0; i < len; i++) {
            if (Math.random() < 0.08) {
                buffer32[i] = 0xffffffff; // White pixels instead of 0xff000000 (black)
            }
        }
        
        noiseData.push(idata);
    };
    
    const paintNoise = () => {
        // console.log(`🎬 Frame: ${frame}/9 rendered`);
        if (frame === 9) {
            frame = 0;
        } else {
            frame++;
        }
        ctx.putImageData(noiseData[frame], 0, 0);
    };
    
    const setup = () => {
        // console.log('🚀 Starting canvas setup');
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');
        
        wWidth = window.innerWidth;
        wHeight = window.innerHeight;
        // console.log(`📐 Canvas dimensions: ${wWidth}px × ${wHeight}px`);

        canvas.width = wWidth;
        canvas.height = wHeight;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '99';
        canvas.style.opacity = '0.07';
        document.body.appendChild(canvas);
        // console.log('✅ Canvas appended to document');
        
        for (let i = 0; i < 10; i++) {
            createNoise();
        }
        
        // console.timeEnd('Total Setup Time');
        // console.groupEnd();
        
        loop();
    };
    
    const FPS = 40; // Lower number = slower animation
    
    const loop = () => {
        paintNoise();
        loopTimeout = window.setTimeout(() => {
            window.requestAnimationFrame(loop);
        }, 1000 / FPS); // Using our new FPS control
    };
    
    setup();
    
    window.addEventListener('resize', () => {
        console.log('🔄 Window resized - reinitializing');
        window.clearTimeout(loopTimeout);
        setup();
    });
};

noise();
export default noise;