const getCreateUrl = (domain, appId) => {
  return `https://${domain}/k/${appId}/edit`
}

const getIndexUrl = (domain, appId, viewId) => {
  return `https://${domain}/k/${appId}/${viewId ? `?view=${viewId}` : ''}`
}

module.exports = { getCreateUrl, getIndexUrl }
