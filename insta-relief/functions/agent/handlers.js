const admin = require("firebase-admin");
const { getNOAABaseline } = require("../noaa");
const { generateAiScenario } = require("../aiScenario");
const { buildFinalDisaster } = require("../buildFinalDisaster");

exports.toolHandlers = {
  async generate_disaster_scenario({ lat, lon, type }) {
    const noaa = await getNOAABaseline(lat, lon);
    const ai = await generateAiScenario(noaa, type);
    return buildFinalDisaster(noaa, ai);
  },

  async validate_zip_users({ zipCodes }) {
    const db = admin.firestore();
    const users = [];

    for (const zip of zipCodes) {
      const snapshot = await db.collection("users").where("zip", "==", zip).get();
      snapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
    }

    return { count: users.length, users };
  }
};
