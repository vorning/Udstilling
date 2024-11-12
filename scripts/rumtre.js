let currentPhase = 0;
let starPhases = [];

// Hent stjernedata
fetch("json/rumtre.json")
  .then((response) => response.json())
  .then((data) => {
    starPhases = data;
    updateDisplay();
  })
  .catch((error) => console.error("Fejl ved indlæsning af data:", error));

// Opdater visning af fase
function updateDisplay() {
  const phase = starPhases[currentPhase];
  const stageInfo = document.getElementById("stage-info");
  const starImage = document.getElementById("star-image");
  const starVideo = document.getElementById("star-video");

  stageInfo.innerHTML = `<h2>${phase.name}</h2><p>${phase.description}</p>`;

  if (phase.video) {
    // Vis videoen i fuld skærm og afspil automatisk
    starImage.style.display = "none";
    starVideo.style.display = "block";
    starVideo.src = phase.video;
    starVideo.play(); // Start videoen automatisk
  } else {
    // Skjul videoen, vis billedet
    starImage.style.display = "block";
    starImage.style.backgroundImage = `url(${phase.image})`;
    starVideo.style.display = "none";
    starVideo.src = ""; // Ryd video-kilden
  }
}

// Knappen til at skifte fase
document.getElementById("next-phase").addEventListener("click", () => {
  currentPhase = (currentPhase + 1) % starPhases.length;
  updateDisplay();
});
