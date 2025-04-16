// const canvas = document.getElementById('Canvas');
// const ctx = canvas.getContext('2d');
// let particlesArray = [];
// let mouse = { x: null, y: null, radius: 150 };

// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

// class Particle {
//     constructor(x, y) {
//         this.x = x;
//         this.y = y;
//         this.baseX = x;
//         this.baseY = y;
//         this.size = 1;
//         this.density = (Math.random() * 30) + 1;
//         this.color = '#ff3366';
//     }

//     draw() {
//         ctx.fillStyle = this.color;
//         ctx.beginPath();
//         ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
//         ctx.closePath();
//         ctx.fill();
//     }

//     update() {
//         let dx = mouse.x - this.x;
//         let dy = mouse.y - this.y;
//         let distance = Math.sqrt(dx * dx + dy * dy);
//         if (distance === 0) return;

//         let forceDirectionX = dx / distance;
//         let forceDirectionY = dy / distance;
//         let maxDistance = mouse.radius;
//         let force = (maxDistance - distance) / maxDistance;
//         let directionX = forceDirectionX * force * this.density;
//         let directionY = forceDirectionY * force * this.density;

//         if (distance < mouse.radius) {
//             this.x = this.x - directionX;
//             this.y = this.y - directionY;
//         } else {
//             if (this.x !== this.baseX) {
//                 let dx = this.x - this.baseX;
//                 this.x -= dx/10;
//             }
//             if (this.y !== this.baseY) {
//                 let dy = this.y - this.baseY;
//                 this.y -= dy/10;
//             }
//         }
//     }
// }

// function init() {
//     particlesArray = [];
    
//     ctx.fillStyle = '#ff3366';
//     ctx.font = 'bold 160px Arial';
//     ctx.textAlign = 'center';
//     ctx.fillText('Hello', canvas.width/2, canvas.height/2);
    
//     const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
//     for (let y = 0; y < textCoordinates.height; y += 5) {
//         for (let x = 0; x < textCoordinates.width; x += 5) {
//             if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
//                 particlesArray.push(new Particle(x, y));
//             }
//         }
//     }
// }

// function animate() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     particlesArray.forEach(particle => {
//         particle.update();
//         particle.draw();
//     });
//     requestAnimationFrame(animate);
// }

// window.addEventListener('mousemove', (event) => {
//     mouse.x = event.x;
//     mouse.y = event.y;
// });

// window.addEventListener('mouseout', () => {
//     mouse.x = undefined;
//     mouse.y = undefined;
// });

// window.addEventListener('resize', () => {
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
//     init();
// });

// init();
// animate();



























// const canvas = document.getElementById('Canvas');
// const ctx = canvas.getContext('2d');
// let particlesArray = [];
// let mouse = { x: null, y: null, radius: 25 };
//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;

//   const noise = new SimplexNoise();
//   let time = 0;

//   class Particle {
//       constructor(x, y) {
//           this.x = x;
//           this.y = y;
//           this.baseX = x;
//           this.baseY = y;
//           this.size = 2;
//           this.density = (Math.random() * 30) + 1;
//           this.color = '#ff3366';
//           this.noiseOffset = Math.random() * 1000; // Unique offset for each particle
//       }

//       draw() {
//           ctx.fillStyle = this.color;
//           ctx.beginPath();
//           ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
//           ctx.closePath();
//           ctx.fill();
//       }

//       update() {
//           // Original repulsion logic
//           let dx = mouse.x - this.x;
//           let dy = mouse.y - this.y;
//           let distance = Math.sqrt(dx * dx + dy * dy);

//          // Update the noise calculation in the Particle update method:
// // In the Particle update method:
// const noiseX = noise.noise2D(this.baseX * 0.005 + time, this.baseY * 0.005) * 3;
// const noiseY = noise.noise2D(this.baseX * 0.005, this.baseY * 0.005 + time) * 3;

//           if (distance < mouse.radius) {
//               // Existing repulsion code
//               let forceDirectionX = dx / distance;
//               let forceDirectionY = dy / distance;
//               let force = (mouse.radius - distance) / mouse.radius;
//               let directionX = forceDirectionX * force * this.density;
//               let directionY = forceDirectionY * force * this.density;
            
