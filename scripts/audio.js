document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('ambient-soundtrack');
    const playButton = document.getElementById('play-sound');
    const pauseButton = document.getElementById('pause-sound');

    // Ensure audio starts playing automatically
    audio.play().catch((error) => {
        console.error('Autoplay failed due to browser policies: ', error);
    });

    pauseButton.addEventListener('click', () => {
        audio.pause();
        pauseButton.style.display = 'none';
        playButton.style.display = 'inline-block';
    });

    playButton.addEventListener('click', () => {
        audio.play().catch((error) => {
            console.error('Play failed: ', error);
        });
        playButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
    });
});
