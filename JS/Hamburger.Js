const hamburger = document.querySelector('.Hamburger');
const menuWord = document.querySelector('.Menu-Word');
let isOpen = false;
let isStretching = false;

const tl = gsap.timeline({ paused: true });

// Initial setup - set starting dash values
gsap.set('.hamburger-path-1', {
    strokeDashoffset: 221,
    strokeDasharray: "46 249"
});

gsap.set('.hamburger-path-2', {
    strokeDashoffset: 290,
    strokeDasharray: "25 270"
});

// Create elastic effect for hamburger
const elasticEffect = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    spring: 1.2,
    friction: 5.5,
    maxDistance: 80 // Maximum distance it can move
};

function updateElasticEffect() {
    // Calculate distance between current and target position
    const dx = elasticEffect.targetX - elasticEffect.x;
    const dy = elasticEffect.targetY - elasticEffect.y;
    
    // Limit the maximum distance
    const distance = Math.hypot(dx, dy);
    if (distance > elasticEffect.maxDistance) {
        const angle = Math.atan2(dy, dx);
        elasticEffect.targetX = Math.cos(angle) * elasticEffect.maxDistance;
        elasticEffect.targetY = Math.sin(angle) * elasticEffect.maxDistance;
    }
    
    // Apply spring physics with friction
    elasticEffect.x += dx / elasticEffect.friction * elasticEffect.spring;
    elasticEffect.y += dy / elasticEffect.friction * elasticEffect.spring;
    
    // Apply position with elastic scaling
    const distanceFromTarget = Math.hypot(dx, dy);
    const maxScale = 1.2;
    const scaleEffect = isStretching ? 
        Math.min(maxScale, 1 + (distanceFromTarget * 0.004)) : 1;
    
    gsap.set(hamburger, {
        x: elasticEffect.x,
        y: elasticEffect.y,
        scale: scaleEffect
    });

    requestAnimationFrame(updateElasticEffect);
}

// Start the elastic animation loop
updateElasticEffect();

// Handle mouse movement for magnetic effect
hamburger.addEventListener('mousemove', (e) => {
    const bounds = hamburger.getBoundingClientRect();
    const mouseX = e.clientX - bounds.left - bounds.width / 2;
    const mouseY = e.clientY - bounds.top - bounds.height / 2;
    const distance = Math.hypot(mouseX, mouseY);
    
    if (distance > bounds.width * 0.3) {  // Reduced threshold for earlier response
        isStretching = true;
        elasticEffect.targetX = mouseX * 0.3;  // Increased movement range
        elasticEffect.targetY = mouseY * 0.3;
    } else {
        isStretching = false;
        elasticEffect.targetX = mouseX * 0.2;
        elasticEffect.targetY = mouseY * 0.2;
    }
});

hamburger.addEventListener('mouseleave', () => {
    isStretching = false;
    gsap.to(elasticEffect, {
        targetX: 0,
        targetY: 0,
        duration: 1,
        ease: "elastic.out(1, 0.3)",
        onComplete: () => {
            gsap.to(hamburger, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    });
});

// Create the animation timeline
tl.to('.hamburger-path-1', {
    duration: 1.8,
    strokeDashoffset: 175,
    strokeDasharray: "0 295",
    opacity: 0,
    ease: "bounce.out"
}, 0)
.to('.hamburger-path-2', {
    duration: 2,
    keyframes: [
        { 
            strokeDashoffset: 295,
            strokeDasharray: "40 260",
            strokeWidth: "3px",
            duration: 0.6
        },
        { 
            strokeDashoffset: 75,
            strokeDasharray: "42 250",
            strokeWidth: "6px",
            duration: 0.8
        }
    ],
    ease: "bounce.out"
}, 0)
.to(menuWord, {
    duration: 1.2,
    opacity: 0,
    ease: "power2.out"
}, 0)
.to('.Hamburger', {
    duration: 1.8,
    scale: 1.6,
    ease: "bounce.out"
}, 0);

hamburger.addEventListener('click', () => {
    isOpen = !isOpen;
    if (isOpen) {
        tl.play();
    } else {
        tl.reverse();
    }
});
