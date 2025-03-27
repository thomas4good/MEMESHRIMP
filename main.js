import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* global TWEEN */  // Declare TWEEN as a global variable since we're using the CDN version

// Three.js setup
let scene, camera, renderer, currentShrimp;
let audio = new Audio();
const loader = new GLTFLoader();

// Particles
let particles;
const particleCount = 1000;

// Orbit parameters
let orbitSpeed = 0.008;  // Increased base speed
let orbitRadius = 5;
let orbitAngle = 0;
let orbitDirection = 1;  // Add direction multiplier

// UI state
let isMuted = false;
let clickCount = 0;
const shrimpHistory = [];

// Rainbow effect for special shrimp
let rainbowHue = 0;

// Shrimp personality types and their properties
const shrimpTypes = [
    {
        name: "Party Shrimp",
        color: "#FF69B4",
        description: "You're the life of the party! Always ready to dance and make new friends. Your sparkly personality lights up any room! 🎉",
        music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        model: "/models/3dpea.com_obj_1_18.glb",
        scale: 2,
        rotationSpeed: 0.02
    },
    {
        name: "Business Shrimp",
        color: "#4169E1",
        description: "Professional and focused, you're always wearing a tiny suit and carrying a briefcase. Time is money, and you're swimming in success! 💼",
        music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        model: "/models/3dpea.com_obj_1_18.glb",
        scale: 1.8,
        rotationSpeed: 0.01
    },
    {
        name: "Ninja Shrimp",
        color: "#2F4F4F",
        description: "Stealthy and mysterious, you're always sneaking around in the shadows. Your moves are swift and silent! 🥷",
        music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        model: "/models/3dpea.com_obj_1_18.glb",
        scale: 1.5,
        rotationSpeed: 0.03
    },
    {
        name: "Surfer Shrimp",
        color: "#FFA500",
        description: "Totally tubular! You're always catching waves and living the beach life. Cowabunga, dude! 🏄‍♂️",
        music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        model: "/models/3dpea.com_obj_1_18.glb",
        scale: 2.2,
        rotationSpeed: 0.015
    },
    {
        name: "Chef Shrimp",
        color: "#FF4500",
        description: "Master of the underwater kitchen! Your culinary creations are legendary, even if they're mostly seaweed. Bon appétit! 👨‍🍳",
        music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        model: "/models/3dpea.com_obj_1_18.glb",
        scale: 1.7,
        rotationSpeed: 0.012
    },
    {
        name: "Scientist Shrimp",
        color: "#9370DB",
        description: "Always experimenting and discovering! Your brilliant mind is constantly bubbling with new ideas. For science! 🔬",
        music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        model: "/models/3dpea.com_obj_1_18.glb",
        scale: 1.6,
        rotationSpeed: 0.008
    },
    {
        name: "Artist Shrimp",
        color: "#FF1493",
        description: "Creative and expressive, you paint the ocean with your colorful personality! Your masterpiece is always in progress. 🎨",
        music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        model: "/models/3dpea.com_obj_1_18.glb",
        scale: 1.9,
        rotationSpeed: 0.014
    },
    {
        name: "Yoga Shrimp",
        color: "#98FB98",
        description: "Zen and peaceful, you're always finding your inner balance. Your shrimp pose is perfect! 🧘‍♂️",
        music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        model: "/models/3dpea.com_obj_1_18.glb",
        scale: 1.4,
        rotationSpeed: 0.006
    },
    {
        name: "Rock Star Shrimp",
        color: "#FF00FF",
        description: "Living life in the fast lane! Your electric personality and killer moves make you the star of the ocean! 🎸",
        music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        model: "/models/3dpea.com_obj_1_18.glb",
        scale: 2.1,
        rotationSpeed: 0.025
    },
    {
        name: "Detective Shrimp",
        color: "#8B4513",
        description: "Always on the case! Your keen eye for detail helps you solve the ocean's mysteries. Elementary, my dear shrimp! 🔍",
        music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        model: "/models/3dpea.com_obj_1_18.glb",
        scale: 1.6,
        rotationSpeed: 0.009
    },
    {
        name: "Astronaut Shrimp",
        color: "#00CED1",
        description: "Reaching for the stars! You're always dreaming of exploring the great beyond. To infinity and beyond! 🚀",
        music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        model: "/models/3dpea.com_obj_1_18.glb",
        scale: 1.8,
        rotationSpeed: 0.016
    },
    {
        name: "Pirate Shrimp",
        color: "#8B0000",
        description: "Arr matey! You're the most feared shrimp in the seven seas! Your treasure map leads to endless adventures! 🏴‍☠️",
        music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        model: "/models/3dpea.com_obj_1_18.glb",
        scale: 2.0,
        rotationSpeed: 0.018
    }
];

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        // Position in a sphere around the center
        const radius = 10 + Math.random() * 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
        
        // Random velocities for movement
        velocities[i] = (Math.random() - 0.5) * 0.02;
        velocities[i + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i + 2] = (Math.random() - 0.5) * 0.02;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.1,
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
        map: createParticleTexture(),
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function updateParticles() {
    if (!particles) return;
    
    const positions = particles.geometry.attributes.position.array;
    const velocities = particles.geometry.attributes.velocity.array;
    
    for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];
        
        // Wrap particles around if they go too far
        const radius = Math.sqrt(
            positions[i] ** 2 + 
            positions[i + 1] ** 2 + 
            positions[i + 2] ** 2
        );
        
        if (radius > 15) {
            const scale = 5 / radius;
            positions[i] *= scale;
            positions[i + 1] *= scale;
            positions[i + 2] *= scale;
        }
    }
    
    particles.geometry.attributes.position.needsUpdate = true;
}

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Initial camera position
    camera.position.set(0, 0, orbitRadius);
    camera.lookAt(0, 0, 0);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(-5, -5, -5);
    scene.add(pointLight);

    // Create particles
    createParticles();

    // Setup event listeners
    setupEventListeners();

    // Start animation loop
    animate();
}

