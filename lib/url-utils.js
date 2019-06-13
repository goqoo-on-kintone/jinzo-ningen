const getCreateUrl = (domain, appId) => {
  return `https://${domain}/k/${appId}/edit`
}

const getIndexUrl = (domain, appId) => {
  return `https://${domain}/k/${appId}/?view=20`
}

module.exports = { getCreateUrl, getIndexUrl }
