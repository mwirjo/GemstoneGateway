// mineralServices.mjs
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export { googleClientId };

async function convertToJson(res) {
  const data = await res.json();
  if (res.ok) {
    return data;
  } else {
    throw { name: "servicesError", message: data };
  }
}

export default class MineralServices {
  constructor() {
    // No baseURL needed - uses relative paths
  }

  async getMinerals(category) {
  this.category = category;
  const jsonPath = `../json/${this.category}.json`;
  console.log("🔍 FETCHING:", jsonPath);
  
  const response = await fetch(jsonPath);
  
  // FIX: Clone response to read body twice
  const responseClone = response.clone();
  const textContent = await responseClone.text();
  console.log("📊 STATUS:", response.status);
  console.log("📄 FIRST 100 CHARS:", textContent.substring(0, 100));
  
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${jsonPath}`);
  const data = await convertToJson(response);
  return data.minerals || [];
}


  async findMineralByName(name) {
    // Use stored category or fallback
    const category = this.category || new URLSearchParams(window.location.search).get("category") || "elements";
    
    const minerals = await this.getMinerals(category);
    return minerals.find(m =>
      m.name.toLowerCase().replace(/\s+/g, "-") === name
    ) || null;
  }
}
