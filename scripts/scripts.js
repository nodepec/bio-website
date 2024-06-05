document.addEventListener("DOMContentLoaded", function() {
    const body = document.body;
    const spinner = document.getElementById('loading-spinner');

    // Check if there's a saved background position in sessionStorage
    const savedBgPosition = sessionStorage.getItem('bgPosition');
    if (savedBgPosition) {
        body.style.backgroundPosition = savedBgPosition;
    }

    // Update the background position in sessionStorage periodically
    setInterval(() => {
        const bgPosition = window.getComputedStyle(body).backgroundPosition;
        sessionStorage.setItem('bgPosition', bgPosition);
    }, 100);

    // Show spinner on load
    spinner.style.display = 'block';

    window.addEventListener("load", function() {
        document.body.style.opacity = 1;
        spinner.style.display = 'none';
    });
});
