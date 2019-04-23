const axios = require('axios');
const { GITHUB_TOKEN } = process.env;

module.exports.process = async function(message) {
  const response = await axios.request({
    url: 'https://api.github.com/search/issues\?q\=+type:pr+org:simplisafe+state:open+review-requested:dpurrington',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}` },
    method: 'GET',
  });

  return response.data.items.map(i => i.pull_request.html_url).join("\n");
};

