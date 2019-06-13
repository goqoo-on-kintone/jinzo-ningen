module.exports = {
  login: require('./lib/login'),
  upload: require('./lib/upload'),
  deleteAll: require('./lib/delete'),
  ...require('./lib/page-utils'),
  ...require('./lib/url-utils'),
  ...require('./lib/data-utils'),
  ...require('./lib/date-utils'),
}
