document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("planetFormationVideo");
  const playPauseButton = document.getElementById("playPauseButton");

  // Start videoen automatisk ved indlæsning af siden
  video.play();
  playPauseButton.innerText = "Pause";

  // Håndter klik på afspil/stop-knappen
  playPauseButton.addEventListener("click", () => {
    if (video.paused) {
      video.play();
      playPauseButton.innerText = "Pause";
    } else {
      video.pause();
      playPauseButton.innerText = "Afspil";
    }
  });

  // Opdater knaptekst, når videoen afsluttes
  video.addEventListener("ended", () => {
    playPauseButton.innerText = "Afspil";
  });
});