//               this.x = this.x - directionX + noiseX;
//               this.y = this.y - directionY + noiseY;
//           } else {
//               if (this.x !== this.baseX) {
//                   let dx = this.x - this.baseX;
//                   this.x -= dx/10;
//               }
//               if (this.y !== this.baseY) {
//                   let dy = this.y - this.baseY;
//                   this.y -= dy/10;
//               }
//               // Add subtle noise when particles are at rest
//               this.x += noiseX * 0.5;
//               this.y += noiseY * 0.5;
//           }
//       }
//   }

//   function init() {
//       particlesArray = [];
    
//       // Add roundness to text rendering
//       ctx.lineJoin = 'round';
//       ctx.lineCap = 'round';
//       ctx.miterLimit = 2;
    
//     // Create gradient
//     const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
//     gradient.addColorStop(0, '#ff3366');
//     gradient.addColorStop(1, '#ff6b98');
    
//     ctx.fillStyle = gradient;
//     ctx.strokeStyle = gradient;
    
//     // Draw text with both fill and stroke for rounded edges
//     ctx.font = 'bold 160px Arial Rounded MT Bold';
//     ctx.textAlign = 'center';
//     ctx.textBaseline = 'middle';
    
//     const text = 'Hello';
//     ctx.fillText(text, canvas.width/2, canvas.height/2);
//     ctx.lineWidth = 4;
//     ctx.strokeText(text, canvas.width/2, canvas.height/2);
    
//     const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
//     for (let y = 0; y < textCoordinates.height; y += 2) {
//         for (let x = 0; x < textCoordinates.width; x += 2) {
//             if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
//                 particlesArray.push(new Particle(x, y));
//             }
//         }
//     }
// }



// function animate() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     particlesArray.forEach(particle => {
//         particle.update();
//         particle.draw();
//     });
//     time += 0.01; // Faster time increment
//     requestAnimationFrame(animate);
// }


// window.addEventListener('mousemove', (event) => {
//     mouse.x = event.x;
//     mouse.y = event.y;
// });

// window.addEventListener('mouseout', () => {
//     mouse.x = undefined;
//     mouse.y = undefined;
// });

// window.addEventListener('resize', () => {
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
//     init();
// });

// init();
// animate();


























// const canvas = document.getElementById('Canvas');
// const ctx = canvas.getContext('2d');
// let particlesArray = [];
// let mouse = { x: null, y: null, radius: 25 };
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

// let settings = {
//     textSize: 160,
//     particleSize: 2,
//     mouseRadius: 25,
//     startColor: '#ff3366',
//     endColor: '#ff6b98',
//     customText: 'Hello',
//     visualizer: {
//         barWidth: 2.5,
//         barSpacing: 1,
//         sensitivity: 1.5,
//         baseHue: 200
//     }
// };

// const audioContext = new AudioContext();
// let audioSource;
// let analyser;
// let musicData;

// function initAudio() {
//     const audio = new Audio();
//     audio.src = 'your-music.mp3';
//     audioSource = audioContext.createMediaElementSource(audio);
//     analyser = audioContext.createAnalyser();
//     audioSource.connect(analyser);
//     analyser.connect(audioContext.destination);
//     analyser.fftSize = 512;
//     musicData = new Uint8Array(analyser.frequencyBinCount);
// }

// function animate() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
    
//     // Existing particle code
//     particlesArray.forEach(particle => {
//         particle.update();
//         particle.draw();
//     });
    
//     // Add visualizer bars
//     if (analyser) {
//         analyser.getByteFrequencyData(musicData);
//         const barWidth = 15;
//         const barSpacing = 3;
//         const barCount = musicData.length;
        
//         for (let i = 0; i < barCount; i++) {
//             const height = (musicData[i] / 255) * canvas.height * 0.5;
//             const hue = (i / barCount) * 360;
            
//             ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
//             ctx.fillRect(
//                 i * (barWidth + barSpacing),
//                 canvas.height - height,
//                 barWidth,
//                 height
//             );
//         }
//     }
    
//     requestAnimationFrame(animate);
// }
// class VisualizerParticle {
//     constructor(x, y, frequency) {
//         this.x = x;
//         this.y = y;
//         this.baseX = x;
//         this.baseY = y;
//         this.size = Math.random() * 3 + 2;
//         this.density = Math.random() * 30 + 1;
//         this.frequency = frequency;
//         this.angle = Math.random() * Math.PI * 2;
//         this.speed = Math.random() * 0.5 + 0.2;
//         this.offset = Math.random() * 100;
//         this.life = 1;
//         this.hue = Math.random() * 60 + 200;
//     }

