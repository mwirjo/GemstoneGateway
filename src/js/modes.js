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
                    window.location.href = "/MacroscopicTheory/index.html";
                } else {
                    window.location.href = "/mineralListing/index.html";
                }
            });
        }
    });

    // Elements card specific (safe)
    setClick("#elements-card", () => {
        window.location.href = "/mineralListing/index.html?category=elements";
    });

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

// -----------------------------
// Mark Done Buttons - SAFE
// -----------------------------
function initMarkDoneButtons() {
    document.querySelectorAll("#markDoneBtn").forEach(btn => {
        if (btn) {
            btn.addEventListener("click", async function(e) {
                e.preventDefault();
                
                try {
                    // Use imported addGems directly (already imported at top)
                    addGems(5);
                    
                    // Visual feedback
                    const gemCountEl = this.closest(".mark-done-section")?.querySelector("#gemCount");
                    this.innerHTML = "✅ +5 GEMS!";
                    this.style.background = "#218838";
                    this.style.transform = "scale(0.95)";
                    
                    if (gemCountEl) {
                        const gems = parseInt(localStorage.getItem("player")?.gems || "0");
                        gemCountEl.textContent = gems;
                    }
                    
                    setTimeout(() => {
                        this.innerHTML = "+5 GEMS EARNED";
                        this.style.background = "";
                        this.style.transform = "scale(1)";
                    }, 1500);
                } catch (error) {
                    console.error("Mark done failed:", error);
                }
            });
        }
    });
}
