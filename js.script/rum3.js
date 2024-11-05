let currentPhase = 0;
let starPhases = [];

fetch('json/stjernes_faser.json')
    .then(response => response.json())
    .then(data => {
        starPhases = data;
        updateDisplay();
    })
    .catch(error => console.error("Fejl ved indlæsning af data:", error));

function updateDisplay() {
    const phase = starPhases[currentPhase];
    document.getElementById('stage-info').innerHTML = `<h2>${phase.name}</h2><p>${phase.description}</p>`;
    document.getElementById('star-image').style.backgroundImage = `url(${phase.image})`;
}

document.getElementById('next-phase').addEventListener('click', () => {
    currentPhase = (currentPhase + 1) % starPhases.length;
    updateDisplay();
});