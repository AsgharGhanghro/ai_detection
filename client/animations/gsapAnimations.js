// GSAP Animations
function initializeAnimations() {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Hero Section Animations
    animateHero();
    
    // Card Animations
    animateCards();
    
    // Stats Counter
    animateStatsCounter();
    
    // Feature Cards
    animateFeatures();
    
    // Navbar Animation
    animateNavbar();
}

// Hero Section Animation
function animateHero() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    tl.to('.hero-title', {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.3
    })
    .to('.hero-subtitle', {
        opacity: 1,
        y: 0,
        duration: 0.8
    }, '-=0.6')
    .to('.hero-buttons', {
        opacity: 1,
        y: 0,
        duration: 0.8
    }, '-=0.6')
    .to('.hero-stats', {
        opacity: 1,
        y: 0,
        duration: 0.8
    }, '-=0.6');
}

// Animate Stats Counter
function animateStatsCounter() {
    const stats = document.querySelectorAll('.stat-value');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                const duration = 2;
                const increment = target / (duration * 60);
                let current = 0;
                
                const counter = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        entry.target.textContent = target.toLocaleString() + 
                            (entry.target.textContent.includes('%') ? '%' : '');
                        clearInterval(counter);
                    } else {
                        entry.target.textContent = Math.floor(current).toLocaleString();
                    }
                }, 1000 / 60);
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));
}

// Card Animations
function animateCards() {
    gsap.utils.toArray('.glass-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 50,
            duration: 0.8,
            delay: index * 0.1,
            ease: 'power2.out'
        });
    });
}

// Feature Cards Animation
function animateFeatures() {
    gsap.utils.toArray('.feature-card').forEach((card, index) => {
        // Entrance animation
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 60,
            rotationX: -15,
            duration: 0.8,
            delay: index * 0.15,
            ease: 'back.out(1.7)'
        });

        // Hover effect using GSAP
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                y: -10,
                scale: 1.02,
                duration: 0.3,
                ease: 'power2.out'
            });
            
            gsap.to(card.querySelector('.feature-icon'), {
                rotationY: 360,
                duration: 0.6,
                ease: 'power2.inOut'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                y: 0,
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
}

// Navbar Animation
function animateNavbar() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            navbar.classList.remove('scroll-up');
            navbar.style.transform = 'translateY(0)';
            return;
        }

        if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
            // Scroll Down
            navbar.classList.remove('scroll-up');
            navbar.classList.add('scroll-down');
            gsap.to(navbar, {
                y: -100,
                duration: 0.3,
                ease: 'power2.out'
            });
        } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
            // Scroll Up
            navbar.classList.remove('scroll-down');
            navbar.classList.add('scroll-up');
            gsap.to(navbar, {
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        }

        lastScroll = currentScroll;
    });
}

// Button Ripple Effect
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                transform: translate(-50%, -50%);
                pointer-events: none;
            `;

            this.appendChild(ripple);

            gsap.to(ripple, {
                width: 300,
                height: 300,
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out',
                onComplete: () => ripple.remove()
            });
        });
    });
});

// Smooth Scroll
function smoothScroll(target) {
    gsap.to(window, {
        duration: 1,
        scrollTo: {
            y: target,
            offsetY: 80
        },
        ease: 'power3.inOut'
    });
}

// Parallax Effect
function initParallax() {
    gsap.utils.toArray('.parallax').forEach(element => {
        gsap.to(element, {
            scrollTrigger: {
                trigger: element,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            },
            y: (i, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed || 50,
            ease: 'none'
        });
    });
}

// Text Reveal Animation
function textRevealAnimation(element) {
    const text = element.textContent;
    const chars = text.split('');
    element.textContent = '';

    chars.forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        element.appendChild(span);

        gsap.to(span, {
            opacity: 1,
            y: 0,
            duration: 0.05,
            delay: index * 0.03,
            ease: 'power2.out'
        });
    });
}

// Magnetic Button Effect
function magneticButton(button, strength = 0.3) {
    button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(button, {
            x: x * strength,
            y: y * strength,
            duration: 0.3,
            ease: 'power2.out'
        });
    });

    button.addEventListener('mouseleave', () => {
        gsap.to(button, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.3)'
        });
    });
}

// Apply magnetic effect to primary buttons
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-primary').forEach(btn => {
        magneticButton(btn);
    });
});

// Stagger Animation Helper
function staggerAnimation(elements, options = {}) {
    const defaults = {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
    };

    const config = { ...defaults, ...options };

    gsap.from(elements, config);
}

// Loading Animation
function showLoadingAnimation(container) {
    const loader = document.createElement('div');
    loader.className = 'loading-animation';
    loader.innerHTML = `
        <div class="loader-ring"></div>
        <div class="loader-ring"></div>
        <div class="loader-ring"></div>
    `;
    
    container.appendChild(loader);

    gsap.fromTo('.loader-ring', 
        { scale: 0, opacity: 1 },
        {
            scale: 1.5,
            opacity: 0,
            duration: 1.5,
            stagger: 0.3,
            repeat: -1,
            ease: 'power2.out'
        }
    );

    return loader;
}

// Export functions for use in other files
window.gsapAnimations = {
    smoothScroll,
    textRevealAnimation,
    magneticButton,
    staggerAnimation,
    showLoadingAnimation,
    initParallax
};
