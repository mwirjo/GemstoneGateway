import { getPlayer, updateHeader, savePlayer } from "./player_loader.js";
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Load player FIRST
  const user = getPlayer();
  if (user) updateHeader(user);

});