//     update(frequency) {
//         this.frequency = frequency;
//         this.angle += this.speed;
        
//         const wave = Math.sin(this.angle + this.offset) * 100 * this.frequency;
//         const wave2 = Math.cos(this.angle * 0.5 + this.offset) * 50 * this.frequency;
        
//         this.x = this.baseX + wave;
//         this.y = this.baseY + wave2;
        
//         this.size = Math.max(0, this.size + Math.sin(this.angle) * 0.3);
//         this.life -= 0.01;
//     }

//     draw() {
//         visualizerCtx.beginPath();
//         visualizerCtx.arc(this.x, this.y, this.size * this.frequency, 0, Math.PI * 2);
//         visualizerCtx.fillStyle = `hsla(${this.hue}, 100%, 50%, ${this.life * 0.5})`;
//         visualizerCtx.fill();
        
//         if (this.frequency > 0.5) {
//             visualizerCtx.beginPath();
//             visualizerCtx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
//             visualizerCtx.strokeStyle = `hsla(${this.hue + 30}, 100%, 50%, ${this.life * 0.2})`;
//             visualizerCtx.stroke();
//         }
//     }
// }

// let visualizerParticles = [];

// function drawVisualizer() {
//     if (!analyser) return;
    
//     analyser.getByteFrequencyData(musicData);
//     visualizerCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
//     visualizerCtx.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
    
//     // Create new particles based on audio
//     for (let i = 0; i < musicData.length; i += 4) {
//         const frequency = musicData[i] / 255;
//         if (frequency > 0.5 && Math.random() > 0.8) {
//             const x = Math.random() * visualizerCanvas.width;
//             const y = Math.random() * visualizerCanvas.height;
//             visualizerParticles.push(new VisualizerParticle(x, y, frequency));
//         }
//     }
    
//     // Update and draw particles
//     visualizerParticles = visualizerParticles.filter(particle => particle.life > 0);
//     visualizerParticles.forEach((particle, i) => {
//         const frequency = musicData[i % musicData.length] / 255;
//         particle.update(frequency);
//         particle.draw();
//     });
    
//     // Add bloom effect
//     visualizerCtx.globalCompositeOperation = 'screen';
//     const gradient = visualizerCtx.createRadialGradient(
//         visualizerCanvas.width/2, visualizerCanvas.height/2, 0,
//         visualizerCanvas.width/2, visualizerCanvas.height/2, visualizerCanvas.width/2
//     );
//     gradient.addColorStop(0, 'rgba(30, 0, 60, 0.3)');
//     gradient.addColorStop(1, 'transparent');
//     visualizerCtx.fillStyle = gradient;
//     visualizerCtx.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
//     visualizerCtx.globalCompositeOperation = 'source-over';
// }
// // Add at the top with other variables
// let time = 0;          // Add toggle button
//           const toggleBtn = document.createElement('button');
//           toggleBtn.className = 'panel-toggle';
//           toggleBtn.innerHTML = '⚙️';
//           document.body.appendChild(toggleBtn);

//           const controlPanel = document.querySelector('.control-panel');

//           // Add toggle button click handler
//           toggleBtn.addEventListener('click', () => {
//               controlPanel.classList.toggle('hidden');
//               toggleBtn.style.right = controlPanel.classList.contains('hidden') ? '20px' : '320px';
    
//               if (!analyser) {
//                   initAudio();
//               }
//           });

//           // Add this function to handle audio setup
//           async function initAudio() {
//               try {
//                   const stream = await navigator.mediaDevices.getUserMedia({
//                       audio: {
//                           mandatory: {
//                               chromeMediaSource: 'tab'
//                           }
//                       },
//                       video: false
//                   });
        
//                   const source = audioContext.createMediaStreamSource(stream);
//                   analyser = audioContext.createAnalyser();
//                   analyser.fftSize = 512;
//                   source.connect(analyser);
//                   musicData = new Uint8Array(analyser.frequencyBinCount);
        
//                   // Start visualization
//                   animate();
//               } catch (err) {
//                   console.log('Audio capture error:', err);
//               }
//           }
// // Slider hover interactions
// const sliders = document.querySelectorAll('input[type="range"]');

