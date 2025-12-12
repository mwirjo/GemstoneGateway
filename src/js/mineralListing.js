import { getParam } from "./utils.mjs";
import MineralServices from "./mineralServices.js";
import MineralList from "./mineralList.mjs";



const category = getParam("category") || "elements";
const dataSource = new MineralServices();
const element = document.querySelector("#minerals-grid");

if (element) {
  const listing = new MineralList(category, dataSource, element);
  listing.init();
} else {
  console.error("❌ #minerals-grid element not found");
}
