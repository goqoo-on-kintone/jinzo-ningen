const qs = require('qs')

const getCreateUrl = (domain, appId, options = {}) => {
  const URIparams = toURIEncodedParams(toParams(options))
  return `https://${domain}/k/${appId}/edit${URIparams}`
}

const getIndexUrl = (domain, appId, options = {}) => {
  const URIParams = toURIEncodedParams(toParams(options))
  return `https://${domain}/k/${appId}/${URIParams}`
}

const toParams = options => ({ ...(options.view ? { view: options.view } : {}), ...options.params })

const toURIEncodedParams = obj => qs.stringify(obj, { addQueryPrefix: true })

module.exports = { getCreateUrl, getIndexUrl }
