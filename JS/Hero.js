// Noise generator for RepStars-style movement
const noise = {
    seed: Math.random(),
    // Simplex noise implementation
    grad3: [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],
    p: [...Array(256)].map(() => Math.floor(Math.random() * 256)),
    get perm() {
        return [...this.p, ...this.p];
    },
    dot2(g, x, y) {
        return g[0] * x + g[1] * y;
    },
    noise2D(xin, yin) {
        const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
        const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
        let n0 = 0, n1 = 0, n2 = 0;
        const s = (xin + yin) * F2;
        const i = Math.floor(xin + s);
        const j = Math.floor(yin + s);
        const t = (i + j) * G2;
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = xin - X0;
        const y0 = yin - Y0;
        let i1, j1;
        if (x0 > y0) {
            i1 = 1;
            j1 = 0;
        } else {
            i1 = 0;
            j1 = 1;
        }
        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1.0 + 2.0 * G2;
        const y2 = y0 - 1.0 + 2.0 * G2;
        const ii = i & 255;
        const jj = j & 255;
        const g0 = this.grad3[this.perm[ii + this.perm[jj]] % 12];
        const g1 = this.grad3[this.perm[ii + i1 + this.perm[jj + j1]] % 12];
        const g2 = this.grad3[this.perm[ii + 1 + this.perm[jj + 1]] % 12];
        const t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) n0 = 0.0;
        else {
            const t0_2 = t0 * t0;
            n0 = t0_2 * t0_2 * this.dot2(g0, x0, y0);
        }
        const t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) n1 = 0.0;
        else {
            const t1_2 = t1 * t1;
            n1 = t1_2 * t1_2 * this.dot2(g1, x1, y1);
        }
        const t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) n2 = 0.0;
        else {
            const t2_2 = t2 * t2;
            n2 = t2_2 * t2_2 * this.dot2(g2, x2, y2);
        }
        return 70.0 * (n0 + n1 + n2);
    }
};

const ParticleConfig = {
    size: { min: 1, max: 3.6 },    
    density: 0.9,                  
    spacing: { x: 2, y: 2 },       
    scatter: { initial: 0, max: 0 },
    
    
    mouseRepulsion: {
        radius: 180,     
        strength: 0.3,   
        spring: 0.2,     
        damping: 0.85    
    },
    
    
    fontSize: '7.5vw',
    fontFamily: 'Montserrat, sans-serif',
    color: '#ffffff',
    
    
    lines: [
        { text: "We are a digital", x: "50%", y: "30%" },
        { video: "./Vids/Hero Vid.mp4", text: ["design and"], x: "60%", y: "50%" },
        { text: "motion agency", x: "50%", y: "70%" }
    ]
};


const particleProto = {
    update(mouse) {
        if (mouse) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distSq = dx * dx + dy * dy;
            
            if (distSq < ParticleConfig.mouseRepulsion.radius * ParticleConfig.mouseRepulsion.radius) {
                const dist = Math.sqrt(distSq);
                const force = (ParticleConfig.mouseRepulsion.radius - dist) / ParticleConfig.mouseRepulsion.radius;
                const repulsion = force * ParticleConfig.mouseRepulsion.strength;
                this.vx += (dx / dist) * repulsion;
                this.vy += (dy / dist) * repulsion;
            }
        }

        // Strong spring force for quick return to position
        const dx = this.originalX - this.x;
        const dy = this.originalY - this.y;
        this.vx += dx * ParticleConfig.mouseRepulsion.spring;
        this.vy += dy * ParticleConfig.mouseRepulsion.spring;

        // Update position with stronger damping
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= ParticleConfig.mouseRepulsion.damping;
        this.vy *= ParticleConfig.mouseRepulsion.damping;
    },

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
};

function createParticle(x, y) {
    const particle = Object.create(particleProto);
    particle.x = x;
    particle.y = y;
    particle.originalX = x;
    particle.originalY = y;
    particle.vx = 0;
    particle.vy = 0;
    particle.size = ParticleConfig.size.min + Math.random() * (ParticleConfig.size.max - ParticleConfig.size.min);
    return particle;
}

class ParticleText {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = null;
        this.video = null;
        this.setupCanvas();
        this.setupEventListeners();
        this.init();
    }

    setupCanvas() {
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.ctx.fillStyle = ParticleConfig.color;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.font = `bold ${ParticleConfig.fontSize} ${ParticleConfig.fontFamily}`;
            this.createParticles(); // Recreate particles on resize
        };
        window.addEventListener('resize', resize);
        resize();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouse = { x: e.clientX, y: e.clientY };
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouse = null;
        });
    }

    async init() {
        // Initialize video
        this.video = document.querySelector('.HeVid');
        if (!this.video) {
            this.video = document.createElement('video');
            this.video.src = ParticleConfig.lines[1].video;
            this.video.className = 'HeVid';
            this.video.muted = true;
            this.video.loop = true;
            this.video.playsInline = true;
            document.querySelector('.HeroSec').appendChild(this.video);
        }
        await this.video.play().catch(console.error);
        this.createParticles();
        this.animate();
    }

    createParticlesFromText(text, yPosition, xPosition) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;

        // Draw text
        tempCtx.font = this.ctx.font;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillStyle = '#fff';
        
        const x = tempCanvas.width * (parseInt(xPosition) / 100);
        const y = tempCanvas.height * (parseInt(yPosition) / 100);
        tempCtx.fillText(text, x, y);

        // Create particles from text
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const pixels = imageData.data;
        const gridSize = ParticleConfig.spacing.x;

        for (let py = 0; py < tempCanvas.height; py += gridSize) {
            for (let px = 0; px < tempCanvas.width; px += gridSize) {
                if (Math.random() > ParticleConfig.density) continue;

                const i = (py * tempCanvas.width + px) * 4;
                if (pixels[i + 3] > 128) {
                    this.particles.push(createParticle(px, py));
                }
            }
        }
    }

    createParticles() {
        this.particles = []; // Clear existing particles
        for (const line of ParticleConfig.lines) {
            if (typeof line.text === 'string') {
                this.createParticlesFromText(line.text, line.y, line.x);
            } else if (Array.isArray(line.text)) {
                for (const text of line.text) {
                    this.createParticlesFromText(text, line.y, line.x);
                }
            }
        }
    }

    animate() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw video in the middle line
        if (this.video && this.video.readyState >= 2) {
            const videoY = this.canvas.height * 0.5;
            const videoHeight = this.canvas.height * 0.15; // Smaller height to match text
            const videoWidth = (videoHeight * this.video.videoWidth) / this.video.videoHeight;
            const videoX = (this.canvas.width - videoWidth) * 0.5;
            this.ctx.drawImage(this.video, videoX, videoY - videoHeight/2, videoWidth, videoHeight);
        }

        // Update and draw particles
        this.ctx.fillStyle = ParticleConfig.color;
        for (const particle of this.particles) {
            particle.update(this.mouse);
            particle.draw(this.ctx);
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('Hero');
    new ParticleText(canvas);
});