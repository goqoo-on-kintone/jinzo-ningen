const qs = require('qs')

const getCreateUrl = (domain, appId, options = {}) => {
  const queryString = toURIEncodedParams(options.queryParams)
  return `https://${domain}/k/${appId}/edit${queryString}`
}

const getIndexUrl = (domain, appId, options = {}) => {
  const queryString = toURIEncodedParams(options.queryParams)
  return `https://${domain}/k/${appId}/${queryString}`
}

const toURIEncodedParams = obj => qs.stringify(obj, { addQueryPrefix: true })

module.exports = { getCreateUrl, getIndexUrl }
