let scene, camera, renderer, galaxies = [];
let backgroundStars;
let galaxyFormationSpeed = 0.001; 
let time = 0; 
let running = true; 
let animationId; // Holder styr på det aktuelle requestAnimationFrame-id
const galaxySlider = document.getElementById('galaxy-speed-slider');
const resetButton = document.getElementById('reset-button');
const speedValue = document.getElementById('speed-value'); // Hastighedsværdi


// Vertex Shader for position og skalering
const vertexShader = `
  attribute float size;
  varying vec3 vColor;

  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z); 
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment Shader for farve og glødeffekt
const fragmentShader = `
  varying vec3 vColor;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5, 0.5));
    float alpha = smoothstep(0.5, 0.0, dist);
    gl_FragColor = vec4(vColor, alpha);
  }
`;

// Opret scenen, kameraet og renderer
function init() {
    // Initialiser scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 80000);
    camera.position.z = 3000;

    // Initialiser renderer
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('galaxyCanvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    console.log("Initializing scene elements...");
    addBackgroundStars();

    // Start med at tilføje galakser
    for (let i = 0; i < 10; i++) {
        addNewGalaxy();
    }

    animate(); // Start animationen med det samme
}

// Slider kontrollerer hastigheden af galaksernes udvikling
galaxySlider.addEventListener('input', (event) => {
    let sliderValue = parseFloat(event.target.value);
    time = sliderValue / 100;
    speedValue.innerText = sliderValue; // Opdaterer den viste hastighedsværdi
    console.log("Slider value:", time);

    if (!running) {
        running = true; 
        animate(); // Start animationen igen, hvis den var stoppet
    }
});

// Funktion til at tilføje en konstant baggrund af stjerner
function addBackgroundStars() {
    const particleCount = 100000; // Antallet af stjerner i baggrunden
    const positions = [];
    const colors = [];
    const sizes = [];

    for (let i = 0; i < particleCount; i++) {
        positions.push(
            (Math.random() - 0.5) * 50000,
            (Math.random() - 0.5) * 50000,
            (Math.random() - 0.5) * 50000
        );

        const color = new THREE.Color(
            0.7 + Math.random() * 0.3,
            0.7 + Math.random() * 0.3, 
            1.0 
        );
        colors.push(color.r, color.g, color.b);
        sizes.push(Math.random() * 6 + 2); 
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        opacity: 0.8
    });

    backgroundStars = new THREE.Points(geometry, material);
    console.log("Background stars created:", backgroundStars);
    scene.add(backgroundStars);
}

// Funktion til at tilføje en ny galakse med spiralformede partikler
function addNewGalaxy() {
    const particleGeometry = new THREE.BufferGeometry();
    const initialPositions = [];
    const targetPositions = [];
    const colors = [];
    const sizes = [];

    const count = 20000; 
    const arms = 5; 
    const spread = 250; 

    const galaxyPosition = {
        x: (Math.random() - 0.5) * 8000,
        y: (Math.random() - 0.5) * 8000,
        z: (Math.random() - 0.5) * 4000
    };

    const baseColor = new THREE.Color(
        0.8 + Math.random() * 0.2,
        0.6 + Math.random() * 0.4,
        0.7 + Math.random() * 0.3
    );

    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 20000;
        const y = (Math.random() - 0.5) * 20000;
        const z = (Math.random() - 0.5) * 20000;

        initialPositions.push(x, y, z);

        const armIndex = i % arms;
        const angle = (i / count) * Math.PI * 10 + armIndex * (Math.PI * 2 / arms);
        const radius = 2.5 * Math.sqrt(i) + (Math.random() - 0.5) * spread;

        const tx = Math.cos(angle) * radius + galaxyPosition.x;
        const ty = Math.sin(angle) * radius + galaxyPosition.y;
        const tz = (Math.random() - 0.5) * 100 + galaxyPosition.z;

        targetPositions.push(tx, ty, tz);

        const color = baseColor.clone();
        if (i < count * 0.1) {
            color.setHSL(0.1 + Math.random() * 0.05, 1.0, 0.6 + Math.random() * 0.1);
        } else {
            color.r += (Math.random() - 0.5) * 0.1;
            color.g += (Math.random() - 0.5) * 0.1;
            color.b += (Math.random() - 0.5) * 0.1;
        }
        colors.push(color.r, color.g, color.b);
        sizes.push(Math.random() * 8 + 3);
    }

    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(initialPositions, 3));
    particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthTest: false,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particleSystem.initialPositions = initialPositions;
    particleSystem.targetPositions = targetPositions;
    particleSystem.rotationSpeed = Math.random() * 0.051 + 0.0003; 
    particleSystem.progress = Math.random() * 0.5; 
    particleSystem.delay = Math.random() * 0.5; 
    galaxies.push(particleSystem);
    scene.add(particleSystem);
    console.log("Galaxy added:", particleSystem);
}

// Animation af galakserne og baggrundsstjernerne
function animate() {
    if (!running) return; 

    animationId = requestAnimationFrame(animate);

    if (backgroundStars) {
        backgroundStars.rotation.y += 0.00005 * (1 + time * 5); // Skaler rotationshastigheden med `time`
        backgroundStars.rotation.x += 0.00002 * (1 + time * 5); // Skaler rotationshastigheden med `time`
    }

    galaxies.forEach((galaxy) => {
        const particlePositions = galaxy.geometry.attributes.position.array;
        const initialPositions = galaxy.initialPositions;
        const targetPositions = galaxy.targetPositions;

        if (time > galaxy.delay) {
            let actualTime = time - galaxy.delay; 
            galaxy.progress += galaxyFormationSpeed * (actualTime + Math.random() * 0.05);
            if (galaxy.progress > 1) galaxy.progress = 1;

            for (let i = 0; i < particlePositions.length; i += 3) {
                particlePositions[i] = initialPositions[i] * (1 - galaxy.progress) + targetPositions[i] * galaxy.progress;
                particlePositions[i + 1] = initialPositions[i + 1] * (1 - galaxy.progress) + targetPositions[i + 1] * galaxy.progress;
                particlePositions[i + 2] = initialPositions[i + 2] * (1 - galaxy.progress) + targetPositions[i + 2] * galaxy.progress;
            }
        }

        galaxy.geometry.attributes.position.needsUpdate = true;
        galaxy.rotation.z += galaxy.rotationSpeed * (time * 0.5); // Skaler rotationshastigheden med `time`
    });

    renderer.render(scene, camera);
}

// Reset-knap nulstiller udviklingen af galakserne
resetButton.addEventListener('click', () => {
    running = false; // Stop animationen

    // Stop den igangværende animation
    cancelAnimationFrame(animationId);

    // Fjern alle eksisterende galakser fra scenen
    galaxies.forEach(galaxy => scene.remove(galaxy));
    galaxies = []; // Ryd arrayet med galakser

    // Nulstil tiden og slideren
    time = 0;
    galaxySlider.value = 1;
    speedValue.innerText = "1"; // Nulstil hastighedsvisningen

    // Tilføj nye galakser
    for (let i = 0; i < 10; i++) {
        addNewGalaxy();
    }

    running = true;
    animate(); // Genstart animationen efter nulstilling
    console.log("Galaxies reset to initial state.");
});

function renderScene() {
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

init();
