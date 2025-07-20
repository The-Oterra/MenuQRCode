const axios = require("axios");

exports.handler = async () => {
  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/The-Oterra/MenuQRCode/main/config/menu-config.json"
    );
    return {
      statusCode: 200,
      body: JSON.stringify(res.data),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    };
  } catch (error) {
    console.error("Error loading config:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Cannot load config" }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    };
  }
};
