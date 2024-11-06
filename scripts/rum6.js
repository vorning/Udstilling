const circles = document.querySelectorAll('.circle-container div');

circles.forEach(circle => {
    circle.addEventListener('mouseover', () => {
        circle.style.transform = 'scale(1.2)';
        circle.style.transition = 'transform 0.2s';
    });
    circle.addEventListener('mouseout', () => {
        circle.style.transform = 'scale(1)';
    });
});

const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');

// Resize the canvas to fill the browser window dynamically
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles(); // Reinitialize particles on resize
});

// Particle settings
const particlesArray = [];
const numberOfParticles = 100;

class Particle {
    constructor(x, y, size, speedX, speedY) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Reverse direction on edges
        if (this.x + this.size > canvas.width || this.x - this.size < 0) {
            this.speedX = -this.speedX;
        }
        if (this.y + this.size > canvas.height || this.y - this.size < 0) {
            this.speedY = -this.speedY;
        }
    }
    draw() {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}

function initParticles() {
    particlesArray.length = 0; // Clear existing particles
    for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 3 + 1;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const speedX = Math.random() * 2 - 1;
        const speedY = Math.random() * 2 - 1;
        particlesArray.push(new Particle(x, y, size, speedX, speedY));
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach(particle => {
        particle.update();
        particle.draw();
    });
    requestAnimationFrame(animateParticles);
}

// Initialize and animate
initParticles();
animateParticles();