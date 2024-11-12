document.addEventListener("DOMContentLoaded", function () {
  // Hent JSON data fra filen
  fetch("/json/rumseks.json")
    .then((response) => response.json())
    .then((data) => {
      generateCircles(data.circles);
    })
    .catch((error) => {
      console.error("Error loading JSON data:", error);
    });

  // Funktion til at generere cirkler baseret på JSON-data
  function generateCircles(circlesData) {
    const circleContainer = document.querySelector(".circle-container");

    circlesData.forEach((circle) => {
      // Opret cirkelelementet
      const circleElement = document.createElement("div");
      circleElement.classList.add("circle", circle.class);
      circleElement.dataset.text = circle.text;

      // Tilføj mouseover og mouseout lyttere for at vise/skjule tekst
      circleElement.addEventListener("mouseover", function () {
        const hoverText = document.getElementById("hover-text");
        hoverText.textContent = circle.text;
        hoverText.style.display = "block";

        // Position hover-teksten i forhold til cirklen
        const circleRect = circleElement.getBoundingClientRect();
        hoverText.style.top = `${circleRect.top + window.scrollY - 200}px`;
        hoverText.style.left = `${
          circleRect.left + window.scrollX + circleRect.width + 20
        }px`;

        // Animer cirklen (zoome ind)
        circleElement.style.transform = "scale(1.2)";
        circleElement.style.transition = "transform 0.3s";
      });

      circleElement.addEventListener("mouseout", function () {
        const hoverText = document.getElementById("hover-text");
        hoverText.style.display = "none";

        // Fjern animationen (zoome ud)
        circleElement.style.transform = "scale(1)";
      });

      // Tilføj cirkelelementet til containeren
      circleContainer.appendChild(circleElement);
    });
  }

  // Canvas baggrundsanimering
  const canvas = document.getElementById("background-canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particlesArray = [];
  const numberOfParticles = 100;

  // Funktion til at skabe stjerner
  function createStars() {
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        alpha: Math.random(),
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
      });
    }
  }

  // Funktion til at opdatere stjernerne
  function updateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach((star) => {
      star.x += star.dx;
      star.y += star.dy;

      if (star.x < 0 || star.x > canvas.width) star.dx *= -1;
      if (star.y < 0 || star.y > canvas.height) star.dy *= -1;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(updateStars);
  }

  createStars();
  updateStars();

  // Opdater canvas størrelse, når vinduet ændrer størrelse
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createStars(); // Skab nye stjerner for at tilpasse ændringerne
  });
});
