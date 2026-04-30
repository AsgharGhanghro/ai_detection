// Particle System for Background Animation
function initializeParticles() {
    const canvas = document.getElementById('bg-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 50;

    // Particle System
    const particleCount = 2000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = [];

    // Color palette
    const colorPalette = [
        new THREE.Color(0x6366f1), // Primary
        new THREE.Color(0x8b5cf6), // Secondary
        new THREE.Color(0xec4899), // Accent
    ];

    for (let i = 0; i < particleCount; i++) {
        // Positions
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

        // Colors
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        // Sizes
        sizes[i] = Math.random() * 3 + 1;

        // Velocities
        velocities.push({
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
        });
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Particle Material
    const particleMaterial = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Connection Lines
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Mouse interaction
    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    document.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Animation
    function animate() {
        requestAnimationFrame(animate);

        // Smooth camera follow
        target.x += (mouse.x * 5 - target.x) * 0.05;
        target.y += (mouse.y * 5 - target.y) * 0.05;
        camera.position.x = target.x;
        camera.position.y = target.y;
        camera.lookAt(scene.position);

        // Update particles
        const positions = particles.attributes.position.array;
        const linePositions = [];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            // Update position with velocity
            positions[i3] += velocities[i].x;
            positions[i3 + 1] += velocities[i].y;
            positions[i3 + 2] += velocities[i].z;

            // Bounce back if out of bounds
            if (Math.abs(positions[i3]) > 100) velocities[i].x *= -1;
            if (Math.abs(positions[i3 + 1]) > 100) velocities[i].y *= -1;
            if (Math.abs(positions[i3 + 2]) > 50) velocities[i].z *= -1;

            // Create connections
            for (let j = i + 1; j < Math.min(i + 10, particleCount); j++) {
                const j3 = j * 3;
                const dx = positions[i3] - positions[j3];
                const dy = positions[i3 + 1] - positions[j3 + 1];
                const dz = positions[i3 + 2] - positions[j3 + 2];
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distance < 15) {
                    linePositions.push(
                        positions[i3], positions[i3 + 1], positions[i3 + 2],
                        positions[j3], positions[j3 + 1], positions[j3 + 2]
                    );
                }
            }
        }

        particles.attributes.position.needsUpdate = true;
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

        // Rotate particle system
        particleSystem.rotation.y += 0.0005;
        particleSystem.rotation.x = Math.sin(Date.now() * 0.0001) * 0.1;

        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Return controls for external manipulation if needed
    return {
        scene,
        camera,
        renderer,
        particleSystem
    };
}