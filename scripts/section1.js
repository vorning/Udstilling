const video = document.getElementById("videoRoom1");
let isVideoPlaying = true;
let scrollPosition = 0;

// Lock scroll when the page loads to control it programmatically
document.body.style.overflow = "hidden";

// Listen for the `wheel` event to handle scrubbing
window.addEventListener("wheel", (event) => {
  if (isVideoPlaying) {
    event.preventDefault(); // Prevent default scroll behavior

    // Adjust scrollPosition based on scroll direction
    scrollPosition += event.deltaY * 0.02; // Adjust multiplier for faster/slower scrubbing

    // Constrain scrollPosition between 0 and video duration
    scrollPosition = Math.max(0, Math.min(video.duration, scrollPosition));

    // Set video current time based on scroll position
    video.currentTime = scrollPosition;

    // Check if video is at the end
    if (video.currentTime >= video.duration - 0) {
      isVideoPlaying = false; // Stop scrubbing
      document.body.style.overflow = "auto"; // Re-enable scrolling for rest of the page
      document.getElementById("room2").scrollIntoView({ behavior: "smooth" });
    }
  }
}, { passive: false });
