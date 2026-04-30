// Advanced Scroll Effects with GSAP ScrollTrigger
function initializeScrollEffects() {
    // Parallax sections
    createParallaxSections();
    
    // Reveal animations
    createRevealAnimations();
    
    // Pin sections
    createPinAnimations();
    
    // Horizontal scroll
    createHorizontalScroll();
    
    // Progress indicator
    createProgressIndicator();
}

// Parallax Sections
function createParallaxSections() {
    gsap.utils.toArray('.hero-section').forEach(section => {
        gsap.to(section.querySelector('.hero-content'), {
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            },
            y: 200,
            opacity: 0.5,
            ease: 'none'
        });
    });

    // Background elements parallax
    gsap.utils.toArray('.parallax-bg').forEach((element, index) => {
        gsap.to(element, {
            scrollTrigger: {
                trigger: element,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            },
            y: index % 2 === 0 ? 100 : -100,
            ease: 'none'
        });
    });
}

// Reveal Animations
function createRevealAnimations() {
    // Fade in from bottom
    gsap.utils.toArray('.reveal-bottom').forEach(element => {
        gsap.from(element, {
            scrollTrigger: {
                trigger: element,
                start: 'top 85%',
                end: 'top 50%',
                scrub: 1,
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 100,
            ease: 'power2.out'
        });
    });

    // Fade in from sides
    gsap.utils.toArray('.reveal-left').forEach(element => {
        gsap.from(element, {
            scrollTrigger: {
                trigger: element,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            x: -100,
            duration: 1,
            ease: 'power3.out'
        });
    });

    gsap.utils.toArray('.reveal-right').forEach(element => {
        gsap.from(element, {
            scrollTrigger: {
                trigger: element,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            x: 100,
            duration: 1,
            ease: 'power3.out'
        });
    });

    // Scale animations
    gsap.utils.toArray('.reveal-scale').forEach(element => {
        gsap.from(element, {
            scrollTrigger: {
                trigger: element,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            scale: 0.8,
            duration: 0.8,
            ease: 'back.out(1.7)'
        });
    });
}

// Pin Animations
function createPinAnimations() {
    // Pin features section while scrolling
    const featuresSection = document.querySelector('.features-section');
    if (featuresSection) {
        ScrollTrigger.create({
            trigger: featuresSection,
            start: 'top top',
            end: '+=1000',
            pin: true,
            pinSpacing: true,
            anticipatePin: 1
        });

        // Animate feature cards while section is pinned
        const featureCards = featuresSection.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: featuresSection,
                    start: 'top top',
                    end: '+=1000',
                    scrub: 1
                },
                opacity: 0,
                y: 100,
                rotation: index % 2 === 0 ? 5 : -5,
                delay: index * 0.2
            });
        });
    }
}

// Horizontal Scroll
function createHorizontalScroll() {
    const horizontalSection = document.querySelector('.horizontal-scroll');
    if (!horizontalSection) return;

    const panels = gsap.utils.toArray('.horizontal-panel');
    
    gsap.to(panels, {
        xPercent: -100 * (panels.length - 1),
        ease: 'none',
        scrollTrigger: {
            trigger: horizontalSection,
            pin: true,
            scrub: 1,
            snap: 1 / (panels.length - 1),
            end: () => '+=' + horizontalSection.offsetWidth
        }
    });
}

