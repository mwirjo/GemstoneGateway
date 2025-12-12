import { getPlayer, updateHeader, savePlayer } from "./playerLoader.js";
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Load player FIRST
  const user = getPlayer();
  if (user) updateHeader(user);

});