function setupEventListeners() {
    // Sound toggle
    const soundButton = document.getElementById('toggle-sound');
    soundButton.addEventListener('click', () => {
        isMuted = !isMuted;
        audio.muted = isMuted;
        soundButton.textContent = isMuted ? '🔈' : '🔊';
    });

    // Discover button
    document.getElementById('discover-button').addEventListener('click', () => {
        clickCount++;
        if (clickCount === 10) {
            addRainbowShrimp();
            // Add celebration effect
            createCelebrationParticles();
            alert('🌈 Congratulations! You discovered the Legendary Rainbow Shrimp! 🌈');
        }
        const randomShrimp = shrimpTypes[Math.floor(Math.random() * shrimpTypes.length)];
        updateShrimp(randomShrimp);
    });

    // Try again button
    document.getElementById('try-again').addEventListener('click', () => {
        const randomShrimp = shrimpTypes[Math.floor(Math.random() * shrimpTypes.length)];
        updateShrimp(randomShrimp);
    });

    // Share button
    document.getElementById('share-shrimp').addEventListener('click', async () => {
        const currentShrimpType = shrimpHistory.length > 0 ? shrimpHistory[shrimpHistory.length - 1] : null;
        const url = window.location.href;
        const shareText = currentShrimpType 
            ? `🦐 I'm a ${currentShrimpType.name} Shrimp! 🦐\n${currentShrimpType.description}\n\nFind your shrimp personality at: ${url}`
            : `🦐 Discover your shrimp personality at: ${url}`;
        
        try {
            // Try native sharing first (works on mobile and some desktop browsers)
            await navigator.share({
                title: 'Shrimp Personality Display',
                text: shareText,
                url: url
            });
        } catch (err) {
            // Fallback: Copy to clipboard with formatting for Discord/other platforms
            const formattedText = currentShrimpType 
                ? `**🦐 I'm a ${currentShrimpType.name} Shrimp! 🦐**\n${currentShrimpType.description}\n\nFind your shrimp personality at: ${url}`
                : `**🦐 Discover your shrimp personality!**\n${url}`;
            
            try {
                await navigator.clipboard.writeText(formattedText);
                alert('Share text copied to clipboard! You can now paste it anywhere.');
            } catch (clipboardErr) {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = formattedText;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('Share text copied to clipboard! You can now paste it anywhere.');
            }
        }
    });

    // Previous shrimp button
    document.getElementById('previous-shrimp').addEventListener('click', () => {
        if (shrimpHistory.length > 1) {
            shrimpHistory.pop(); // Remove current
            const previousShrimp = shrimpHistory.pop(); // Get previous
            updateShrimp(previousShrimp);
        }
    });

    // Touch controls
    let touchStartX = 0;
    let touchStartY = 0;

    renderer.domElement.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].pageX;
        touchStartY = e.touches[0].pageY;
    });

    renderer.domElement.addEventListener('touchmove', (e) => {
        if (!currentShrimp) return;
        
        const deltaX = e.touches[0].pageX - touchStartX;
        const deltaY = e.touches[0].pageY - touchStartY;
        
        orbitAngle += deltaX * 0.01;
        touchStartX = e.touches[0].pageX;
        touchStartY = e.touches[0].pageY;
    });

    // Throttled resize handler
    window.addEventListener('resize', throttle(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, 100));
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

