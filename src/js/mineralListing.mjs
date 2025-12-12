// mineral.js - FIXED
import { getParam } from "./utils.mjs";
import MineralServices from "./mineralServices.mjs";
import MineralList from "./mineralList.mjs";

const category = getParam("category") || "elements";
const dataSource = new MineralServices(category);  // ✅ PASS category!
const element = document.querySelector("#minerals-grid");

if (element) {
  const listing = new MineralList(category, dataSource, element);
  listing.init();
} else {
  console.error("❌ #minerals-grid element not found");
}