// sliders.forEach(slider => {
//     const valueDisplay = document.createElement('span');
//     valueDisplay.className = 'slider-value';
//     slider.parentElement.appendChild(valueDisplay);

//     const updateValue = () => {
//         const unit = slider.id.includes('Color') ? '' : '%';
//         valueDisplay.textContent = `${Math.round(slider.value)}${unit}`;
//     };

//     updateValue();

//     slider.addEventListener('mousemove', (e) => {
//         const rect = slider.getBoundingClientRect();
//         const position = (e.clientX - rect.left) / rect.width;
//         const value = position * (slider.max - slider.min) + parseInt(slider.min);
//         slider.value = value;
//         updateValue();
//         slider.dispatchEvent(new Event('input'));
//     });
// });


// class Particle {
//     constructor(x, y) {
//         this.x = x;
//         this.y = y;
//         this.baseX = x;
//         this.baseY = y;
//         this.size = settings.particleSize;
//         this.density = (Math.random() * 30) + 1;
//         this.color = settings.startColor;
//     }

//     draw() {
//         ctx.fillStyle = this.color;
//         ctx.beginPath();
//         ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
//         ctx.closePath();
//         ctx.fill();
//     }

//     update() {
//         let dx = mouse.x - this.x;
//         let dy = mouse.y - this.y;
//         let distance = Math.sqrt(dx * dx + dy * dy);

//         if (distance < mouse.radius) {
//             let forceDirectionX = dx / distance;
//             let forceDirectionY = dy / distance;
//             let force = (mouse.radius - distance) / mouse.radius;
//             let directionX = forceDirectionX * force * this.density;
//             let directionY = forceDirectionY * force * this.density;
            
//             this.x = this.x - directionX;
//             this.y = this.y - directionY;
//         } else {
//             if (this.x !== this.baseX) {
//                 let dx = this.x - this.baseX;
//                 this.x -= dx/10;
//             }
//             if (this.y !== this.baseY) {
//                 let dy = this.y - this.baseY;
//                 this.y -= dy/10;
//             }
//         }
//     }
// }

// function init() {
//     particlesArray = [];
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
    
//     const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
//     gradient.addColorStop(0, settings.startColor);
//     gradient.addColorStop(1, settings.endColor);
    
//     ctx.fillStyle = gradient;
//     ctx.strokeStyle = gradient;
    
//     ctx.font = `bold ${settings.textSize}px Arial`;
//     ctx.textAlign = 'center';
//     ctx.textBaseline = 'middle';
    
//     ctx.fillText(settings.customText, canvas.width/2, canvas.height/2);
//     ctx.lineWidth = 4;
//     ctx.strokeText(settings.customText, canvas.width/2, canvas.height/2);
    
//     const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
//     for (let y = 0; y < textCoordinates.height; y += 2) {
//         for (let x = 0; x < textCoordinates.width; x += 2) {
//             if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
//                 particlesArray.push(new Particle(x, y));
//             }
//         }
//     }
// }

// function animate() {    ctx.clearRect(0, 0, canvas.width, canvas.height);
//     particlesArray.forEach(particle => {
//         particle.update();
//         particle.draw();
//     });
//     requestAnimationFrame(animate);
// }

// document.getElementById('textSize').addEventListener('input', (e) => {
//     settings.textSize = parseInt(e.target.value);
//     init();
// });

// document.getElementById('particleSize').addEventListener('input', (e) => {
//     settings.particleSize = parseFloat(e.target.value);
//     particlesArray.forEach(particle => {
//         particle.size = settings.particleSize;
//     });
// });

// document.getElementById('mouseRadius').addEventListener('input', (e) => {
//     mouse.radius = parseInt(e.target.value);
// });

// document.getElementById('startColor').addEventListener('input', (e) => {
//     settings.startColor = e.target.value;
//     init();
// });

// document.getElementById('endColor').addEventListener('input', (e) => {
//     settings.endColor = e.target.value;
//     init();
// });

// document.getElementById('customText').addEventListener('input', (e) => {
//     settings.customText = e.target.value;
//     init();
// });

// window.addEventListener('mousemove', (event) => {
//     mouse.x = event.x;
//     mouse.y = event.y;
// });

