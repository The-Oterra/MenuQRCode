const axios = require('axios');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed. Use POST.' }),
    };
  }

  try {
    const { repoOwner, repoName, imagePath, base64Content, commitMessage } = JSON.parse(event.body);

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'GitHub token not set in environment variables.' }),
      };
    }

    const githubApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${imagePath}`;

    // Check if the file exists to get its SHA
    let sha = undefined;
    try {
      const getRes = await axios.get(githubApiUrl, {
        headers: { Authorization: `token ${token}` },
      });
      sha = getRes.data.sha;
    } catch (err) {
      if (err.response?.status !== 404) {
        throw err; // only suppress 404 (file not found), others should fail
      }
    }

    // Prepare payload for PUT
    const putPayload = {
      message: commitMessage || `Update ${imagePath} via Netlify function`,
      content: base64Content,
    };

    if (sha) putPayload.sha = sha;

    // PUT to GitHub
    const putRes = await axios.put(githubApiUrl, putPayload, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: '✅ File uploaded/updated successfully!',
        path: imagePath,
        url: putRes.data.content?.download_url || null,
      }),
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({
        error: error.message,
        details: error.response?.data || 'Unknown error',
      }),
    };
  }
};
