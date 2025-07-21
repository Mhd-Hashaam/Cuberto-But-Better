// Initialize the icosahedron
document.addEventListener('DOMContentLoaded', () => {
    // Create the animation instance
    let icoAnimation = new explosion.default(
        'ico-container', // id of DOM element
        {
            surface: '666666',     // Surface color (hex without #)
            inside: '98e898',      // Inside color (hex without #)
            background: '151616',  // Background color (hex without #)
            onLoad: () => {
                console.log('Icosahedron loaded');
            }
        }
    );

    // Mouse interaction logic
    let targetMouseX = 0, mouseX = 0;
    const sign = function(n) { return n === 0 ? 1 : n/Math.abs(n); };
    
    document.querySelector('.IcoSec').addEventListener('mousemove', (e) => {
        const rect = document.querySelector('.IcoSec').getBoundingClientRect();
        targetMouseX = 2 * (e.clientX - rect.left - icoAnimation.width/2) / icoAnimation.width;
    });

    document.querySelector('.IcoSec').addEventListener('touchmove', (e) => {
        const rect = document.querySelector('.IcoSec').getBoundingClientRect();
        targetMouseX = 2 * (e.touches[0].clientX - rect.left) / icoAnimation.width - 1;
    });

    // Animation loop
    function animateIco() {
        if(icoAnimation) {
            mouseX += (targetMouseX - mouseX) * 0.05;
            let ta = Math.abs(mouseX);
            icoAnimation.settings.progress = ta;
            icoAnimation.scene.rotation.y = Math.PI/2 - ta * (2 - ta) * Math.PI * sign(mouseX);
            icoAnimation.scene.rotation.z = Math.PI/2 - ta * (2 - ta) * Math.PI * sign(mouseX);
        }
        requestAnimationFrame(animateIco);
    }
    
    animateIco();
}); 