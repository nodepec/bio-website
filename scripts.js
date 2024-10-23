document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const spinner = document.getElementById('loading-spinner');

    const savedBgPosition = sessionStorage.getItem('bgPosition');
    if (savedBgPosition) {
        body.style.backgroundPosition = savedBgPosition;
    }
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

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 0.5;
                this.speedX = (Math.random() * 0.5 - 0.25) * 0.5;
                this.speedY = (Math.random() * 0.5 - 0.25) * 0.5;
                this.color = 'rgba(255, 255, 255, 0.7)';
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.size > 0.1) this.size -= 0.02;

                if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
                if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const createParticles = () => {
            for (let i = 0; i < 50; i++) {
                particles.push(new Particle());
            }
        };

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                        ctx.lineWidth = 0.1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
                
                if (particles[i].size <= 0.1) {
                    particles.splice(i, 1);
                    i--;
                }
            }
            
            if (particles.length < 50) {
                createParticles();
            }
            
            requestAnimationFrame(animateParticles);
        };

        createParticles();
        animateParticles();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        canvas.addEventListener('mousemove', (event) => {
            for (let i = 0; i < 2; i++) {
                particles.push(new Particle());
                particles[particles.length - 1].x = event.x;
                particles[particles.length - 1].y = event.y;
            }
        });
    };

    createDynamicBackground();

    const animateBackground = () => {
        const [x, y] = window.getComputedStyle(body).backgroundPosition.split(' ');
        const newX = (parseFloat(x) + 0.1) % 100;
        const newY = (parseFloat(y) + 0.05) % 100;
        const newPosition = `${newX}% ${newY}%`;
        body.style.backgroundPosition = newPosition;
        sessionStorage.setItem('bgPosition', newPosition);

        requestAnimationFrame(animateBackground);
    };
    requestAnimationFrame(animateBackground);

    spinner.style.display = 'block';
    let rotation = 0;
    const rotateSpinner = () => {
        rotation += 5;
        spinner.style.transform = `rotate(${rotation}deg)`;
        requestAnimationFrame(rotateSpinner);
    };
    requestAnimationFrame(rotateSpinner);

    window.addEventListener("load", () => {
        body.style.opacity = 1;
        
        document.querySelectorAll('.animated-text, .social-icons a').forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = 1;
                el.style.transform = 'translateY(0) scale(1)';
                el.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            }, 100 * index);
        });
        
        setTimeout(() => {
            spinner.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            spinner.style.opacity = 0;
            spinner.style.transform = 'scale(2) rotate(360deg)';
            setTimeout(() => spinner.style.display = 'none', 500);
        }, 1000);
        
        document.querySelectorAll('.social-icons a').forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                icon.style.transform = 'scale(1.2) rotate(5deg)';
            });
            icon.addEventListener('mouseleave', () => {
                icon.style.transform = 'scale(1) rotate(0deg)';
            });
        });
    });
});
