import { qs, setClick, getLocalStorage, setLocalStorage } from "./utils.mjs";

document.addEventListener("DOMContentLoaded", () => {
  const modeContent = qs("#mode-content");

  function loadMode(mode) {
    switch(mode) {
      case "learn":
        modeContent.innerHTML = "<h2>Learn Mode</h2><p>Learn new formulas and concepts here.</p>";
        break;
      case "guess":
        modeContent.innerHTML = "<h2>Guess Mode</h2><p>Guess the correct answers to earn gems!</p>";
        break;
      case "formula":
        modeContent.innerHTML = "<h2>Formula Mode</h2><p>Practice formulas with interactive examples.</p>";
        break;
    }
  }

  setClick("#learn-mode-btn", () => loadMode("learn"));
  setClick("#guess-mode-btn", () => loadMode("guess"));
  setClick("#formula-mode-btn", () => loadMode("formula"));
});
