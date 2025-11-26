"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const benButton = document.querySelector(".ben-button");
    const timer = document.querySelector(".time");
    const counter = document.querySelector(".count");

    // Preload audio
    const pressAudio = new Audio("/static/audio/grab.mp3");
    const releaseAudio = new Audio("/static/audio/release.mp3");

    // Audio concurrency throttling
    let audioCount = 0;
    const maxAudios = 8;

    const playSound = (sourceAudio) => {
        if (audioCount < maxAudios) {
            audioCount++;
            // Clone node allows overlapping sounds
            const tmp = sourceAudio.cloneNode();
            tmp.volume = 0.1;
            tmp.addEventListener('ended', () => {
                audioCount--;
                tmp.remove(); // Clean up memory
            }, { once: true });
            tmp.play().catch(e => console.error("Audio play failed:", e));
        }
    };

    const updateClickDisplay = (count) => {
        counter.textContent = `you have clicked ben ${count} times :)`;
    };

    const countClick = () => {
        let clicks = parseInt(localStorage.getItem("clicks") || "0", 10);
        clicks++;
        localStorage.setItem("clicks", clicks);
        updateClickDisplay(clicks);
    };

    // Initialize displays
    updateClickDisplay(localStorage.getItem("clicks") || 0);

    // -- Interaction Logic --

    const press = (e) => {
        // Prevent default only if necessary (e.g., prevents scrolling on mobile while spamming)
        if (e.type !== 'keydown') e.preventDefault();

        playSound(pressAudio);
        benButton.classList.add("press");
        countClick();
        document.title = "ben (squeak!)";
    };

    const release = (e) => {
        if (benButton.classList.contains("press")) {
            playSound(releaseAudio);
            benButton.classList.remove("press");
            document.title = "ben";
        }
    };

    // Pointer events handle Mouse, Touch, and Pen uniformly
    benButton.addEventListener("pointerdown", (e) => {
        press(e);
        // Capture pointer ensures the 'up' event fires even if they drag off the image
        benButton.setPointerCapture(e.pointerId);
    });

    benButton.addEventListener("pointerup", (e) => {
        release(e);
        benButton.releasePointerCapture(e.pointerId);
    });

    // Keyboard support (Space and Enter)
    benButton.addEventListener("keydown", (e) => {
        if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
            press(e);
        }
    });

    benButton.addEventListener("keyup", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            release(e);
        }
    });

    // -- Timer Logic --

    const observing = () => {
        if (document.hasFocus()) {
            let secs = parseInt(localStorage.getItem("secs") || "0", 10);
            secs++;
            localStorage.setItem("secs", secs);
            timer.textContent = `you have observed ben for ${secs} seconds`;
        }
    };

    // Initialize timer text immediately
    const initialSecs = localStorage.getItem("secs") || 0;
    timer.textContent = `you have observed ben for ${initialSecs} seconds`;

    setInterval(observing, 1000);

    // -- Clear Data Logic --

    timer.addEventListener("click", () => {
        localStorage.removeItem("secs");
        timer.textContent = "";
    });

    counter.addEventListener("click", () => {
        localStorage.removeItem("clicks");
        counter.textContent = "";
    });
});
