exports.tools = [
  {
    name: "generate_disaster_scenario",
    description: "Generate a simulated catastrophe event using NOAA baseline + AI logic.",
    input_schema: {
      type: "object",
      properties: {
        lat: { type: "number" },
        lon: { type: "number" },
        type: { type: "string" }
      },
      required: ["lat", "lon", "type"]
    }
  },
  {
    name: "validate_zip_users",
    description: "Return list of users in Firestore matching ZIP codes.",
    input_schema: {
      type: "object",
      properties: {
        zipCodes: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["zipCodes"]
    }
  }
];