// Progress Indicator
function createProgressIndicator() {
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 4px;
        background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
        z-index: 9999;
        transform-origin: left;
        transform: scaleX(0);
    `;
    document.body.appendChild(progressBar);

    // Animate progress bar
    gsap.to('#scroll-progress', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
            start: 'top top',
            end: 'max',
            scrub: 0.3
        }
    });
}

// Image reveal on scroll
function createImageReveal() {
    gsap.utils.toArray('.image-reveal').forEach(container => {
        const image = container.querySelector('img');
        
        gsap.from(container, {
            scrollTrigger: {
                trigger: container,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            clipPath: 'inset(0 100% 0 0)',
            duration: 1.5,
            ease: 'power3.inOut'
        });

        gsap.from(image, {
            scrollTrigger: {
                trigger: container,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            scale: 1.3,
            duration: 1.5,
            ease: 'power3.inOut'
        });
    });
}

// Text split animation
function createTextSplitAnimation() {
    gsap.utils.toArray('.split-text').forEach(element => {
        const text = element.textContent;
        const words = text.split(' ');
        element.textContent = '';

        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.textContent = word + ' ';
            span.style.display = 'inline-block';
            span.style.opacity = '0';
            span.style.transform = 'translateY(20px)';
            element.appendChild(span);
        });

        gsap.to(element.children, {
            scrollTrigger: {
                trigger: element,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.05,
            ease: 'power2.out'
        });
    });
}

// Counter animation on scroll
function createScrollCounter(element, endValue, duration = 2) {
    const counter = { value: 0 };
    
    ScrollTrigger.create({
        trigger: element,
        start: 'top 80%',
        onEnter: () => {
            gsap.to(counter, {
                value: endValue,
                duration: duration,
                ease: 'power1.inOut',
                onUpdate: () => {
                    element.textContent = Math.floor(counter.value).toLocaleString();
                }
            });
        }
    });
}

// Morphing shapes on scroll
function createMorphAnimation() {
    gsap.utils.toArray('.morph-shape').forEach(shape => {
        gsap.to(shape, {
            scrollTrigger: {
                trigger: shape,
                start: 'top center',
                end: 'bottom center',
                scrub: 1
            },
            attr: {
                d: shape.dataset.morphTo
            },
            ease: 'none'
        });
    });
}

// Rotate on scroll
function createRotateAnimation() {
    gsap.utils.toArray('.rotate-scroll').forEach(element => {
        gsap.to(element, {
            scrollTrigger: {
                trigger: element,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            },
            rotation: 360,
            ease: 'none'
        });
    });
}

// Color change on scroll
function createColorTransition() {
    const sections = gsap.utils.toArray('.color-section');
    
    sections.forEach((section, index) => {
        const colors = ['#0f0f1e', '#1a1a2e', '#16213e', '#0f0f1e'];
        
        ScrollTrigger.create({
            trigger: section,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => {
                gsap.to('body', {
                    backgroundColor: colors[index % colors.length],
                    duration: 1,
                    ease: 'power2.inOut'
                });
            }
        });
    });
}

// Smooth scrollbar (custom)
function createSmoothScrollbar() {
    let currentScroll = 0;
    let targetScroll = 0;
    const ease = 0.1;

    function smoothScroll() {
        targetScroll = window.pageYOffset;
        currentScroll += (targetScroll - currentScroll) * ease;
        
        document.body.style.transform = `translateY(-${currentScroll}px)`;
        
        requestAnimationFrame(smoothScroll);
    }

    // Uncomment to enable smooth scrollbar
    // smoothScroll();
}

// Magnetic elements
function createMagneticElements() {
    gsap.utils.toArray('.magnetic').forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(element, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        element.addEventListener('mouseleave', () => {
            gsap.to(element, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
        });
    });
}

// Cursor follower
function createCursorFollower() {
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: rgba(99, 102, 241, 0.5);
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: difference;
        transition: transform 0.2s ease;
    `;
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        requestAnimationFrame(animateCursor);
    }

    animateCursor();

    // Scale on hover
    document.querySelectorAll('a, button, .btn').forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(2)';
        });
        element.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
        });
    });
}

// Initialize all effects
document.addEventListener('DOMContentLoaded', () => {
    createImageReveal();
    createTextSplitAnimation();
    createMagneticElements();
    createRotateAnimation();
    
    // Optional: Enable custom cursor (uncomment if desired)
    // createCursorFollower();
});