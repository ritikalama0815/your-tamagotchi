let ipcRenderer = null;
if (typeof require === "function") {
    try {
        ipcRenderer = require("electron").ipcRenderer;
    } catch (e) {
        // Running outside Electron (e.g. browser preview)
    }
}

const minimize = document.getElementById("minimize");
const close = document.getElementById("close");

if (ipcRenderer) {
    minimize.addEventListener("click", () => ipcRenderer.send("window:minimize"));
    close.addEventListener("click", () => ipcRenderer.send("window:close"));
}

// Water mechanic
const drain = 1;
const drain_interval = 1000;
const water_cooldown = 10000;

let water_level = 100;
let water_on_cooldown = false;
let cooldown_timer = null;

const bars = Array.from({ length: 10 }, (_, i) =>
    document.getElementById(`bar-${i + 1}`)
);

const percentage = document.getElementById('percentage');
const mood = document.getElementById('mood');
const planticon = document.getElementById('plant');
const reminder = document.getElementById('message');
const water_btn = document.getElementById('water-btn');
const water_timer = water_btn.querySelector(".timer");
const restart = document.getElementById('restart-btn');

// Render
function updateui() {
    percentage.textContent = `${water_level}%`;
    bars.forEach((bar, i) => {
        const threshold = i * 10;
        const filled = water_level > threshold;
        bar.style.background = filled ? "#eea8c0" : "#f5dce4";
        bar.style.color = filled ? "#eea8c0" : "#f5dce4";
    });

    // Update mood
    if (water_level > 80) {
        planticon.src = "assets/philodendron-plant/philodendron-thriving.gif";
        mood.textContent = "strong";
        reminder.textContent = "i dont need treats for 10 mins now";
        restart.style.display = "none";
        water_btn.style.display = "flex";
    } else if (water_level > 50) {
        planticon.src = "assets/philodendron-plant/philodendron-okay.gif";
        mood.textContent = "im ok";
        reminder.textContent = "fine, may be i eat some";
        restart.style.display = "none";
        water_btn.style.display = "flex";
    } else if (water_level > 0) {
        planticon.src = "assets/philodendron-plant/philodendron-thirsty.gif";
        mood.textContent = "hungry";
        reminder.textContent = "give me treats";
        restart.style.display = "none";
        water_btn.style.display = "flex";
    } else {
        planticon.src = "assets/philodendron-plant/philodendron-wilted.gif";
        mood.textContent = "...";
        reminder.textContent = "...";
        restart.style.display = "flex";
        water_btn.style.display = "none";
    }
}

// Start the drain loop once
setInterval(() => {
    if (water_level > 0) {
        water_level = Math.max(0, water_level - drain);
        updateui();
    }
}, drain_interval);

// Add event listeners
water_btn.addEventListener("click", () => {
    if (water_on_cooldown) return;
    water_level = Math.min(100, water_level + 25);
    updateui();

    water_on_cooldown = true;
    water_btn.disabled = true;
    water_btn.style.opacity = 0.5;

    let remaining = water_cooldown / 1000;
    water_timer.textContent = `${remaining}s`;

    cooldown_timer = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
            clearInterval(cooldown_timer);
            water_on_cooldown = false;
            water_btn.disabled = false;
            water_btn.style.opacity = 1;
            water_timer.textContent = "ready";
        } else {
            water_timer.textContent = `${remaining}s`;
        }
    }, 1000);
});

restart.addEventListener("click", () => {
    water_level = 100;
    water_on_cooldown = false;
    water_btn.disabled = false;
    water_btn.style.opacity = 1;
    water_timer.textContent = "ready for treating";
    clearInterval(cooldown_timer);
    updateui();
});

// Ensure DOM is loaded before calling updateui
document.addEventListener("DOMContentLoaded", () => {
    updateui();
});