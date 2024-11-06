// Opret scenen
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000010);

// Opret kameraet
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 0, 500); // Start med at kameraet er længere væk

// Opret renderer med antialiasing og høj pixel ratio for bedre opløsning
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.getElementById('container').appendChild(renderer.domElement);

// Effektkomponist til post-processing
const composer = new THREE.EffectComposer(renderer);
const renderPass = new THREE.RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 6.0, 0.6, 0.5);
composer.addPass(bloomPass);

// Lysopsætning
const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(200, 200, 200);
scene.add(directionalLight);

// Indlæs solens tekstur og shader-materiale
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('assets/vids/8k_sun.jpg');
const sunMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        sunTexture: { value: sunTexture },
        color1: { value: new THREE.Color(0xff4500) },
        color2: { value: new THREE.Color(0xffd700) }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform sampler2D sunTexture;
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;

        float noise(vec2 p) {
            return sin(p.x * 10.0 + time * 0.5) * sin(p.y * 10.0 + time * 0.7);
        }

        float fbm(vec2 p) {
            float value = 0.0;
            float scale = 0.5;
            for (int i = 0; i < 5; i++) {
                value += noise(p) * scale;
                p *= 2.0;
                scale *= 0.5;
            }
            return value;
        }

        void main() {
            vec2 uv = vUv;
            vec2 movement = uv;
            movement.x += time * 0.03;
            movement.y += fbm(uv + time * 0.05);

            float n = fbm(movement * 3.0);
            vec3 color = mix(color1, color2, n);
            vec4 tex = texture2D(sunTexture, uv);
            vec3 finalColor = mix(color, tex.rgb, 0.7);
            float pulse = 0.7 + 0.3 * sin(time * 1.5 + n * 10.0);
            finalColor *= (0.9 + pulse * 0.1);

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
});

const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(50, 128, 128), sunMaterial);
sunMesh.position.set(200, 0, -500);
scene.add(sunMesh);

// Opret Merkur
const mercuryMaterial = new THREE.MeshStandardMaterial({
    map: textureLoader.load('assets/vids/mercur.png'),
    roughness: 1.0,
    metalness: 0.0
});
const mercuryMesh = new THREE.Mesh(new THREE.SphereGeometry(20, 128, 128), mercuryMaterial);
mercuryMesh.position.set(-400, 0, -500);
scene.add(mercuryMesh);

// Opret Venus
const venusMaterial = new THREE.MeshStandardMaterial({
    map: textureLoader.load('assets/vids/venus.jpg'),
    roughness: 1.0,
    metalness: 0.0
});
const venusMesh = new THREE.Mesh(new THREE.SphereGeometry(25, 128, 128), venusMaterial);
venusMesh.position.set(0, 150, -600);
scene.add(venusMesh);

// Opret Jorden
const earthMaterial = new THREE.MeshStandardMaterial({
    map: textureLoader.load('assets/vids/earth8k.jpg'),
    roughness: 1.0,
    metalness: 0.0
});
const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(30, 128, 128), earthMaterial);
earthMesh.position.set(300, -100, -700);
scene.add(earthMesh);

// Opret Mars
const marsMaterial = new THREE.MeshStandardMaterial({
    map: textureLoader.load('assets/vids/mars.jpg'), // Sørg for at bruge en passende tekstur for Mars
    roughness: 1.0,
    metalness: 0.0
});
const marsMesh = new THREE.Mesh(new THREE.SphereGeometry(28, 128, 128), marsMaterial);
marsMesh.position.set(500, 200, -800);
scene.add(marsMesh);

// Opret Jupiter
const jupiterMaterial = new THREE.MeshStandardMaterial({
    map: textureLoader.load('assets/vids/jupiter.jpg'), // Sørg for at bruge en passende tekstur for Jupiter
    roughness: 1.0,
    metalness: 0.0
});
const jupiterMesh = new THREE.Mesh(new THREE.SphereGeometry(60, 128, 128), jupiterMaterial);
jupiterMesh.position.set(-600, -300, -900);
scene.add(jupiterMesh);

// Opret Saturn
const saturnMaterial = new THREE.MeshStandardMaterial({
    map: textureLoader.load('assets/vids/saturn.jpg'), // Sørg for at bruge en passende tekstur for Saturn
    roughness: 1.0,
    metalness: 0.0
});
const saturnMesh = new THREE.Mesh(new THREE.SphereGeometry(55, 128, 128), saturnMaterial);
saturnMesh.position.set(800, -200, -1000);
scene.add(saturnMesh);

// Opret stjerner og blinkeeffekt
let stars;
function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true });
    const starVertices = [];
    const starCount = 10000;

    for (let i = 0; i < starCount; i++) {
        starVertices.push((Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}
createStars();

// Animation og tid for shader-effekter
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);

    sunMaterial.uniforms.time.value = clock.getElapsedTime();

    // Blinkeeffekt for stjerner - altid mellem 0.5 og 1.0
    const minOpacity = 0.6;
    const maxOpacity = 1.0;
    stars.material.opacity = minOpacity + (Math.sin(clock.getElapsedTime() * 2) * 0.5 + 0.5) * (maxOpacity - minOpacity);

    // Opdater TWEEN.js for at sikre animationerne
    TWEEN.update();

    // Roter solens overflade hurtigere
    sunMesh.rotation.y += 0.003; 
    sunMesh.rotation.x += 0.002;

    // Roter planeterne langsomt
    mercuryMesh.rotation.y += 0.001;
    venusMesh.rotation.y += 0.001;
    earthMesh.rotation.y += 0.001;
    marsMesh.rotation.y += 0.001;
    jupiterMesh.rotation.y += 0.001;
    saturnMesh.rotation.y += 0.001;

    // Render scenen med bloom-effekt
    composer.render();
}

