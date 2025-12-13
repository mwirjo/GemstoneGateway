// mineral.js - Single mineral detail controller
import { getParam } from "./utils.mjs";
import mineralDetails from "./mineralDetails.mjs";
import MineralServices from "./mineralServices.mjs";
import { initPlayerHeader } from "./playerLoader";

initPlayerHeader();

const category = getParam("category") || "elements";
const dataSource = new MineralServices(category);
const mineralID = getParam("mineral");  // number in URL: ?mineral=19

const mineral = new mineralDetails(mineralID, dataSource, category);
mineral.init();
