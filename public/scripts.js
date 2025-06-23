document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const spinner = document.getElementById('loading-spinner');

    const createDynamicBackground = () => {
        const canvas = document.createElement('canvas');
        canvas.id = 'dynamic-background';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    createDynamicBackground();

    window.addEventListener('load', () => {
        body.style.opacity = 1;

        document.querySelectorAll('.animated-text, .social-icons a').forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = 1;
                el.style.transform = 'translateY(0) scale(1)';
                el.style.transition =
                    'opacity 0.5s ease, transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            }, 100 * index);
        });

        if (spinner) {
            setTimeout(() => {
                spinner.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                spinner.style.opacity = 0;
                spinner.style.transform = 'scale(2) rotate(360deg)';
                setTimeout(() => (spinner.style.display = 'none'), 500);
            }, 1000);
        }

        document.querySelectorAll('.social-icons a').forEach((icon) => {
            icon.addEventListener('mouseenter', () => {
                icon.style.transform = 'scale(1.2) rotate(5deg)';
            });
            icon.addEventListener('mouseleave', () => {
                icon.style.transform = 'scale(1) rotate(0deg)';
            });
        });
    });
});
document.addEventListener('contextmenu', (e) => e.preventDefault());

function ctrlShiftKey(e, keyCode) {
  return e.ctrlKey && e.shiftKey && e.keyCode === keyCode.charCodeAt(0);
}

document.onkeydown = (e) => {
}

function createDiv(height, width) {
    var div = document.createElement("div");
    div.style.position = "absolute";
    div.style.height = height + "px";
    div.style.width = width + "px";
    div.style.overflow = "hidden";
    return (div);
}

function newColour() {
    const colors = ['#636363', '#A9A9A9'];
    return colors[Math.floor(Math.random() * colors.length)];
}

document.addEventListener('DOMContentLoaded', logAndSendDataOnLoad);
