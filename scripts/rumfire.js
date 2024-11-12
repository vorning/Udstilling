// JavaScript til Planetdannelse scene
let planetFormationData = {};

// Hent Planetdannelse data fra JSON
window.onload = () => {
  fetch("json/rumfire.json")
    .then((response) => response.json())
    .then((data) => {
      planetFormationData = data;
      updatePlanetFormationScene();
    })
    .catch((error) => console.error("Fejl ved indlæsning af data:", error));

  // Opdater visningen af Planetdannelse scenen
  function updatePlanetFormationScene() {
    if (!planetFormationData) {
      console.error(
        "Fejl: Data for Planetdannelse scenen blev ikke hentet korrekt."
      );
      return;
    }

    // Opdater HTML-elementer med data fra JSON
    const header = document.getElementById("main-title");
    const video = document.getElementById("planetFormationVideo");
    const playPauseButton = document.getElementById("playPauseButton");

    if (header) {
      header.textContent = planetFormationData.title;
    }

    if (video) {
      video.src = planetFormationData.video.src;
      video.type = planetFormationData.video.type;
      video.play(); // Start videoen automatisk ved indlæsning af siden
    }

    if (playPauseButton) {
      playPauseButton.innerText = planetFormationData.buttonText.pause;

      // Håndter klik på afspil/stop-knappen
      playPauseButton.addEventListener("click", () => {
        if (video.paused) {
          video.play();
          playPauseButton.innerText = planetFormationData.buttonText.pause;
        } else {
          video.pause();
          playPauseButton.innerText = planetFormationData.buttonText.play;
        }
      });

      // Opdater knaptekst, når videoen afsluttes
      video.addEventListener("ended", () => {
        playPauseButton.innerText = planetFormationData.buttonText.play;
      });
    }
  }
};
