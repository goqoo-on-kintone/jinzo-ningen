const qs = require('qs')

const getCreateUrl = (domain, appId, options = {}) => {
  const URIparams = toURIEncodedParams(options.queryParams)
  return `https://${domain}/k/${appId}/edit${URIparams}`
}

const getIndexUrl = (domain, appId, options = {}) => {
  const URIParams = toURIEncodedParams(options.queryParams)
  return `https://${domain}/k/${appId}/${URIParams}`
}

const toURIEncodedParams = obj => qs.stringify(obj, { addQueryPrefix: true })

module.exports = { getCreateUrl, getIndexUrl }
