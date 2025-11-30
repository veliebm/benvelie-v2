"use strict"; // Enforces cleaner code and catches errors.

document.addEventListener("DOMContentLoaded", () => {
  const benButton = document.querySelector(".ben-button");
  const timer = document.querySelector(".time");
  const counter = document.querySelector(".count");
  const srcPress = "/static/audio/grab.mp3";
  const srcRelease = "/static/audio/release.mp3";

  // -- State Management --
  let state = {
    clicks: parseInt(localStorage.getItem("clicks") || "0", 10),
    secs: parseInt(localStorage.getItem("secs") || "0", 10),
    dirty: false // Flag to know if we need to save
  };

  // Function for updating the UI.
  const updateUI = () => {
    counter.textContent = `you have clicked ben ${state.clicks} times :)`;
    timer.textContent = `you have observed ben for ${state.secs} seconds`;
  };
  // Update UI immediately
  updateUI();

  // Save to LocalStorage ONLY once per second (Throttling)
  setInterval(() => {
    if (state.dirty) {
      localStorage.setItem("clicks", state.clicks);
      localStorage.setItem("secs", state.secs);
      state.dirty = false;
    }
  }, 1000);

  // -- Audio System (Web Audio API for Low Latency --
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContext();

  const loadBuffer = async (url) => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await ctx.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.error("Failed to load audio", e);
    }
  };

  let bufferPress, bufferRelease;

  // Preload audio immediately
  loadBuffer(srcPress).then(b => bufferPress = b);
  loadBuffer(srcRelease).then(b => bufferRelease = b);

  const playSound = (buffer) => {
    if (!buffer || ctx.state === "suspended") {
      ctx.resume(); // Browser requires user interaction to start audio context
    }
    if (!buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  };

  // -- Interaction Logic --

  const press = (e) => {
    if (e.type !== "keydown") e.preventDefault();

    playSound(bufferPress);
    benButton.classList.add("press");

    state.clicks++;
    state.dirty = true;
    updateUI(); // Only update text, don't write to disk yet

    document.title = "ben (squeak!)";
  };

  const release = () => {
    if (benButton.classList.contains("press")) {
      playSound(bufferRelease);
      benButton.classList.remove("press");
      document.title = "ben";
    }
  };

  // -- Event Listeners --

  benButton.addEventListener("pointerdown", (e) => {
    press(e);
    benButton.setPointerCapture(e.pointerId);
  });

  benButton.addEventListener("pointerup", (e) => {
    release();
    benButton.releasePointerCapture(e.pointerId);
  });

  // Handle dragging off the button but releasing elsewhere
  benButton.addEventListener("pointercancel", (e) => {
    release();
    benButton.releasePointerCapture(e.pointerId);
  });

  benButton.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
      press(e);
    }
  });

  benButton.addEventListener("keyup", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      release();
    }
  });

  // -- Timer Logic --
  setInterval(() => {
    if (document.hasFocus()) {
      state.secs++;
      state.dirty = true;
      // We don't update UI here to prevent text layout shift jitter
      // Or we can update just the text content efficiently
      timer.textContent = `you have observed ben for ${state.secs} seconds`;
    }
  }, 1000);
});