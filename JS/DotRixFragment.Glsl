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
    // Blue color palette similar to the image
    if (index < 0.33) {
        return vec3(0.231, 0.51, 0.965); // Light blue
    } else if (index < 0.66) {
        return vec3(0.545, 0.361, 0.965); // Purple
    } else {
        return vec3(0.361, 0.965, 0.949); // Cyan
    }
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
    
    // Create a very soft spotlight with exponential falloff
    float spotRadius = 0.2;
    float falloffStrength = 4.0; // Higher value = sharper falloff
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