// Informationsdata til planeterne
const planetInfo = {
    sun: {
        title: "Sol",
        content: "Solen er stjernen i centrum af solsystemet. Den er en næsten perfekt kugle af varm plasma, som producerer lys og varme."
    },
    mercury: {
        title: "Merkur",
        content: "Merkur er den mindste planet i solsystemet og den tætteste på solen. Den har en meget tynd atmosfære, hvilket gør den ekstremt varm om dagen og meget kold om natten."
    },
    venus: {
        title: "Venus",
        content: "Venus er den anden planet fra solen. Den er næsten på størrelse med Jorden, men har en meget tyk og giftig atmosfære, der skaber en ekstrem drivhuseffekt."
    },
    earth: {
        title: "Jorden",
        content: "Jorden er den tredje planet fra solen og den eneste kendte planet med liv. Den har en atmosfære rig på ilt og vand i flydende form."
    },
    mars: {
        title: "Mars",
        content: "Mars er den fjerde planet fra solen. Den kaldes ofte 'Den Røde Planet' på grund af dens karakteristiske røde farve, der skyldes jernoxid på dens overflade."
    },
    jupiter: {
        title: "Jupiter",
        content: "Jupiter er den største planet i solsystemet. Det er en gaskæmpe med en masse storme, herunder den berømte store røde plet, som er en vedvarende storm."
    },
    saturn: {
        title: "Saturn",
        content: "Saturn er den sjette planet fra solen og er kendt for sit spektakulære ringsystem lavet af is og klippestykker. Den er også en gaskæmpe."
    }
};

// Funktion til at vise information om en planet
function showInfo(planet) {
    const infoBox = document.getElementById('info-box');
    const titleElement = document.getElementById('info-title');
    const contentElement = document.getElementById('info-content');

    // Opdater informationsboksens indhold
    if (planetInfo[planet]) {
        titleElement.textContent = planetInfo[planet].title;
        contentElement.textContent = planetInfo[planet].content;

        // Fade informationsboksen ind
        fadeIn(infoBox, 1000);
    }
}

// Funktioner til at fade elementer ind og ud
function fadeOut(element, duration) {
    new TWEEN.Tween({ opacity: 1.0 })
        .to({ opacity: 0.0 }, duration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate((obj) => {
            element.style.opacity = obj.opacity;
        })
        .onComplete(() => {
            element.style.display = 'none';
        })
        .start();
}

function fadeIn(element, duration) {
    element.style.display = 'block';
    new TWEEN.Tween({ opacity: 0.0 })
        .to({ opacity: 1.0 }, duration)
        .easing(TWEEN.Easing.Quadratic.In)
        .onUpdate((obj) => {
            element.style.opacity = obj.opacity;
        })
        .start();
}

// Fokusér kameraet på planeten med en glat animation fra startperspektivet
function focusPlanet(planet) {
    const targetMesh = planet === 'sun' ? sunMesh :
                       planet === 'mercury' ? mercuryMesh :
                       planet === 'venus' ? venusMesh :
                       planet === 'earth' ? earthMesh :
                       planet === 'mars' ? marsMesh :
                       planet === 'jupiter' ? jupiterMesh :
                       planet === 'saturn' ? saturnMesh : null;

    if (targetMesh) {
        // Fade velkomstbeskeden, informationsboksen, og reset-knappen ud før zoom-animation
        fadeOut(document.getElementById('welcome-message'), 1000);
        fadeOut(document.getElementById('info-box'), 1000);
        fadeOut(document.getElementById('reset-button'), 1000);

        // Definer målpositionen for kameraet
        const targetPosition = new THREE.Vector3(targetMesh.position.x, targetMesh.position.y, targetMesh.position.z + 100);

        // Start fra den nuværende position og lav en glidende animation mod målet
        new TWEEN.Tween(camera.position)
            .to({ x: targetPosition.x, y: targetPosition.y, z: targetPosition.z }, 4000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                camera.lookAt(targetMesh.position);
            })
            .onComplete(() => {
                fadeIn(document.getElementById('reset-button'), 1000); // Fade reset-knappen ind for at gå tilbage
                showInfo(planet); // Vis informationsboksen
            })
            .start();

        document.getElementById('reset-button').style.display = 'none'; // Skjul reset-knappen under animationen
    }
}

// Zoom tilbage til startperspektivet med en glat animation
function resetView() {
    const initialPosition = new THREE.Vector3(0, 0, 500);

    // Start fra den nuværende position og lav en glidende animation tilbage til start
    new TWEEN.Tween(camera.position)
        .to({ x: initialPosition.x, y: initialPosition.y, z: initialPosition.z }, 4000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            camera.lookAt(new THREE.Vector3(0, 0, 0));
        })
        .onComplete(() => {
            fadeIn(document.getElementById('welcome-message'), 1000); // Fade velkomstbeskeden ind igen
            fadeOut(document.getElementById('info-box'), 1000); // Fade informationsboksen ud
            fadeOut(document.getElementById('reset-button'), 1000); // Fade reset-knappen ud
        })
        .start();
}

// Tilpasning til vinduesstørrelse
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Start animationen
animate();
