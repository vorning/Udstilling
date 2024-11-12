let planetFormationData = {};

// Hent Planetdannelse data fra JSON
window.onload = () => {
  fetch("json/rumfem.json")
    .then((response) => response.json())
    .then((data) => {
      planetFormationData = data;
      initScene();
    })
    .catch((error) => console.error("Fejl ved indlæsning af data:", error));
};

// Globale variabler for renderer, camera, composer osv.
let renderer,
  composer,
  camera,
  scene,
  planets = [],
  sunMesh,
  stars;

// Initialiser scenen
function initScene() {
  if (!planetFormationData) {
    console.error(
      "Fejl: Data for Planetdannelse scenen blev ikke hentet korrekt."
    );
    return;
  }

  // Opret scenen
  scene = new THREE.Scene();
  scene.background = new THREE.Color(
    planetFormationData.background.color || 0x000010
  );

  // Opret kameraet
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(0, 0, 500);

  // Opret renderer med antialiasing og høj pixel ratio for bedre opløsning
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  document.getElementById("container").appendChild(renderer.domElement);

  // Effektkomponist til post-processing
  composer = new THREE.EffectComposer(renderer);
  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);
  const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    6.0,
    0.6,
    0.5
  );
  composer.addPass(bloomPass);

  // Lysopsætning
  const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight.position.set(200, 200, 200);
  scene.add(directionalLight);

  // Opret solens shader-materiale
  const textureLoader = new THREE.TextureLoader();
  const sunTexture = textureLoader.load(planetFormationData.sun.texture);
  const sunMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      sunTexture: { value: sunTexture },
      color1: { value: new THREE.Color(planetFormationData.sun.colors.color1) },
      color2: { value: new THREE.Color(planetFormationData.sun.colors.color2) },
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
    `,
  });

  sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(planetFormationData.sun.radius, 128, 128),
    sunMaterial
  );
  sunMesh.position.set(...planetFormationData.sun.position);
  scene.add(sunMesh);

  // Opret planeter fra JSON-data
  planetFormationData.planets.forEach((planetData) => {
    const planetMaterial = new THREE.MeshStandardMaterial({
      map: textureLoader.load(planetData.texture),
      roughness: planetData.roughness,
      metalness: planetData.metalness,
    });
    const planetMesh = new THREE.Mesh(
      new THREE.SphereGeometry(planetData.radius, 128, 128),
      planetMaterial
    );
    planetMesh.position.set(...planetData.position);
    scene.add(planetMesh);
    planets.push({
      name: planetData.name,
      mesh: planetMesh,
      title: planetData.title,
      content: planetData.content,
    });
  });

  // Opret stjerner
  createStars();

  // Start animationen
  animate();
}

// Funktion til at oprette stjerner og blinkeeffekt
function createStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5,
    transparent: true,
  });
  const starVertices = [];
  for (let i = 0; i < planetFormationData.stars.count; i++) {
    starVertices.push(
      (Math.random() - 0.5) * 2000,
      (Math.random() - 0.5) * 2000,
      (Math.random() - 0.5) * 2000
    );
  }
  starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starVertices, 3)
  );
  stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}

// Animation og tid for shader-effekter
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  sunMesh.material.uniforms.time.value = clock.getElapsedTime();

  // Blinkeeffekt for stjerner - altid mellem 0.5 og 1.0
  const minOpacity = 0.6;
  const maxOpacity = 1.0;
  stars.material.opacity =
    minOpacity +
    (Math.sin(clock.getElapsedTime() * 2) * 0.5 + 0.5) *
      (maxOpacity - minOpacity);

  // Opdater TWEEN.js for at sikre animationerne
  TWEEN.update();

  // Roter solens overflade hurtigere
  sunMesh.rotation.y += 0.003;
  sunMesh.rotation.x += 0.002;

  // Roter planeterne langsomt
  planets.forEach((planet) => {
    planet.mesh.rotation.y += 0.001;
  });

  // Render scenen med bloom-effekt
  composer.render();
}

// Fokusér kameraet på planeten med en glat animation fra startperspektivet
window.focusPlanet = function (planetName) {
  // Hvis planeten er solen, brug sunMesh
  if (planetName.toLowerCase() === "sun") {
    fadeOut(document.getElementById("welcome-message"), 1000);
    fadeOut(document.getElementById("info-box"), 1000);
    fadeOut(document.getElementById("reset-button"), 1000);

    const targetPosition = new THREE.Vector3(
      sunMesh.position.x,
      sunMesh.position.y,
      sunMesh.position.z + 100
    );

    new TWEEN.Tween(camera.position)
      .to(
        { x: targetPosition.x, y: targetPosition.y, z: targetPosition.z },
        4000
      )
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        camera.lookAt(sunMesh.position);
      })
      .onComplete(() => {
        fadeIn(document.getElementById("reset-button"), 1000);
        showInfo(planetFormationData.sun); // Brug planetFormationData til at vise info om solen
      })
      .start();

    return;
  }

  // Hvis det ikke er solen, søg blandt de andre planeter
  const targetPlanet = planets.find(
    (p) => p.name.toLowerCase() === planetName.toLowerCase()
  );
  if (!targetPlanet) {
    console.error("Planet not found:", planetName);
    return;
  }

  fadeOut(document.getElementById("welcome-message"), 1000);
  fadeOut(document.getElementById("info-box"), 1000);
  fadeOut(document.getElementById("reset-button"), 1000);

  const targetPosition = new THREE.Vector3(
    targetPlanet.mesh.position.x,
    targetPlanet.mesh.position.y,
    targetPlanet.mesh.position.z + 100
  );

  new TWEEN.Tween(camera.position)
    .to({ x: targetPosition.x, y: targetPosition.y, z: targetPosition.z }, 4000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() => {
      camera.lookAt(targetPlanet.mesh.position);
    })
    .onComplete(() => {
      fadeIn(document.getElementById("reset-button"), 1000);

      // Find planetens info fra planetFormationData
      const planetInfo = planetFormationData.planets.find(
        (p) => p.name.toLowerCase() === planetName.toLowerCase()
      );
      showInfo(planetInfo); // Brug planetFormationData til at vise info om planeten
    })
    .start();
};



// Vis informationsboks
function showInfo(planet) {
  const infoBox = document.getElementById("info-box");
  const titleElement = document.getElementById("info-title");
  const contentElement = document.getElementById("info-content");

  titleElement.textContent = planet.title;
  contentElement.textContent = planet.content;

  fadeIn(infoBox, 1000);
}

// Zoom tilbage til startperspektivet med en glat animation
window.resetView = function () {
  new TWEEN.Tween(camera.position)
    .to({ x: 0, y: 0, z: 500 }, 4000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() => {
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    })
    .onComplete(() => {
      fadeIn(document.getElementById("welcome-message"), 1000);
      fadeOut(document.getElementById("info-box"), 1000);
      fadeOut(document.getElementById("reset-button"), 1000);
    })
    .start();
};

// Funktioner til at fade elementer ind og ud
function fadeOut(element, duration) {
  new TWEEN.Tween({ opacity: 1.0 })
    .to({ opacity: 0.0 }, duration)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate((obj) => {
      element.style.opacity = obj.opacity;
    })
    .onComplete(() => {
      element.style.display = "none";
    })
    .start();
}

function fadeIn(element, duration) {
  element.style.display = "block";
  new TWEEN.Tween({ opacity: 0.0 })
    .to({ opacity: 1.0 }, duration)
    .easing(TWEEN.Easing.Quadratic.In)
    .onUpdate((obj) => {
      element.style.opacity = obj.opacity;
    })
    .start();
}

// Tilpasning til vinduesstørrelse
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
