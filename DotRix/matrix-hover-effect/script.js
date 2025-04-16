document.addEventListener("DOMContentLoaded", () => {
    // Get the container elements
    const container = document.querySelector(".fullscreen-container");
    const dotMatrixContainer = document.querySelector(".dot-matrix-container");
    const spotlightMask = document.querySelector(".spotlight-mask");
    
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
    
    // Load the shader
    fetch('shader.glsl')
        .then(response => response.text())
        .then(shaderCode => {
            // Create shader material
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    u_time: { value: 0.0 },
                    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
                    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                    u_hover: { value: 0.0 }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: shaderCode,
                transparent: true
            });
            
            // Create mesh and add to scene
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            
            // Variables for animation
            let isHovering = false;
            let animationTime = 0;
            let lastTime = 0;
            const mouse = { x: 0.5, y: 0.5 };
            
            // Handle window resize
            window.addEventListener("resize", () => {
                renderer.setSize(window.innerWidth, window.innerHeight);
                material.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
            });
            
            // Mouse tracking for the spotlight effect
            document.addEventListener("mousemove", (e) => {
                mouse.x = e.clientX / window.innerWidth;
                mouse.y = 1 - (e.clientY / window.innerHeight); // Invert Y for WebGL coordinates
                
                // Update the spotlight mask with a softer, more gradual fade
                spotlightMask.style.background = `
                    radial-gradient(
                        200px circle at ${e.clientX}px ${e.clientY}px,
                        rgba(59, 130, 246, 0.35) 0%,
                        rgba(59, 130, 246, 0.25) 15%,
                        rgba(59, 130, 246, 0.15) 30%,
                        rgba(59, 130, 246, 0.08) 50%,
                        rgba(59, 130, 246, 0.03) 70%,
                        transparent 100%
                    )
                `;
            });
            
            // Handle hover state
            container.addEventListener("mouseenter", () => {
                isHovering = true;
                spotlightMask.classList.add("active");
            });
            
            container.addEventListener("mouseleave", () => {
                isHovering = false;
                spotlightMask.classList.remove("active");
            });
            
            // Animation loop
            function animate(currentTime) {
                requestAnimationFrame(animate);
                
                // Convert time to seconds
                currentTime = currentTime / 1000;
                
                // Calculate delta time
                const deltaTime = currentTime - lastTime;
                lastTime = currentTime;
                
                // Only increment animation time when hovering
                if (isHovering) {
                    animationTime += deltaTime;
                }
                
                // Update shader uniforms
                material.uniforms.u_time.value = animationTime;
                material.uniforms.u_mouse.value.set(mouse.x, mouse.y);
                material.uniforms.u_hover.value = isHovering ? 1.0 : 0.0;
                
                // Render the scene
                renderer.render(scene, camera);
            }
            
            // Start animation loop
            animate(performance.now());
        })
        .catch(error => console.error('Error loading shader:', error));
});
