document.addEventListener("DOMContentLoaded", function() {
    const links = document.querySelectorAll("nav a");

    links.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();

            const href = this.getAttribute("href");

            // Apply transition to opacity, transform, and border-radius
            document.body.style.transition = "opacity 0.5s ease, transform 0.5s ease, border-radius 0.5s ease";

            // Fade out the body and round the corners
            document.body.style.opacity = 0;
            document.body.style.transform = "scale(0.95)";
            document.body.style.borderRadius = "20px"; // Adjust the border-radius as needed

            // Redirect to the new page after the animation is complete
            setTimeout(function() {
                window.location.href = href;
            }, 500); // Adjust the timing to match your transition duration
        });
    });
});

// Add this if you want to fade in the new page after it loads
window.addEventListener("load", function() {
    document.body.style.opacity = 1;
    document.body.style.transform = "scale(1)";
    document.body.style.borderRadius = "0"; // Reset border-radius
});
