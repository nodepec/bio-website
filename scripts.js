document.addEventListener("DOMContentLoaded", function() {
    const links = document.querySelectorAll("nav a");
    links.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            const href = this.getAttribute("href");
            document.body.style.transition = "opacity 0.5s ease, transform 0.5s ease, border-radius 0.5s ease";
            document.body.style.opacity = 0;
            document.body.style.transform = "scale(0.95)";
            document.body.style.borderRadius = "20px";
            setTimeout(function() {
                window.location.href = href;
            }, 500);
        });
    });
});
window.addEventListener("load", function() {
    document.body.style.opacity = 1;
    document.body.style.transform = "scale(1)";
    document.body.style.borderRadius = "0";
});
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');

navToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
});
