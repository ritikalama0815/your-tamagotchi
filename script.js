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

const DEFAULT_CAT_NAME = "galaxy destroyer";
const CAT_NAME_KEY = "cat-name";
const cat_name = document.getElementById("cat-name");
const cat_name_input = document.getElementById("cat-name-input");
const cat_name_row = document.getElementById("cat-name-row");
const edit_name_btn = document.getElementById("edit-name-btn");
const edit_name_icon = document.getElementById("edit-name-icon");

function read_saved_name() {
    try {
        const saved = localStorage.getItem(CAT_NAME_KEY);
        if (saved && saved.trim()) return saved.trim();
    } catch (e) {
        // localStorage can be blocked in some previews
    }
    return DEFAULT_CAT_NAME;
}

function persist_cat_name(name) {
    try {
        localStorage.setItem(CAT_NAME_KEY, name);
    } catch (e) {
        // ignore storage failures
    }
}

function show_cat_name(name) {
    cat_name.textContent = name;
    cat_name_input.value = name;
}

function start_editing_name() {
    cat_name_row.classList.add("editing");
    cat_name_input.value = cat_name.textContent.trim();
    edit_name_icon.src = "assets/title-bar-btns/save-btn.png";
    edit_name_icon.alt = "Save";
    edit_name_btn.setAttribute("aria-label", "Save name");
    cat_name_input.focus();
    cat_name_input.select();
}

function stop_editing_name(save) {
    if (save) {
        const next_name = cat_name_input.value.trim() || cat_name.textContent.trim() || DEFAULT_CAT_NAME;
        show_cat_name(next_name);
        persist_cat_name(next_name);
    } else {
        cat_name_input.value = cat_name.textContent.trim();
    }
    cat_name_row.classList.remove("editing");
    edit_name_icon.src = "assets/title-bar-btns/edit-btn.png";
    edit_name_icon.alt = "Edit";
    edit_name_btn.setAttribute("aria-label", "Edit name");
}

edit_name_btn.addEventListener("mousedown", (event) => {
    event.preventDefault();
});

edit_name_btn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (cat_name_row.classList.contains("editing")) {
        stop_editing_name(true);
    } else {
        start_editing_name();
    }
});

cat_name_input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        stop_editing_name(true);
    } else if (event.key === "Escape") {
        event.preventDefault();
        stop_editing_name(false);
    }
});

cat_name_input.addEventListener("blur", () => {
    if (cat_name_row.classList.contains("editing")) {
        stop_editing_name(true);
    }
});

show_cat_name(read_saved_name());

// Treats mechanic
const treats_drain = 1;
const treats_drain_interval = 1000;
const treats_cooldown = 10000;

let treats_level = 100;
let treats_on_cooldown = false;
let cooldown_timer = null;

const bars = Array.from({ length: 10 }, (_, i) =>
    document.getElementById(`bar-${i + 1}`)
);

const percentage = document.getElementById('percentage');
const mood = document.getElementById('mood');
const cat_icon = document.getElementById('cat');
const reminder = document.getElementById('message');
const treats_btn = document.getElementById('treats-btn');
const treats_timer = treats_btn.querySelector(".timer");
const restart = document.getElementById('restart-btn');

// Render
function updateui() {
    percentage.textContent = `${treats_level}%`;
    bars.forEach((bar, i) => {
        const threshold = i * 10;
        const filled = treats_level > threshold;
        bar.style.background = filled ? "#eea8c0" : "#f5dce4";
        bar.style.color = filled ? "#eea8c0" : "#f5dce4";
    });

    // Update mood
    if (treats_level > 80) {
        cat_icon.src = "assets/cat/cat-strong.gif";
        mood.textContent = "strong";
        reminder.textContent = "i dont need treats for 10 mins now";
        restart.style.display = "none";
        treats_btn.style.display = "flex";
    } else if (treats_level > 50) {
        cat_icon.src = "assets/cat/cat-okay.gif";
        mood.textContent = "im ok";
        reminder.textContent = "fine, may be i eat some";
        restart.style.display = "none";
        treats_btn.style.display = "flex";
    } else if (treats_level > 0) {
        cat_icon.src = "assets/cat/cat-hungry.gif";
        mood.textContent = "hungry";
        reminder.textContent = "give me treats";
        restart.style.display = "none";
        treats_btn.style.display = "flex";
    } else {
        cat_icon.src = "assets/cat/cat-empty.gif";
        mood.textContent = "...";
        reminder.textContent = "...";
        restart.style.display = "flex";
        treats_btn.style.display = "none";
    }
}

// Start the drain loop once
setInterval(() => {
    if (treats_level > 0) {
        treats_level = Math.max(0, treats_level - treats_drain);
        updateui();
    }
}, treats_drain_interval);

// Add event listeners
treats_btn.addEventListener("click", () => {
    if (treats_on_cooldown) return;
    treats_level = Math.min(100, treats_level + 25);
    updateui();

    treats_on_cooldown = true;
    treats_btn.disabled = true;
    treats_btn.style.opacity = 0.5;

    let remaining = treats_cooldown / 1000;
    treats_timer.textContent = `${remaining}s`;

    cooldown_timer = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
            clearInterval(cooldown_timer);
            treats_on_cooldown = false;
            treats_btn.disabled = false;
            treats_btn.style.opacity = 1;
            treats_timer.textContent = "ready";
        } else {
            treats_timer.textContent = `${remaining}s`;
        }
    }, 1000);
});

restart.addEventListener("click", () => {
    treats_level = 100;
    treats_on_cooldown = false;
    treats_btn.disabled = false;
    treats_btn.style.opacity = 1;
    treats_timer.textContent = "ready for treating";
    clearInterval(cooldown_timer);
    updateui();
});

updateui();