function updateShrimp(shrimpType) {
    document.getElementById('discover-button').disabled = true;
    document.getElementById('result').classList.add('hidden');

    // Add to history
    shrimpHistory.push(shrimpType);
    document.getElementById('previous-shrimp').classList.toggle('hidden', shrimpHistory.length <= 1);

    // Update background color with transition
    const currentColor = new THREE.Color(document.body.style.backgroundColor || '#f0f0f0');
    const targetColor = new THREE.Color(shrimpType.color);
    new TWEEN.Tween(currentColor)
        .to(targetColor, 1000)
        .onUpdate(() => {
            document.body.style.backgroundColor = `#${currentColor.getHexString()}`;
        })
        .start();

    // Set camera orbit parameters with random direction and speed variation
    orbitDirection = Math.random() < 0.5 ? -1 : 1;  // Randomly choose direction
    orbitSpeed = (0.008 + Math.random() * 0.004) * orbitDirection;  // Speed between 0.008 and 0.012, with direction
    orbitAngle = Math.random() * Math.PI * 2; // Random starting angle
    orbitRadius = 5; // Consistent distance

    // Load new 3D model with random initial rotation
    loadShrimpModel(shrimpType.model, shrimpType.color, shrimpType.scale);

    // Update UI
    document.getElementById('shrimp-type').textContent = shrimpType.name;
    document.getElementById('description').textContent = shrimpType.description;
    document.getElementById('result').classList.remove('hidden');

    // Play music
    if (!isMuted) {
        audio.src = shrimpType.music;
        audio.play();
    }
}

