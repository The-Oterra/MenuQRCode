const axios = require("axios");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed. Use POST." }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "GitHub token not set in environment variables." }),
      };
    }

    const { repoOwner, repoName } = body;

    // 🔁 CONFIG MODE
    if (body.configUpdate) {
      const { menu, type, status } = body.configUpdate;
      const configPath = "config/menu-config.json";
      const configUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${configPath}`;

      // Get config.json from GitHub
      const getRes = await axios.get(configUrl, {
        headers: { Authorization: `token ${token}` },
      });

      const sha = getRes.data.sha;
      const configData = JSON.parse(Buffer.from(getRes.data.content, "base64").toString("utf8"));

      // Update config
      configData[menu] = { type, status };

      const updatedContent = Buffer.from(JSON.stringify(configData, null, 2)).toString("base64");

      // Push updated config.json
      const putRes = await axios.put(configUrl, {
        message: `Update config for ${menu}`,
        content: updatedContent,
        sha: sha,
      }, {
        headers: { Authorization: `token ${token}` },
      });

      return {
        statusCode: 200,
        body: JSON.stringify({ message: `✅ Config updated for ${menu}`, menu, data: putRes.data }),
      };
    }

    // 🔁 FILE UPLOAD MODE
    const { imagePath, base64Content, commitMessage } = body;
    const githubApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${imagePath}`;

    // Check if file exists (to get SHA)
    let sha;
    try {
      const getRes = await axios.get(githubApiUrl, {
        headers: { Authorization: `token ${token}` },
      });
      sha = getRes.data.sha;
    } catch (err) {
      if (err.response?.status !== 404) throw err;
    }

    const putPayload = {
      message: commitMessage || `Update ${imagePath} via Netlify function`,
      content: base64Content,
    };

    if (sha) putPayload.sha = sha;

    const putRes = await axios.put(githubApiUrl, putPayload, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "✅ File uploaded/updated successfully!",
        path: imagePath,
        url: putRes.data.content?.download_url || null,
      }),
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({
        error: error.message,
        details: error.response?.data || "Unknown error",
      }),
    };
  }
};
