const getCreateUrl = (domain, appId) => {
  return `https://${domain}/k/${appId}/edit`
}

const getIndexUrl = (domain, appId) => {
  return `https://${domain}/k/${appId}/`
}

module.exports = { getCreateUrl, getIndexUrl }
