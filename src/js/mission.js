const missions = [
  "Make learning minerals fun, interactive, and memorable.",
  "Empowering students to explore and master minerals through interactive learning.",
  "Transforming mineral study into an engaging and rewarding experience.",
  "Learn, practice, and enjoy minerals with instant feedback and gamified rewards."
];

// Select a random mission
const randomMission = missions[Math.floor(Math.random() * missions.length)];

// Display it
document.getElementById("mission-text").textContent = randomMission;
