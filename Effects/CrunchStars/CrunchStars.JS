const ATTRACT_CONFIG = {
    PARTICLE: {
        SIZE: 0.8,
        MIN_DENSITY: 10,
        MAX_DENSITY: 30,
        SPREAD: 10,
        FLOAT_RADIUS: 350,
        RETURN_SPEED: 15
    },
    MOUSE: {
        RADIUS: 250
    },
    TEXT: {
        SIZE: 120,
        // FONT:#464343ng Script',
        CONTENT: 'Hashaam'
    },
    COLORS: {
        START: '#d72fcf',
        END: '#257bdd'
    }
};class ColorConverter {
    static toRGB(color) {
        const div = document.createElement('div');
        div.style.color = color;
        document.body.appendChild(div);
        
        const computedColor = window.getComputedStyle(div).color;
        document.body.removeChild(div);
        
        const [r, g, b] = computedColor.match(/\d+/g).map(Number);
        return { r, g, b };
    }
}

const attractCanvas = document.getElementById('AttractCanvas');
const attractCtx = attractCanvas.getContext('2d');
let attractParticles = [];
let attractMouse = { x: null, y: null, radius: ATTRACT_CONFIG.MOUSE.RADIUS };
let attractTime = 0;

attractCanvas.width = window.innerWidth;
attractCanvas.height = window.innerHeight;

class AttractParticle {
    constructor(x, y) {
        this.baseX = x;
        this.baseY = y;
        this.x = x + (Math.random() - 0.5) * ATTRACT_CONFIG.PARTICLE.SPREAD;
        this.y = y + (Math.random() - 0.5) * ATTRACT_CONFIG.PARTICLE.SPREAD;
        this.size = ATTRACT_CONFIG.PARTICLE.SIZE;
        this.density = (Math.random() * ATTRACT_CONFIG.PARTICLE.MAX_DENSITY) + ATTRACT_CONFIG.PARTICLE.MIN_DENSITY;
        this.color = this.calculateAttractGradientColor();
        this.angle = Math.random() * Math.PI * 2;
        this.transitionSpeed = 0.03;
    }

    draw() {
        attractCtx.fillStyle = this.color;
        attractCtx.beginPath();
        attractCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        attractCtx.closePath();
        attractCtx.fill();
    }

    calculateAttractGradientColor() {
        const position = this.x / attractCanvas.width;
        const startRGB = ColorConverter.toRGB(ATTRACT_CONFIG.COLORS.START);
        const endRGB = ColorConverter.toRGB(ATTRACT_CONFIG.COLORS.END);
        
        const r = Math.floor(startRGB.r + (endRGB.r - startRGB.r) * position);
        const g = Math.floor(startRGB.g + (endRGB.g - startRGB.g) * position);
        const b = Math.floor(startRGB.b + (endRGB.b - startRGB.b) * position);
        
        return `rgb(${r},${g},${b})`;
    }
    
    

    update() {
        const floatX = Math.sin(this.angle + attractTime * 0.001) * ATTRACT_CONFIG.PARTICLE.FLOAT_RADIUS;
        const floatY = Math.cos(this.angle + attractTime * 0.001) * ATTRACT_CONFIG.PARTICLE.FLOAT_RADIUS;

        if (attractMouse.x && attractMouse.y) {
            let dx = attractMouse.x - this.x;
            let dy = attractMouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < attractMouse.radius) {
                let force = (attractMouse.radius - distance) / attractMouse.radius;
                force = Math.min(force * 0.1, 0.5);
                
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                
                this.x += forceDirectionX * force * this.density;
                this.y += forceDirectionY * force * this.density;
            } else {
                if (this.x !== this.baseX) {
                    let dx = this.x - this.baseX;
                    this.x -= dx * this.transitionSpeed;
                }
                if (this.y !== this.baseY) {
                    let dy = this.y - this.baseY;
                    this.y -= dy * this.transitionSpeed;
                }
            }
        } else {
            const targetX = this.baseX + floatX;
            const targetY = this.baseY + floatY;
            
            this.x += (targetX - this.x) * this.transitionSpeed;
            this.y += (targetY - this.y) * this.transitionSpeed;
        }
    }



}function initAttract() {
    attractParticles = [];
    
    const gradient = attractCtx.createLinearGradient(0, 0, attractCanvas.width, 0);
    gradient.addColorStop(0, '#ff3366');
    gradient.addColorStop(1, '#ff6b98');
    
    attractCtx.fillStyle = gradient;
    attractCtx.strokeStyle = gradient;
    
    attractCtx.font = `${ATTRACT_CONFIG.TEXT.SIZE}px '${ATTRACT_CONFIG.TEXT.FONT}'`;
    attractCtx.textAlign = 'center';
    attractCtx.textBaseline = 'middle';
    
    attractCtx.fillText(ATTRACT_CONFIG.TEXT.CONTENT, attractCanvas.width/2, attractCanvas.height/2);
    attractCtx.lineWidth = 1;
    attractCtx.strokeText(ATTRACT_CONFIG.TEXT.CONTENT, attractCanvas.width/2, attractCanvas.height/2);
    
    const textCoordinates = attractCtx.getImageData(0, 0, attractCanvas.width, attractCanvas.height);
    
    for (let y = 0; y < textCoordinates.height; y += 1) {
        for (let x = 0; x < textCoordinates.width; x += 1) {
            if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
                if (Math.random() < 0.25) {
                    attractParticles.push(new AttractParticle(x, y));
                }
            }
        }
    }
}

function animateAttract() {
    attractCtx.clearRect(0, 0, attractCanvas.width, attractCanvas.height);
    attractTime++;
    
    attractParticles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    requestAnimationFrame(animateAttract);
}

function handleAttractMouseMove(event) {
    const rect = attractCanvas.getBoundingClientRect();
    if (event.clientY <= rect.bottom && event.clientY >= rect.top) {
        attractMouse.x = event.x;
        attractMouse.y = event.y;
    } else {
        handleAttractMouseOut();
    }
}

function handleAttractMouseOut() {
    attractMouse.x = undefined;
    attractMouse.y = undefined;
}
function handleAttractResize() {
    attractCanvas.width = window.innerWidth;
    attractCanvas.height = window.innerHeight;
    initAttract();
}

window.addEventListener('mousemove', handleAttractMouseMove);
window.addEventListener('mouseout', handleAttractMouseOut);
window.addEventListener('resize', handleAttractResize);

document.fonts.load(`${ATTRACT_CONFIG.TEXT.SIZE}px ${ATTRACT_CONFIG.TEXT.FONT}`).then(() => {
    initAttract();
    animateAttract();
});
