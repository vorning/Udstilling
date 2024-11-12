// JavaScript til Big Bang scene
let bigBangData = [];

// Hent Big Bang data fra JSON
window.onload = () => {
  fetch("json/rumet.json")
    .then((response) => response.json())
    .then((data) => {
      bigBangData = data;
      updateBigBang();
    })
    .catch((error) => console.error("Fejl ved indlæsning af data:", error));

  // Opdater visningen af Big Bang scenen
  function updateBigBang() {
    const phase = bigBangData[0];
    const overlay = document.getElementById("overlay");
    const video = document.getElementById("scrollVideo");

    if (!phase) {
      console.error("Fejl: Data for Big Bang scenen blev ikke hentet korrekt.");
      return;
    }

    if (overlay && video) {
      video.src = phase.video;
      overlay.querySelector("p").textContent = phase.overlay;
    }
  }

  const video = document.getElementById("scrollVideo");
  const overlay = document.getElementById("overlay");
  const continueOverlay = document.getElementById("continueOverlay");
  let hasStartedFading = false;

  if (video && overlay) {
    // Event listener til overlayet for at starte videoen
    overlay.addEventListener("click", () => {
      overlay.classList.add("hidden");

      setTimeout(() => {
        video.play();
      }, 1000); // Start videoen efter overlay udtoner (1 sekund)
    });

    // Event listener for at monitorere videoens afspilningstid
    video.addEventListener("timeupdate", () => {
      const timeLeft = video.duration - video.currentTime;

      // Fade videoen ud og vis "Fortsæt"-overlayet kort før slutning
      if (timeLeft <= 3 && !hasStartedFading) {
        video.style.opacity = 0; // Fade videoen ud
        hasStartedFading = true;

        setTimeout(() => {
          if (continueOverlay) {
            continueOverlay.classList.remove("hidden");
          }
        }, 2000); // Vis overlay efter fade-out (2 sekunder)
      }
    });
  }

  // Event listener til at styre navigation mellem rum i index.html
  const nextButtons = document.querySelectorAll(".next-button");
  const backButtons = document.querySelectorAll(".back-button");

  if (nextButtons.length > 0 && backButtons.length > 0) {
    const iframeOrder = [
      "rumet.html", // Rum 1: Big Bang - Begyndelsen
      "rumto.html", // Rum 2: Universets Udvikling
      "rumtre.html", // Rum 3: Stjernernes Fødsel og Død
      "rumfire.html", // Rum 4: Planetdannelse
      "rumfem.html", // Rum 5: Planeterne
      "rumseks.html", // Rum 6: Menneskets Plads i Universet
    ];

    nextButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const section = button.closest(".section");
        if (!section) {
          console.error(
            "Fejl: Kunne ikke finde den nærmeste .section for next-button."
          );
          return;
        }

        const iframe = section.querySelector("iframe");
        if (!iframe) {
          console.error(
            "Fejl: Kunne ikke finde iframe-elementet inden for section."
          );
          return;
        }

        let currentSrc = iframe.getAttribute("src");
        let nextIndex = iframeOrder.indexOf(currentSrc) + 1;

        // Hvis vi har nået det sidste rum, start forfra (loop)
        if (nextIndex >= iframeOrder.length) {
          nextIndex = 0;
        }

        const nextIframeSrc = iframeOrder[nextIndex];

        // Start fade-out animation
        iframe.style.transition = "opacity 1s ease";
        iframe.style.opacity = 0;

        // Vent på at fade-out animationen afslutter, og opdater iframe
        setTimeout(() => {
          iframe.src = nextIframeSrc;
          iframe.style.opacity = 1; // Fade-in
        }, 1000); // Matcher fade-out tiden (1 sekund)
      });
    });

    backButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const section = button.closest(".section");
        if (!section) {
          console.error(
            "Fejl: Kunne ikke finde den nærmeste .section for back-button."
          );
          return;
        }

        const iframe = section.querySelector("iframe");
        if (!iframe) {
          console.error(
            "Fejl: Kunne ikke finde iframe-elementet inden for section."
          );
          return;
        }

        let currentSrc = iframe.getAttribute("src");
        let previousIndex = iframeOrder.indexOf(currentSrc) - 1;

        // Hvis vi har nået det første rum, gå til det sidste rum (loop)
        if (previousIndex < 0) {
          previousIndex = iframeOrder.length - 1;
        }

        const previousIframeSrc = iframeOrder[previousIndex];

        // Start fade-out animation
        iframe.style.transition = "opacity 1s ease";
        iframe.style.opacity = 0;

        // Vent på at fade-out animationen afslutter, og opdater iframe
        setTimeout(() => {
          iframe.src = previousIframeSrc;
          iframe.style.opacity = 1; // Fade-in
        }, 1000); // Matcher fade-out tiden (1 sekund)
      });
    });
  }
};
