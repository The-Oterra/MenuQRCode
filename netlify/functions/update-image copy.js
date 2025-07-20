const axios = require('axios');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { repoOwner, repoName, imagePath, base64Content, commitMessage } = JSON.parse(event.body);

    const token = process.env.GITHUB_TOKEN;
    if (!token) return { statusCode: 500, body: 'GitHub token not set' };

    // 1. Get current file SHA
    const getRes = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${imagePath}`, {
      headers: { Authorization: `token ${token}` },
    });
    const sha = getRes.data.sha;

    // 2. Update the file
    const putRes = await axios.put(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${imagePath}`, {
      message: commitMessage || `Update ${imagePath} via Netlify Function`,
      content: base64Content,
      sha: sha,
    }, {
      headers: { Authorization: `token ${token}` },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Image updated successfully', data: putRes.data }),
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ error: error.message, details: error.response?.data }),
    };
  }
};