// window.addEventListener('mouseout', () => {
//     mouse.x = undefined;
//     mouse.y = undefined;
// });

// window.addEventListener('resize', () => {
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
//     init();
// });

// init();
// animate();

//   // Add after toggle button creation
//   const audioBtn = document.createElement('button');
//   audioBtn.className = 'panel-toggle audio-toggle';
//   audioBtn.innerHTML = '🎵';
//   audioBtn.style.right = '80px';  // Position it next to gear icon
//   document.body.appendChild(audioBtn);

//   audioBtn.addEventListener('click', async () => {
//       try {
//           const stream = await navigator.mediaDevices.getDisplayMedia({
//               video: true,
//               audio: {
//                   echoCancellation: false,
//                   noiseSuppression: false,
//                   autoGainControl: false
//               }
//           });
        
//           const audioTracks = stream.getAudioTracks();
//           if (audioTracks.length > 0) {
//               const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//               const source = audioContext.createMediaStreamSource(stream);
//               analyser = audioContext.createAnalyser();
//               analyser.fftSize = 256;
//               source.connect(analyser);
//               musicData = new Uint8Array(analyser.frequencyBinCount);
            
//               // Visual feedback that audio is connected
//               audioBtn.style.backgroundColor = '#ff3366';
//           }
//       } catch (err) {
//           console.log('Screen Capture:', err);
//       }
//   });






// // !!!!!
// // Create a separate canvas for visualizer
// const visualizerCanvas = document.createElement('canvas');
// visualizerCanvas.id = 'visualizer';
// visualizerCanvas.style.position = 'absolute';
// visualizerCanvas.style.top = '0';
// visualizerCanvas.style.left = '0';
// visualizerCanvas.style.zIndex = '5';
// document.body.appendChild(visualizerCanvas);

// // Use separate context for visualizer
// const visualizerCtx = visualizerCanvas.getContext('2d');
// visualizerCanvas.width = window.innerWidth;
// visualizerCanvas.height = window.innerHeight;

