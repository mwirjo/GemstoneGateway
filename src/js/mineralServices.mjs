// mineralServices.mjs
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export { googleClientId };

async function convertToJson(res) {
  const data = await res.json();
  if (res.ok) return data;
  throw { name: "servicesError", message: data };
}

export default class MineralServices {
  constructor(category) {
    this.category = category || "elements";
  }

  async getMinerals(category) {
    if (category) this.category = category;
    const jsonPath = `../json/${this.category}.json`;
    console.log("🔍 FETCHING:", jsonPath);

    const response = await fetch(jsonPath);

    const responseClone = response.clone();
    const textContent = await responseClone.text();
    console.log("📊 STATUS:", response.status);
    console.log("📄 FIRST 100 CHARS:", textContent.substring(0, 100));

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${jsonPath}`);
    const data = await convertToJson(response);
    return data.minerals || [];
  }

  async findMineralByNumber(number) {
    const minerals = await this.getMinerals();
    return minerals.find(m => m.number == number) || null;
  }

  async findMineralByID(nameSlug) {
    const minerals = await this.getMinerals();
    return minerals.find(
      m => m.name.toLowerCase().replace(/\s+/g, "-") === nameSlug
    ) || null;
  }
}
