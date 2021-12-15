const { rcFile } = require('rc-config-loader')
const ENV = 'development'

const ginuerc = rcFile('ginue', { cwd: `${__dirname}/test` }).config
const params = ginuerc.env && ginuerc.env[ENV]
if (!params) throw new Error(`invalid env: ${ENV}`)

module.exports = params
