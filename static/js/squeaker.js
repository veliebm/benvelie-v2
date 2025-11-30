"use strict";

document.addEventListener("DOMContentLoaded", async () => {
  // Elements
  const btn = document.getElementById("ben-button");
  const uiTimer = document.getElementById("timer");
  const uiCounter = document.getElementById("counter");

  // State
  const state = {
    clicks: parseInt(localStorage.getItem("clicks") || "0", 10),
    secs: parseInt(localStorage.getItem("secs") || "0", 10),
  };

  // --- Audio System ---
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContext();

  const loadSound = async (url) => {
    try {
      const res = await fetch(url);
      const buffer = await res.arrayBuffer();
      return await ctx.decodeAudioData(buffer);
    } catch (err) {
      console.error("Audio load error:", err);
    }
  };

  const sounds = {
    press: await loadSound("/static/audio/grab.mp3"),
    release: await loadSound("/static/audio/release.mp3"),
  };

  const playSound = (buffer) => {
    if (ctx.state === "suspended") ctx.resume();
    if (!buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  };

  // --- UI & Logic ---

  const render = () => {
    uiCounter.textContent = `you have clicked ben ${state.clicks} times :)`;
    uiTimer.textContent = `you have observed ben for ${state.secs} seconds`;
  };

  const saveState = () => {
    localStorage.setItem("clicks", state.clicks);
    localStorage.setItem("secs", state.secs);
  };

  // Interaction Handlers
  const press = (e) => {
    // Prevent default browser dragging/scrolling
    if (e.cancelable && e.type !== "keydown") e.preventDefault();

    btn.classList.add("pressed");
    playSound(sounds.press);

    state.clicks++;
    render();
    document.title = "ben (squeak!)";
  };

  const release = () => {
    if (btn.classList.contains("pressed")) {
      btn.classList.remove("pressed");
      playSound(sounds.release);
      document.title = "ben";
    }
  };

  // --- Event Listeners ---

  // Pointer events cover Mouse, Touch, and Pen
  btn.addEventListener("pointerdown", (e) => {
    btn.setPointerCapture(e.pointerId);
    press(e);
  });

  btn.addEventListener("pointerup", (e) => {
    btn.releasePointerCapture(e.pointerId);
    release();
  });

  // Handle sliding finger off the button
  btn.addEventListener("pointercancel", (e) => {
    btn.releasePointerCapture(e.pointerId);
    release();
  });

  // Keyboard accessibility
  btn.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && !e.repeat) press(e);
  });

  btn.addEventListener("keyup", (e) => {
    if (e.key === "Enter" || e.key === " ") release();
  });

  // --- Timers ---

  // Initialize UI
  render();

  // Increment timer every second
  setInterval(() => {
    if (document.hasFocus()) {
      state.secs++;
      render();
    }
    // Save to local storage every second (implicit throttling)
    saveState();
  }, 1000);
});
