// modes.js - FIXED (BEIDE werken perfect!)
import { qs, setClick } from "./utils.mjs";
import { getPlayer, updateHeader } from "./playerLoader.js";

document.addEventListener("DOMContentLoaded", async () => {
  const user = getPlayer();
  if (user) updateHeader(user);
});

document.addEventListener("DOMContentLoaded", () => {
  const modeMap = {
    "learn-mode": "learnmode/index.html",
    "guess-mode": "guessmode/index.html",
    "formula-mode": "formulamode/index.html",
    "dragon-mode": "dragon/index.html"
  };

  Object.keys(modeMap).forEach(modeId => {
    const element = document.getElementById(modeId);
    if (element) {
      setClick(`#${modeId}`, () => {
        window.location.href = modeMap[modeId];
      });
    }
  });

  Object.keys(modeMap).forEach(modeId => {
    const card = qs(`#${modeId}`);
    if (card) {
      card.addEventListener("mouseenter", () => card.classList.add("hovered"));
      card.addEventListener("mouseleave", () => card.classList.remove("hovered"));
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const burgerBtn = document.getElementById("burger-btn");
  const playerStatus = document.getElementById("player-status");
  if (burgerBtn && playerStatus) {
    burgerBtn.addEventListener("click", () => {
      playerStatus.classList.toggle("active");
    });
  }
});

document.querySelectorAll("#macroscopic-card, #elements-card, #oxides-card, #halides-card, #sulfides-card, #carbonates-card, #silicates-card").forEach(card => {
  card.addEventListener("click", function() {
    const cardId = this.id;
    if (cardId === "macroscopic-card") {
      window.location.href = "/MacroscopicTheory/index.html";
    } else {
      window.location.href = "/mineralListing/index.html";
    }
  });
});

// modes.js - SCALABLE MAIN/SUB TOGGLE
document.addEventListener("DOMContentLoaded", () => {
  // Get ALL main cards
  const mainCards = document.querySelectorAll(".main-card");
  const mainContainer = document.getElementById("main-cards-container");

  // Toggle main card → show its sub-section
  mainCards.forEach(mainCard => {
    mainCard.addEventListener("click", function(e) {
      e.stopPropagation();
      
      const subSection = this.dataset.subSection;
      const isActive = this.classList.contains("active");
      
      // Hide ALL main cards + sub-containers
      mainCards.forEach(card => card.classList.remove("active"));
      document.querySelectorAll(".sub-container").forEach(container => {
        container.style.display = "none";
      });
      
      // If clicking active card → show main cards again
      if (isActive) {
        mainContainer.style.display = "flex";
        return;
      }
      
      // Show THIS card"s sub-section
      this.classList.add("active");
      mainContainer.style.display = "none";
      document.getElementById(subSection + "-sub-container").style.display = "block";
    });
  });

  // Sub-topic buttons (within active sub-section)
  document.querySelectorAll(".sub-topic-btn").forEach(btn => {
    btn.addEventListener("click", function(e) {
      e.stopPropagation();
      const target = this.dataset.target;
      const subContainer = this.closest(".sub-container");
      
      // Hide all sub-sections in THIS container
      subContainer.querySelectorAll("[id$='-section']").forEach(section => {
        section.style.display = "none";
      });
      
      // Show selected sub-section
      document.getElementById(target + "-section").style.display = "block";
    });
  });

  // Individual flip cards
  document.querySelectorAll(".sub-container .mode-card").forEach(card => {
    card.addEventListener("click", function(e) {
      e.stopPropagation();
      this.classList.toggle("flipped");
    });
  });
});



 
  
  // MARK DONE BUTTONS - Multiple buttons support
  document.querySelectorAll("#markDoneBtn").forEach(btn => {
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      
      // Use YOUR playerLoader addGems!
      import("./playerLoader.js").then(({ addGems }) => {
        addGems(5);
        
        // Visual feedback
        const gemCountEl = this.closest(".mark-done-section")?.querySelector("#gemCount");
        this.innerHTML = "✅ +5 GEMS!";
        this.style.background = "#218838";
        this.style.transform = "scale(0.95)";
        
        if (gemCountEl) gemCountEl.textContent = parseInt(localStorage.getItem("gem-amount") || "0");
        
        setTimeout(() => {
          this.innerHTML = "+5 GEMS EARNED";
          this.style.background = "";
          this.style.transform = "scale(1)";
        }, 1500);
      });
    });
  });

setClick("#elements-card", () => {
  window.location.href = "mineralListing.html?category=elements";
});