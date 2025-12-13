// modes.js - COMPLETE PRODUCTION SAFE VERSION
import { qs, setClick, initBurgerMenu} from "./utils.mjs";
import { getPlayer, updateHeader, addGems } from "./playerLoader.js";

// SINGLE DOMContentLoaded - ALL INITIALIZATION
document.addEventListener("DOMContentLoaded", async () => {
    initBurgerMenu(); // Uses utils!
    // 1. Player header (safe)
    const user = getPlayer();
    if (user) updateHeader(user);

    // 2. Mode navigation buttons
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
            
            // Hover effects
            element.addEventListener("mouseenter", () => element.classList.add("hovered"));
            element.addEventListener("mouseleave", () => element.classList.remove("hovered"));
        }
    });

    

    // 4. UNIVERSAL CARD HANDLER - ALL 15+ categories
    setupCardClicks();

    // 5. Main/Sub card toggle system
    initMainSubCards();

    // 6. Mark done buttons
    initMarkDoneButtons();
});

// ========================================
// UNIVERSAL CARD CLICK HANDLER
// ========================================
function setupCardClicks() {
    const cardCategories = [
        // Chapter 1-6: Native + Other groups
        "macroscopic", 
        "elements", "oxides", "halides", "sulfides", 
        "carbonates", "sulfates", "phosphates",
        // Chapter 7: Silicates (7a-7f)
        "nesosilicates", "sorosilicates", "cyclosilicates", 
        "inosilicates", "phyllosilicates", "tektosilicates"
    ];

    cardCategories.forEach(category => {
        const card = document.getElementById(`${category}-card`);
        if (card) {
            setClick(`#${category}-card`, () => {
                if (category === "macroscopic") {
                    window.location.href = "/macrotheory/index.html";
                } else {
                    window.location.href = `/minerallist/?category=${category}`;
                }
            });
            
            // Hover flip effect
            card.addEventListener("mouseenter", () => card.classList.add("hovered"));
            card.addEventListener("mouseleave", () => card.classList.remove("hovered"));
        }
    });
}

// ========================================
// MAIN/SUB CARDS SYSTEM
// ========================================
function initMainSubCards() {
    const mainCards = document.querySelectorAll(".main-card");
    const mainContainer = document.getElementById("main-cards-container");

    if (!mainCards.length || !mainContainer) return;

    mainCards.forEach(mainCard => {
        mainCard.addEventListener("click", function(e) {
            e.stopPropagation();
            
            const subSection = this.dataset.subSection;
            const isActive = this.classList.contains("active");
            
            // Hide ALL main cards & subcontainers
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

    // Flip cards in sub-containers
    document.querySelectorAll(".sub-container .mode-card").forEach(card => {
        if (card) {
            card.addEventListener("click", function(e) {
                e.stopPropagation();
                this.classList.toggle("flipped");
            });
        }
    });
}

// ========================================
// MARK DONE BUTTONS (GEMS SYSTEM)
// ========================================
async function initMarkDoneButtons() {
    document.querySelectorAll("#markDoneBtn").forEach(btn => {
        if (btn) {
            btn.addEventListener("click", async function(e) {
                e.preventDefault();
                
                try {
                    // 1. Add gems (awaited)
                    await addGems(5);
                    
                    // 2. IMMEDIATE visual feedback
                    const originalText = this.innerHTML;
                    this.innerHTML = "✅ +5 GEMS!";
                    this.style.background = "#218838";
                    this.style.transform = "scale(0.95)";
                    this.disabled = true;
                    
                    // 3. Update gem count from localStorage
                    const playerData = JSON.parse(localStorage.getItem("player") || "{}");
                    const gemCountEl = this.closest(".mark-done-section")?.querySelector("#gemCount");
                    
                    if (gemCountEl) {
                        gemCountEl.textContent = playerData.gems || 0;
                    }
                    
                    // 4. Reset button after celebration
                    setTimeout(() => {
                        this.innerHTML = originalText;
                        this.disabled = false;
                        this.style.background = "";
                        this.style.transform = "scale(1)";
                    }, 2000);
                    
                } catch (error) {
                    console.error("Mark done failed:", error);
                    this.innerHTML = "❌ Try again";
                    setTimeout(() => { 
                        this.innerHTML = "+5 GEMS"; 
                    }, 1500);
                }
            });
        }
    });
}


