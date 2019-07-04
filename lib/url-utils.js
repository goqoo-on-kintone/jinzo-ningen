const getCreateUrl = (domain, appId, options = {}) => {
  const URIparams = toURIEncodedParams(toParams(options))
  return `https://${domain}/k/${appId}/edit${URIparams}`
}

const getIndexUrl = (domain, appId, options = {}) => {
  const URIParams = toURIEncodedParams(toParams(options))
  return `https://${domain}/k/${appId}/${URIParams}`
}

const toParams = options => ({ ...(options.view ? { view: options.view } : {}), ...options.params })

const toURIEncodedParams = obj => {
  const kv = Object.entries(obj).map(kv => kv.map(encodeURIComponent).join('='))
  return kv.length > 0 ? `?${kv.join('&')}` : ''
}

module.exports = { getCreateUrl, getIndexUrl }