// // Update animate function to use separate contexts
// function animate() {
//     // Clear and draw particles on main canvas
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     particlesArray.forEach(particle => {
//         particle.update();
//         particle.draw();
//     });

//     // Draw visualizer on separate canvas
//     if (analyser) {
//         visualizerCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
//         analyser.getByteFrequencyData(musicData);
//         const barWidth = 15;
//         const barSpacing = 3;
//         const barCount = musicData.length;
        
//         for (let i = 0; i < barCount; i++) {
//             const height = (musicData[i] / 255) * visualizerCanvas.height * 0.5;
//             const hue = (i / barCount) * 360;
            
//             visualizerCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
//             visualizerCtx.fillRect(
//                 i * (barWidth + barSpacing),
//                 visualizerCanvas.height - height,
//                 barWidth,
//                 height
//             );
//         }
//     }
    
//     requestAnimationFrame(animate);
// }

































// 1. Configuration Management
const CONFIG = {
    PARTICLE: {
        MIN_DENSITY: 1,
        MAX_DENSITY: 80,
        RETURN_SPEED: 0.05,
        LEAVE_SPEED: 0.03,
        SCATTER_RANGE: 8,
        FLOAT_AMPLITUDE: 350,    // Controls height of vertical movement
        FLOAT_FREQUENCY: 0.1,   // Controls speed of vertical oscillation
        PHASE_OFFSET: 1.2,
        Y_TILT: 0.8         // Creates wave-like motion
    },
    GRID: {
        BASE: 0.66,
        SPACING: 2
    }
};


class ColorConverter {
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

const canvas = document.getElementById('Canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];
let mouse = { x: null, y: null, radius: 30 };
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


let time = 0;

let settings = {
    textSize: 160,
    particleSize: 1,
    mouseRadius: 20,
    startColor: 'hsl(122, 84.80%, 18.00%)',
    endColor: 'hsl(273, 67.80%, 58.60%)',
    customText: 'HASHAAM', 
    fontFamily: 'Playfair Display'
};

// 2. Performance Optimization
const particlePrototype = {
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
};

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.size = settings.particleSize;
        this.density = (Math.random() * CONFIG.PARTICLE.MAX_DENSITY) + CONFIG.PARTICLE.MIN_DENSITY;
        this.color = this.calculateGradientColor();
        this.returnSpeed = CONFIG.PARTICLE.RETURN_SPEED;
        this.angle = Math.random() * Math.PI * 2; // Add this line
    }


    draw = particlePrototype.draw;

    calculateGradientColor() {
        const position = this.x / canvas.width;
        const startRGB = ColorConverter.toRGB(settings.startColor);
        const endRGB = ColorConverter.toRGB(settings.endColor);
        
        const r = Math.floor(startRGB.r + (endRGB.r - startRGB.r) * position);
        const g = Math.floor(startRGB.g + (endRGB.g - startRGB.g) * position);
        const b = Math.floor(startRGB.b + (endRGB.b - startRGB.b) * position);
        
        return `rgb(${r},${g},${b})`;
    }
    

    update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
    
        const horizontalFloat = Math.sin(this.angle + time * CONFIG.PARTICLE.FLOAT_FREQUENCY) 
        * CONFIG.PARTICLE.FLOAT_AMPLITUDE * 1.2;
const verticalFloat = Math.cos(this.angle * CONFIG.PARTICLE.Y_TILT + time * CONFIG.PARTICLE.PHASE_OFFSET) 
      * CONFIG.PARTICLE.FLOAT_AMPLITUDE * 0.8;


    
        if (mouse.x && mouse.y) {
            if (distance < mouse.radius) {
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let force = (mouse.radius - distance) / mouse.radius;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;
                
                this.x = this.x - directionX;
                this.y = this.y - directionY;
            } else {
                if (this.x !== this.baseX) {
                    let dx = this.x - this.baseX;
                    this.x -= dx * this.returnSpeed;
                }
                if (this.y !== this.baseY) {
                    let dy = this.y - this.baseY;
                    this.y -= dy * this.returnSpeed;
                }
            }
        } else {
            // Smooth transition to floating state
            const targetX = this.baseX + horizontalFloat;
        const targetY = this.baseY + verticalFloat;
        
        this.x += (targetX - this.x) * CONFIG.PARTICLE.LEAVE_SPEED;
        this.y += (targetY - this.y) * CONFIG.PARTICLE.LEAVE_SPEED;
        }
    }
    
    
}

// 4. Error Handling
function init() {
    try {
        particlesArray = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, settings.startColor);
        gradient.addColorStop(1, settings.endColor);
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = gradient;
        
        ctx.font = `bold ${settings.textSize}px ${settings.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillText(settings.customText, canvas.width/2, canvas.height/2);
        ctx.lineWidth = 1;
        ctx.strokeText(settings.customText, canvas.width/2, canvas.height/2);
        
        const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        for (let y = 0; y < textCoordinates.height; y += (CONFIG.GRID.BASE * CONFIG.GRID.SPACING)) {
            for (let x = 0; x < textCoordinates.width; x += (CONFIG.GRID.BASE * CONFIG.GRID.SPACING)) {
                if (textCoordinates.data[(Math.floor(y) * 4 * textCoordinates.width) + (Math.floor(x) * 4) + 3] > 128) {
                    const scatterX = x + (Math.random() - 0.5) * CONFIG.PARTICLE.SCATTER_RANGE;
                    const scatterY = y + (Math.random() - 0.5) * CONFIG.PARTICLE.SCATTER_RANGE;
                    particlesArray.push(new Particle(scatterX, scatterY));
                }
            }
        }
    } catch (error) {
        console.error('Initialization failed:', error);
    }
}

// 5. Modular Animation Loop
function updateParticles() {
    particlesArray.forEach(particle => particle.update());
}

function renderParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach(particle => particle.draw());
}

function animate() {
    time += 0.01; // Add this line
    updateParticles();
    renderParticles();
    requestAnimationFrame(animate);
}

// 3. Event Handler Management
function handleMouseMove(event) {
    mouse.x = event.x;
    mouse.y = event.y;
}

function handleMouseOut() {
    mouse.x = undefined;
    mouse.y = undefined;
}

function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
}

function cleanup() {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseout', handleMouseOut);
    window.removeEventListener('resize', handleResize);
}

// Event Listeners
window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('mouseout', handleMouseOut);
window.addEventListener('resize', handleResize);

// Initialize
document.fonts.load(`bold ${settings.textSize}px ${settings.fontFamily}`).then(() => {
    init();
    animate();
});