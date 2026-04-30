// 3D Neural Network Visualization
function initializeNeuralNetwork() {
    // This creates a visual representation of a neural network
    // that can be displayed when analyzing text
    
    const createNeuralNetworkScene = () => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.z = 15;

        // Network structure
        const layers = [8, 12, 16, 12, 4]; // Nodes per layer
        const layerSpacing = 5;
        const nodeSize = 0.3;
        const nodes = [];
        const connections = [];

        // Create nodes
        layers.forEach((nodeCount, layerIndex) => {
            const layerNodes = [];
            const layerX = (layerIndex - layers.length / 2) * layerSpacing;

            for (let i = 0; i < nodeCount; i++) {
                const nodeY = (i - nodeCount / 2) * 1.2;
                
                // Node geometry
                const geometry = new THREE.SphereGeometry(nodeSize, 16, 16);
                const material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color().setHSL(layerIndex / layers.length, 0.8, 0.6),
                    emissive: new THREE.Color().setHSL(layerIndex / layers.length, 0.5, 0.3),
                    shininess: 100,
                    transparent: true,
                    opacity: 0.9
                });
                
                const node = new THREE.Mesh(geometry, material);
                node.position.set(layerX, nodeY, 0);
                
                // Add glow effect
                const glowGeometry = new THREE.SphereGeometry(nodeSize * 1.5, 16, 16);
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: new THREE.Color().setHSL(layerIndex / layers.length, 1, 0.5),
                    transparent: true,
                    opacity: 0.2,
                    blending: THREE.AdditiveBlending
                });
                const glow = new THREE.Mesh(glowGeometry, glowMaterial);
                node.add(glow);

                scene.add(node);
                layerNodes.push(node);

                // Create connections to previous layer
                if (layerIndex > 0) {
                    nodes[layerIndex - 1].forEach(prevNode => {
                        const points = [
                            prevNode.position,
                            node.position
                        ];
                        
                        const geometry = new THREE.BufferGeometry().setFromPoints(points);
                        const material = new THREE.LineBasicMaterial({
                            color: 0x6366f1,
                            transparent: true,
                            opacity: 0.15,
                            blending: THREE.AdditiveBlending
                        });
                        
                        const line = new THREE.Line(geometry, material);
                        scene.add(line);
                        connections.push({ line, from: prevNode, to: node });
                    });
                }
            }
            nodes.push(layerNodes);
        });

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x6366f1, 1, 50);
        pointLight1.position.set(10, 10, 10);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xec4899, 1, 50);
        pointLight2.position.set(-10, -10, 10);
        scene.add(pointLight2);

        return { scene, camera, nodes, connections };
    };

    // Animation function
    const animateNeuralNetwork = (network, renderer, container) => {
        let time = 0;
        let animationId;

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            time += 0.01;

            // Rotate camera
            network.camera.position.x = Math.sin(time * 0.3) * 15;
            network.camera.position.z = Math.cos(time * 0.3) * 15;
            network.camera.lookAt(0, 0, 0);

            // Pulse nodes
            network.nodes.forEach((layer, layerIndex) => {
                layer.forEach((node, nodeIndex) => {
                    const pulse = Math.sin(time * 2 + layerIndex + nodeIndex * 0.5) * 0.1 + 1;
                    node.scale.setScalar(pulse);
                    
                    // Update glow
                    if (node.children[0]) {
                        node.children[0].scale.setScalar(pulse * 1.2);
                    }
                });
            });

            // Animate connections
            network.connections.forEach((conn, index) => {
                const phase = (time * 2 + index * 0.1) % (Math.PI * 2);
                const opacity = Math.sin(phase) * 0.1 + 0.15;
                conn.line.material.opacity = Math.max(0.05, opacity);
            });

            renderer.render(network.scene, network.camera);
        };

        animate();

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
        };
    };

    // Create visualization container (can be called when needed)
    window.createNeuralNetworkVisualization = (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const width = container.clientWidth;
        const height = container.clientHeight || 400;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const network = createNeuralNetworkScene();
        const stopAnimation = animateNeuralNetwork(network, renderer, container);

        // Handle resize
        const handleResize = () => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight || 400;
            network.camera.aspect = newWidth / newHeight;
            network.camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener('resize', handleResize);

        return {
            destroy: () => {
                stopAnimation();
                window.removeEventListener('resize', handleResize);
                renderer.dispose();
                container.removeChild(renderer.domElement);
            }
        };
    };

    // Signal data flow through network (visual feedback during analysis)
    window.signalNeuralNetwork = (network, layerIndex = 0) => {
        if (!network || !network.nodes) return;

        const layer = network.nodes[layerIndex];
        if (!layer) return;

        layer.forEach((node, index) => {
            setTimeout(() => {
                gsap.to(node.scale, {
                    x: 1.5,
                    y: 1.5,
                    z: 1.5,
                    duration: 0.2,
                    yoyo: true,
                    repeat: 1,
                    ease: 'power2.inOut'
                });

                gsap.to(node.material, {
                    emissiveIntensity: 2,
                    duration: 0.2,
                    yoyo: true,
                    repeat: 1,
                    ease: 'power2.inOut'
                });
            }, index * 50);
        });

        // Recursively signal next layer
        if (layerIndex < network.nodes.length - 1) {
            setTimeout(() => {
                window.signalNeuralNetwork(network, layerIndex + 1);
            }, layer.length * 50);
        }
    };
}