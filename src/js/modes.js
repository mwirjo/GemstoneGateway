// modes.js - RENDER PRODUCTION SAFE
import { qs, setClick } from "./utils.mjs";
import { getPlayer, updateHeader, addGems } from "./playerLoader.js";

// SINGLE DOMContentLoaded - handles ALL initialization
document.addEventListener("DOMContentLoaded", async () => {
    // Player header (safe)
    const user = getPlayer();
    if (user) updateHeader(user);

    // Mode navigation buttons
    const modeMap = {
        "learn-mode": "learn/index.html",
        "guess-mode": "guess/index.html",
        "formula-mode": "formula/index.html",
        "dragon-mode": "mydragon/index.html"
    };

    Object.keys(modeMap).forEach(modeId => {
        const element = document.getElementById(modeId);
        if (element) {
            setClick(`#${modeId}`, () => {
                window.location.href = modeMap[modeId];
            });
            
            // Hover effects (safe)
            element.addEventListener("mouseenter", () => element.classList.add("hovered"));
            element.addEventListener("mouseleave", () => element.classList.remove("hovered"));
        }
    });

    // Burger menu (safe null check)
    const burgerBtn = document.getElementById("burger-btn");
    const playerStatus = document.getElementById("player-status");
    if (burgerBtn && playerStatus) {
        burgerBtn.addEventListener("click", () => {
            playerStatus.classList.toggle("active");
        });
    }

    // Mineral category cards (safe querySelectorAll)
    document.querySelectorAll("#macroscopic-card, #elements-card, #oxides-card, #halides-card, #sulfides-card, #carbonates-card, #silicates-card").forEach(card => {
        if (card) {
            card.addEventListener("click", function() {
                const cardId = this.id;
                if (cardId === "macroscopic-card") {
                    window.location.href = "/macrotheory/index.html";
                } else {
                    window.location.href = "/minerallist/index.html";
                }
            });
        }
    });

    const elementsCard = document.getElementById("elements-card");
      if (elementsCard) {
          setClick("#elements-card", () => {
              window.location.href = "/minerallist/?category=elements";
          });
      }
    const oxidesCard = document.getElementById("oxides-card");
      if (oxidesCard) {
          setClick("#oxides-card", () => {
              window.location.href = "/minerallist/?category=oxides";
          });
      }
    const halidesCard = document.getElementById("halides-card");
      if (halidesCard) {
          setClick("#halides-card", () => {
              window.location.href = "/minerallist/?category=halides";
          });
      }

    const sulfidesCard = document.getElementById("sulfides-card");
      if (sulfidesCard) {
          setClick("#sulfides-card", () => {
              window.location.href = "/minerallist/?category=sulfides";
          });
      }
    const carbonatesCard = document.getElementById("carbonates-card");
      if (carbonatesCard) {
          setClick("#carbonates-card", () => {
              window.location.href = "/minerallist/?category=carbonates";
          });
      }
    
    const sulfatesCard = document.getElementById("sulfates-card");
      if (sulfatesCard) {
          setClick("#sulfates-card", () => {
              window.location.href = "/minerallist/?category=sulfates";
          });
      }
    
    const phosphatesCard = document.getElementById("phosphates-card");
      if (phosphatesCard) {
          setClick("#phosphates-card", () => {
              window.location.href = "/minerallist/?category=phosphates";
          });
      }
    
    
    // Main/Sub card toggle system (SAFE)
    initMainSubCards();

    // Mark done buttons (SAFE dynamic import)
    initMarkDoneButtons();
});

// -----------------------------
// Main/Sub Cards - SAFE
// -----------------------------
function initMainSubCards() {
    const mainCards = document.querySelectorAll(".main-card");
    const mainContainer = document.getElementById("main-cards-container");

    if (!mainCards.length || !mainContainer) return;

    mainCards.forEach(mainCard => {
        mainCard.addEventListener("click", function(e) {
            e.stopPropagation();
            
            const subSection = this.dataset.subSection;
            const isActive = this.classList.contains("active");
            
            // Hide ALL
            mainCards.forEach(card => card.classList.remove("active"));
            document.querySelectorAll(".sub-container").forEach(container => {
                if (container) container.style.display = "none";
            });
            
            if (isActive) {
                mainContainer.style.display = "flex";
                return;
            }
            
            this.classList.add("active");
            mainContainer.style.display = "none";
            
            const subContainer = document.getElementById(subSection + "-sub-container");
            if (subContainer) subContainer.style.display = "block";
        });
    });

    // Sub-topic buttons
    document.querySelectorAll(".sub-topic-btn").forEach(btn => {
        if (btn) {
            btn.addEventListener("click", function(e) {
                e.stopPropagation();
                const target = this.dataset.target;
                const subContainer = this.closest(".sub-container");
                
                if (subContainer) {
                    subContainer.querySelectorAll("[id$='-section']").forEach(section => {
                        if (section) section.style.display = "none";
                    });
                    const targetSection = document.getElementById(target + "-section");
                    if (targetSection) targetSection.style.display = "block";
                }
            });
        }
    });

    // Flip cards
    document.querySelectorAll(".sub-container .mode-card").forEach(card => {
        if (card) {
            card.addEventListener("click", function(e) {
                e.stopPropagation();
                this.classList.toggle("flipped");
            });
        }
    });
}

async function initMarkDoneButtons() {
    document.querySelectorAll("#markDoneBtn").forEach(btn => {
        if (btn) {
            btn.addEventListener("click", async function(e) {
                e.preventDefault();
                
                try {
                    // 1. Add gems (awaited)
                    await addGems(5);
                    
                    // 2. IMMEDIATE visual feedback (like mineral)
                    this.innerHTML = "✅ +5 GEMS!";
                    this.style.background = "#218838";
                    this.style.transform = "scale(0.95)";
                    this.disabled = true;
                    
                    // 3. Read FRESH from localStorage (bypasses getPlayer cache)
                    const playerData = JSON.parse(localStorage.getItem("player") || "{}");
                    const gemCountEl = this.closest(".mark-done-section")?.querySelector("#gemCount");
                    
                    if (gemCountEl) {
                        gemCountEl.textContent = playerData.gems || 0;
                    }
                    
                    // 4. Reset button (like mineral)
                    setTimeout(() => {
                        this.innerHTML = "+5 GEMS EARNED";
                        this.disabled = false;
                        this.style.background = "";
                        this.style.transform = "scale(1)";
                    }, 2000);
                    
                } catch (error) {
                    console.error("Mark done failed:", error);
                    this.innerHTML = "❌ Try again";
                    setTimeout(() => { this.innerHTML = "+5 GEMS"; }, 1500);
                }
            });
        }
    });
}