function loadShrimpModel(modelPath, color, scale = 2) {
    loader.load(
        modelPath,
        (gltf) => {
            if (currentShrimp) {
                scene.remove(currentShrimp);
            }

            const model = gltf.scene;

            // Apply color to the model
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshPhongMaterial({
                        color: color,
                        shininess: 100,
                        specular: 0xffffff
                    });
                }
            });

            // Create a container for the shrimp
            const container = new THREE.Group();
            scene.add(container);

            // First, center the model's geometry
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // Calculate scale
            const maxDim = Math.max(size.x, size.y, size.z);
            const finalScale = scale / maxDim;

            // Apply scale to the model
            model.scale.setScalar(finalScale);

            // Create a pivot group to handle rotation
            const pivot = new THREE.Group();
            
            // Add model to pivot, offset by negative center to center the geometry
            model.position.copy(center).multiplyScalar(-1 * finalScale);
            pivot.add(model);

            // Apply random rotation to the pivot
            pivot.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );

            // Add pivot to container
            container.add(pivot);
            
            // Store animation parameters
            container.userData = {
                bobSpeed: 0.02,
                bobHeight: 0.1,
                bobOffset: Math.random() * Math.PI * 2,
                originalY: 0
            };
            
            currentShrimp = container;

            // Update UI
            document.getElementById('discover-button').disabled = false;
            document.getElementById('discover-button').textContent = 'Try Another Shrimp!';
        },
        (xhr) => {
            console.log(`Loading progress: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
        },
        (error) => {
            console.error('Error loading model:', error);
            document.getElementById('discover-button').disabled = false;
            alert('Error loading shrimp model. Please try again.');
        }
    );
}

function animate() {
    requestAnimationFrame(animate);

    if (currentShrimp) {
        // Update camera position for orbit
        orbitAngle += orbitSpeed;
        
        // Calculate camera position for horizontal orbit
        camera.position.x = orbitRadius * Math.cos(orbitAngle);
        camera.position.z = orbitRadius * Math.sin(orbitAngle);
        camera.position.y = 1; // Slightly above the shrimp
        
        // Always look at the center where the shrimp is
        camera.lookAt(0, 0, 0);

        // Apply bobbing motion
        const bobOffset = currentShrimp.userData.bobOffset;
        const bobHeight = currentShrimp.userData.bobHeight;
        const bobSpeed = currentShrimp.userData.bobSpeed;
        const originalY = currentShrimp.userData.originalY;
        
        // Calculate new Y position based on original position plus bobbing
        currentShrimp.position.y = originalY + Math.sin(Date.now() * bobSpeed + bobOffset) * bobHeight;

        // Rainbow effect for special shrimp
        const currentShrimpType = shrimpHistory[shrimpHistory.length - 1];
        if (currentShrimpType && currentShrimpType.isRainbow) {
            rainbowHue = (rainbowHue + 0.01) % 1;
            const color = new THREE.Color().setHSL(rainbowHue, 1, 0.5);
            currentShrimp.traverse((child) => {
                if (child.isMesh) {
                    child.material.color = color;
                    child.material.emissive = color;
                    child.material.emissiveIntensity = 0.2 + Math.sin(Date.now() * 0.005) * 0.1;
                }
            });
        }
    }

    // Update particles
    updateParticles();

    TWEEN.update();
    renderer.render(scene, camera);
}

// Update the Rainbow Shrimp to be more exciting
function addRainbowShrimp() {
    shrimpTypes.push({
        name: "Rainbow Shrimp",
        color: "#FF0000",
        description: "✨ LEGENDARY SHRIMP UNLOCKED! ✨\nYou're the mythical Rainbow Shrimp! Your magical presence brings joy and wonder to all the seas! 🌈",
        music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        model: "/models/3dpea.com_obj_1_18.glb",
        scale: 2.5,
        rotationSpeed: 0.025,
        isRainbow: true
    });
}

function createCelebrationParticles() {
    const celebrationCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(celebrationCount * 3);
    const colors = new Float32Array(celebrationCount * 3);
    const velocities = new Float32Array(celebrationCount * 3);
    
    for (let i = 0; i < celebrationCount * 3; i += 3) {
        // Start from center
        positions[i] = 0;
        positions[i + 1] = 0;
        positions[i + 2] = 0;
        
        // Random velocities in all directions
        const speed = 0.1;
        velocities[i] = (Math.random() - 0.5) * speed;
        velocities[i + 1] = Math.random() * speed;
        velocities[i + 2] = (Math.random() - 0.5) * speed;
        
        // Rainbow colors
        const hue = Math.random();
        const color = new THREE.Color().setHSL(hue, 1, 0.5);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.15,
        transparent: true,
        opacity: 0.8,
        vertexColors: true,
        blending: THREE.AdditiveBlending
    });
    
    const celebrationParticles = new THREE.Points(geometry, material);
    scene.add(celebrationParticles);
    
    // Remove after animation
    setTimeout(() => {
        scene.remove(celebrationParticles);
    }, 5000);
}

// Initialize the scene
init(); 