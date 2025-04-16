document.addEventListener("DOMContentLoaded", () => {
    // Initialize the matrix effect when the menu is shown
    console.log("DotRix.js loaded, initializing matrix effect");
    initMatrixEffect();
});

function initMatrixEffect() {
    // Get the container elements
    const menu = document.querySelector('.MorphEnu-');
    const dotMatrixContainer = document.querySelector('.morphenu-dot-matrix-container');
    const spotlightMask = document.querySelector('.morphenu-spotlight-mask');
    
    if (!dotMatrixContainer || !spotlightMask) {
        console.error('Matrix effect containers not found');
        return;
    }
    
    console.log("Matrix effect containers found");
    
    // Set up Three.js scene
    const scene = new THREE.Scene();
    
    // Create a camera
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    
    // Create a renderer with transparent background
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setSize(window.innerWidth, window.innerHeight);
    dotMatrixContainer.appendChild(renderer.domElement);
    
    // Create a plane geometry that fills the view
    const geometry = new THREE.PlaneGeometry(2, 2);
    
    // Mouse position for the spotlight effect
    const mouse = { x: 0.5, y: 0.5 };
    
    // Hover state - set to 1 initially to make dots visible
    let hover = 1;
    
    // Inline shaders for immediate testing (no fetch required)
    const vertexShader = `
        uniform float time;
        uniform vec2 resolution;
        uniform vec2 mouse;
        
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    
    const fragmentShader = `
        precision mediump float;
        uniform float time;
        uniform vec2 resolution;
        uniform vec2 mouse;
        uniform float hover;
        varying vec2 vUv;
        
        // Random function
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        // Function to select color from an array based on index
        vec3 getColor(float index) {
            // Option 1: Copper/Gold theme (matches your accent color)
            if (index < 0.33) {
                return vec3(0.722, 0.451, 0.2); // Copper gold
            } else if (index < 0.66) {
                return vec3(0.824, 0.608, 0.365); // Light copper
            } else {
                return vec3(0.596, 0.376, 0.192); // Dark copper
            }
            
            // Option 2: Cool blues (uncomment to use)
            /*
            if (index < 0.33) {
                return vec3(0.231, 0.51, 0.965); // Light blue
            } else if (index < 0.66) {
                return vec3(0.145, 0.388, 0.663); // Medium blue
            } else {
                return vec3(0.086, 0.247, 0.424); // Dark blue
            }
            */
            
            // Option 3: Monochromatic (uncomment to use)
            /*
            if (index < 0.33) {
                return vec3(0.8, 0.8, 0.8); // Light gray
            } else if (index < 0.66) {
                return vec3(0.6, 0.6, 0.6); // Medium gray
            } else {
                return vec3(0.4, 0.4, 0.4); // Dark gray
            }
            */
            
            // Option 4: Accent with complementary (uncomment to use)
            /*
            if (index < 0.33) {
                return vec3(0.722, 0.451, 0.2); // Copper (your accent)
            } else if (index < 0.66) {
                return vec3(0.2, 0.451, 0.722); // Complementary blue
            } else {
                return vec3(0.722, 0.2, 0.451); // Complementary magenta
            }
            */
        }
        
        void main() {
            vec2 uv = vUv;
            
            // Create an even denser grid of dots for fullscreen
            float gridSize = 300.0;
            vec2 gridPos = floor(uv * gridSize);
            vec2 cellPos = fract(uv * gridSize);
            
            // Random value for each dot position
            float randPos = random(gridPos);
            
            // Create a cyclic animation (repeats every 6 seconds)
            float cycleTime = mod(time, 6.0);
            
            // Each dot has a different offset in the cycle
            float dotOffset = random(gridPos) * 6.0;
            
            // Create a cyclic animation value (0 to 1 and back)
            float animationPhase = mod(cycleTime + dotOffset, 6.0) / 6.0;
            
            // Create a wave-like pattern
            float wave = sin(animationPhase * 3.14159 * 2.0) * 0.5 + 0.5;
            
            // Random flicker effect
            float flicker = step(0.7, random(gridPos + vec2(floor(time * 0.5))));
            
            // Combine wave and flicker
            float animFactor = wave * (0.8 + flicker * 0.2);
            
            // Set opacity based on random value - make almost all dots visible
            float baseOpacity = 0.0;
            if (randPos < 0.4) baseOpacity = 0.9;       // 40% of dots are bright
            else if (randPos < 0.7) baseOpacity = 0.7;  // 30% of dots are medium-bright
            else if (randPos < 0.9) baseOpacity = 0.5;  // 20% of dots are medium
            else if (randPos < 0.98) baseOpacity = 0.3; // 8% of dots are dim
            else baseOpacity = 0.2;                     // 2% of dots are very dim
            
            // Apply animation factor to opacity
            float opacity = baseOpacity * animFactor;
            
            // Make dots smaller for fullscreen view
            float dotSize = 0.4;
            float dot = step(1.0 - dotSize, 1.0 - length(cellPos - 0.5) * 2.0);
            
            // Calculate aspect ratio to correct the spotlight shape
            float aspectRatio = resolution.x / resolution.y;
            
            // Adjust mouse position for aspect ratio
            vec2 adjustedUV = uv;
            vec2 adjustedMouse = mouse;
            
            // Correct the distortion by applying aspect ratio
            if (aspectRatio > 1.0) {
                // Landscape orientation
                adjustedUV.x *= aspectRatio;
                adjustedMouse.x *= aspectRatio;
            } else {
                // Portrait orientation
                adjustedUV.y /= aspectRatio;
                adjustedMouse.y /= aspectRatio;
            }
            
            // Calculate distance to mouse with aspect ratio correction
            float distToMouse = length(adjustedUV - adjustedMouse);
            
            // Keep the spotlight effect but make it more subtle
            float spotRadius = 0.3; // Larger radius
            float falloffStrength = 1.0; // Less sharp falloff
            float spotlight = exp(-falloffStrength * pow(distToMouse / spotRadius, 2.0)) * hover;
            
            // Only show dots within the spotlight radius
            float finalOpacity = opacity * dot * spotlight;
            
            // Boost the opacity to make dots more visible
            finalOpacity *= 3.0;
            
            // Select color based on random value
            vec3 dotColor = getColor(randPos);
            
            // Output final color with opacity
            gl_FragColor = vec4(dotColor, finalOpacity);
            
            // Pre-multiply alpha for proper blending
            gl_FragColor.rgb *= gl_FragColor.a;
        }
    `;
    
    // Create shader material with inline shaders
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            mouse: { value: new THREE.Vector2(0.5, 0.5) },
            resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            hover: { value: 1.0 } // Start with hover at 1.0 to make dots visible immediately
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    
    console.log("Shader material created");
    
    // Create a mesh with the geometry and material
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    });
    
    // Mouse tracking for the spotlight effect
    document.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX / window.innerWidth;
        mouse.y = 1 - (e.clientY / window.innerHeight); // Invert Y for WebGL coordinates
        
        // Remove the spotlight mask gradient
        spotlightMask.style.background = 'transparent';
    });
    
    // Handle menu visibility changes
    const menuObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                if (menu.classList.contains('active')) {
                    // Menu is visible, fade in the effect
                    fadeInEffect();
                } else {
                    // Menu is hidden, fade out the effect
                    fadeOutEffect();
                }
            }
        });
    });
    
    // Start observing the menu element
    menuObserver.observe(menu, { attributes: true });
    
    // Function to fade in the effect
    function fadeInEffect() {
        gsap.to({ value: 0 }, {
            value: 1,
            duration: 0.8,
            onUpdate: function() {
                hover = this.targets()[0].value;
                material.uniforms.hover.value = hover;
            }
        });
    }
    
    // Function to fade out the effect
    function fadeOutEffect() {
        gsap.to({ value: hover }, {
            value: 0,
            duration: 0.5,
            onUpdate: function() {
                hover = this.targets()[0].value;
                material.uniforms.hover.value = hover;
            }
        });
    }
    
    // Listen for custom events from menu.js
    document.addEventListener('matrix-fade-in', () => {
        fadeInEffect();
    });
    
    document.addEventListener('matrix-fade-out', () => {
        fadeOutEffect();
    });
    
    // Animation loop
    function animate(currentTime) {
        requestAnimationFrame(animate);
        
        // Update time uniform (convert to seconds)
        material.uniforms.time.value = currentTime * 0.001;
        
        // Update mouse position
        material.uniforms.mouse.value.set(mouse.x, mouse.y);
        
        // Render the scene
        renderer.render(scene, camera);
    }
    
    console.log("Starting animation loop");
    // Start animation loop
    animate(performance.now());
}