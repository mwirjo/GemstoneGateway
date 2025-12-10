// modes.js
import { qs, setClick } from "./utils.mjs";

document.addEventListener("DOMContentLoaded", () => {
  // Map mode IDs to their respective folder/index.html
  const modeMap = {
    "learn-mode": "learnmode/index.html",
    "guess-mode": "guessmode/index.html",
    "formula-mode": "formulamode/index.html",
    "dragon-mode": "dragon/index.html"
  };

  // Attach click events for each mode card
  Object.keys(modeMap).forEach(modeId => {
    const targetURL = modeMap[modeId];

    setClick(`#${modeId}`, () => {
      window.location.href = targetURL;
    });
  });

  // Optional: highlight card on hover (additional feedback)
  Object.keys(modeMap).forEach(modeId => {
    const card = qs(`#${modeId}`);
    card.addEventListener("mouseenter", () => card.classList.add("hovered"));
    card.addEventListener("mouseleave", () => card.classList.remove("hovered"));
  });
});
