document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("scrollVideo");
  const overlay = document.getElementById("overlay");
  const continueOverlay = document.getElementById("continueOverlay");
  let hasStartedFading = false;

  // Event listener til hele overlayet
  overlay.addEventListener("click", () => {
    // Fade overlay ud ved at tilføje "hidden" klasse
    overlay.classList.add("hidden");

    // Start videoafspilning efter udtoningen
    setTimeout(() => {
      video.play();
    }, 1000); // Matcher tiden med CSS transition (1 sekund)
  });

  // Event listener for at monitorere videoens tid
  video.addEventListener("timeupdate", () => {
    const timeLeft = video.duration - video.currentTime;

    // Start fade-out 3 sekunder før videoen slutter
    if (timeLeft <= 3 && !hasStartedFading) {
      video.style.opacity = 0; // Fade videoen ud til sort
      hasStartedFading = true;

      // Vis "Fortsæt"-overlayet efter at videoen er faded ud
      setTimeout(() => {
        continueOverlay.classList.remove("hidden");
      }, 2000); // Matcher fade-out transition (2 sekunder)
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const nextButtons = document.querySelectorAll(".next-button");
  const backButtons = document.querySelectorAll(".back-button");

  // Definer rækkefølgen af iframe-URLs for hvert rum
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
      const iframe = button.closest(".section").querySelector("iframe");
      const currentSrc = iframe.getAttribute("src");
      let nextIndex = iframeOrder.indexOf(currentSrc) + 1;

      // Hvis vi har nået det sidste rum, start forfra (loop)
      if (nextIndex >= iframeOrder.length) {
        nextIndex = 0;
      }

      const nextIframeSrc = iframeOrder[nextIndex];

      // Start fade-out animation
      iframe.style.transition = "opacity 1s ease";
      iframe.style.opacity = 0;

      // Vent på at fade-out animationen afslutter
      setTimeout(() => {
        // Skift iframe URL
        iframe.src = nextIframeSrc;

        // Start fade-in animation efter URL skift
        iframe.style.opacity = 1;
      }, 1000); // 1000ms = 1 sekund, matcher fade-out tiden
    });
  });

  backButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const iframe = button.closest(".section").querySelector("iframe");
      const currentSrc = iframe.getAttribute("src");
      let previousIndex = iframeOrder.indexOf(currentSrc) - 1;

      // Hvis vi har nået det første rum, gå til det sidste rum (loop)
      if (previousIndex < 0) {
        previousIndex = iframeOrder.length - 1;
      }

      const previousIframeSrc = iframeOrder[previousIndex];

      // Start fade-out animation
      iframe.style.transition = "opacity 1s ease";
      iframe.style.opacity = 0;

      // Vent på at fade-out animationen afslutter
      setTimeout(() => {
        // Skift iframe URL
        iframe.src = previousIframeSrc;

        // Start fade-in animation efter URL skift
        iframe.style.opacity = 1;
      }, 1000); // 1000ms = 1 sekund, matcher fade-out tiden
    });
  });
});
