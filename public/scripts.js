document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const spinner = document.getElementById('loading-spinner');

    const createDynamicBackground = () => {
        const canvas = document.createElement('canvas');
        canvas.id = 'dynamic-background';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const maxParticles = 100;
        const particleColor = 'rgba(255, 255, 255, 0.7)';
        const lineColor = 'rgba(255, 255, 255, 0.1)';

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
                if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
            }

            draw() {
                ctx.fillStyle = particleColor;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const createParticles = () => {
            while (particles.length < maxParticles) {
                particles.push(new Particle());
            }
        };

        const drawConnections = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = lineColor;
                        ctx.lineWidth = 0.1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle) => {
                particle.update();
                particle.draw();
            });

            drawConnections();

            requestAnimationFrame(animateParticles);
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);

        createParticles(); // Generate particles
        animateParticles(); // Start animation loop
    };

    // Ensure the background animation starts independently
    createDynamicBackground();

    // Page content animations
    window.addEventListener('load', () => {
        body.style.opacity = 1;

        document.querySelectorAll('.animated-text, .social-icons a').forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = 1;
                el.style.transform = 'translateY(0) scale(1)';
                el.style.transition =
                    'opacity 0.5s ease, transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            }, 100 * index);
        });

        if (spinner) {
            setTimeout(() => {
                spinner.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                spinner.style.opacity = 0;
                spinner.style.transform = 'scale(2) rotate(360deg)';
                setTimeout(() => (spinner.style.display = 'none'), 500);
            }, 1000);
        }

        document.querySelectorAll('.social-icons a').forEach((icon) => {
            icon.addEventListener('mouseenter', () => {
                icon.style.transform = 'scale(1.2) rotate(5deg)';
            });
            icon.addEventListener('mouseleave', () => {
                icon.style.transform = 'scale(1) rotate(0deg)';
            });
        });
    });
});
