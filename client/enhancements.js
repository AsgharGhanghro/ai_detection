// 3D Marquee with hover pause effect
class Marquee3D {
    constructor() {
        this.container = null;
        this.cards = [];
        this.isPaused = false;
        this.animationId = null;
        this.lastTime = 0;
        this.speed = 0.5; // pixels per frame
        this.position = 0;
        this.init();
    }

    init() {
        this.createMarquee3D();
        this.bindEvents();
        this.startAnimation();
    }

    createMarquee3D() {

        const marqueeHTML = `
            <div class="marquee-3d-section">
                <div class="marquee-3d-decor decor-1"></div>
                <div class="marquee-3d-decor decor-2"></div>
                
                <div class="marquee-header">
                    <h2>Powerful Features</h2>
                    <p>Hover over any card to pause and explore our advanced capabilities</p>
                </div>
                
                <div class="marquee-3d-container" id="marquee-3d-container">
                    ${features.map(feature => this.createCardHTML(feature)).join('')}
                    ${features.map(feature => this.createCardHTML(feature)).join('')}
                </div>
                
                <div class="pause-indicator">
                    <i class="fas fa-pause"></i>
                    Marquee Paused
                </div>
                
                <div class="marquee-progress">
                    <div class="progress-bar"></div>
                </div>
            </div>
        `;

        // Add to about section or create new section
        const aboutSection = document.getElementById('about') || document.querySelector('section:nth-of-type(2)');
        if (aboutSection) {
            aboutSection.insertAdjacentHTML('afterend', marqueeHTML);
        } else {
            document.body.insertAdjacentHTML('beforeend', marqueeHTML);
        }

        this.container = document.getElementById('marquee-3d-container');
        this.cards = Array.from(this.container.querySelectorAll('.marquee-3d-card'));
    }

    createCardHTML(feature) {
        return `
            <div class="marquee-3d-card">
                <div class="marquee-3d-icon">
                    <i class="${feature.icon}"></i>
                </div>
                <div class="marquee-3d-content">
                    <h3 class="marquee-3d-title">${feature.title}</h3>
                    <p class="marquee-3d-desc">${feature.description}</p>
                </div>
                <div class="card-3d-effect"></div>
            </div>
        `;
    }

    bindEvents() {
        if (!this.container) return;

        // Pause on hover
        this.container.addEventListener('mouseenter', () => this.pause());
        this.container.addEventListener('mouseleave', () => this.resume());

        // Touch events for mobile
        this.container.addEventListener('touchstart', () => this.pause());
        this.container.addEventListener('touchend', () => this.resume());

        // Card hover effects
        this.cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => this.onCardHover(e));
            card.addEventListener('mouseleave', (e) => this.onCardLeave(e));
        });

        // Window resize handling
        window.addEventListener('resize', () => this.handleResize());
    }

    startAnimation() {
        const animate = (timestamp) => {
            if (!this.lastTime) this.lastTime = timestamp;
            const delta = timestamp - this.lastTime;
            this.lastTime = timestamp;

            if (!this.isPaused) {
                this.position -= this.speed * (delta / 16);
                
                // Reset position when half the container width is moved
                const containerWidth = this.container.scrollWidth / 2;
                if (Math.abs(this.position) >= containerWidth) {
                    this.position = 0;
                }

                this.container.style.transform = `translateX(${this.position}px) translateZ(0)`;
            }

            this.animationId = requestAnimationFrame(animate);
        };

        this.animationId = requestAnimationFrame(animate);
    }

    pause() {
        this.isPaused = true;
        this.container.style.animationPlayState = 'paused';
        
        // Show pause indicator
        const indicator = document.querySelector('.pause-indicator');
        if (indicator) {
            indicator.style.opacity = '1';
            indicator.style.visibility = 'visible';
        }
    }

    resume() {
        this.isPaused = false;
        this.container.style.animationPlayState = 'running';
        
        // Hide pause indicator
        const indicator = document.querySelector('.pause-indicator');
        if (indicator) {
            indicator.style.opacity = '0';
            indicator.style.visibility = 'hidden';
        }
    }

    onCardHover(event) {
        const card = event.currentTarget;
        
        // Add 3D tilt effect
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateY = ((x - centerX) / centerX) * 10;
        const rotateX = ((centerY - y) / centerY) * -10;
        
        card.style.transform = `translateZ(50px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        
        // Add glow effect
        card.style.boxShadow = `
            0 40px 80px rgba(99, 102, 241, 0.4),
            0 0 0 2px rgba(99, 102, 241, 0.2) inset
        `;
    }

    onCardLeave(event) {
        const card = event.currentTarget;
        
        // Reset transform
        card.style.transform = 'translateZ(0) rotateX(0) rotateY(0)';
        card.style.boxShadow = `
            0 20px 40px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `;
    }

    handleResize() {
        // Reset position on resize
        this.position = 0;
        this.container.style.transform = 'translateX(0) translateZ(0)';
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Remove event listeners
        this.container.removeEventListener('mouseenter', () => this.pause());
        this.container.removeEventListener('mouseleave', () => this.resume());
        
        this.cards.forEach(card => {
            card.removeEventListener('mouseenter', (e) => this.onCardHover(e));
            card.removeEventListener('mouseleave', (e) => this.onCardLeave(e));
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.marquee3D = new Marquee3D();
    
    // Add keyboard controls (spacebar to pause/resume)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (window.marquee3D.isPaused) {
                window.marquee3D.resume();
                showNotification('Marquee resumed', 'info');
            } else {
                window.marquee3D.pause();
                showNotification('Marquee paused', 'info');
            }
        }
    });
});

// Utility function to toggle marquee
function toggleMarquee(enable) {
    if (!window.marquee3D) return;
    
    if (enable) {
        window.marquee3D.resume();
    } else {
        window.marquee3D.pause();
    }
}

// Add mouse parallax effect to the entire section
function addParallaxEffect() {
    const section = document.querySelector('.marquee-3d-section');
    if (!section) return;

    section.addEventListener('mousemove', (e) => {
        const rect = section.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const moveX = (x - centerX) * 0.01;
        const moveY = (y - centerY) * 0.01;
        
        // Move decorative elements
        const decor1 = section.querySelector('.decor-1');
        const decor2 = section.querySelector('.decor-2');
        
        if (decor1) {
            decor1.style.transform = `translate(${moveX * 2}px, ${moveY * 2}px)`;
        }
        
        if (decor2) {
            decor2.style.transform = `translate(${-moveX * 3}px, ${-moveY * 3}px)`;
        }
        
        // Slight tilt to entire section
        section.style.transform = `
            perspective(1500px)
            rotateX(${moveY * -0.5}deg)
            rotateY(${moveX * 0.5}deg)
        `;
    });

    section.addEventListener('mouseleave', () => {
        section.style.transform = 'perspective(1500px) rotateX(0) rotateY(0)';
        
        const decor1 = section.querySelector('.decor-1');
        const decor2 = section.querySelector('.decor-2');
        
        if (decor1) decor1.style.transform = 'translate(0, 0)';
        if (decor2) decor2.style.transform = 'translate(0, 0)';
    });
}

// Initialize parallax
document.addEventListener('DOMContentLoaded', addParallaxEffect);