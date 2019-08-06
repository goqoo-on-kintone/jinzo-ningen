const lib = require('../lib')
const path = require('path')
const fs = require('fs')
const util = require('util')
const { exportToCsv } = require('../lib/export-csv')
const { app, domain, username, password } = require('./config')

jest.setTimeout(60 * 1000)
/* eslint-disable no-console */
process.on('unhandledRejection', console.dir)

describe('#downloadFile', () => {
  let page, appId, fileName, downloadPath

  beforeAll(async () => {
    appId = app['jinzo-ningen-test']
    downloadPath = path.resolve()
    page = await global.__BROWSER__.newPage()
    await page.setViewport({ width: 1920, height: 980 })
    lib.setConsole(page)
    await lib.login(page, { domain, username, password })
  })

  it('ファイルが正常にダウンロードされたこと', async () => {
    fileName = await exportToCsv(page, domain, appId, {
      path: downloadPath,
      additionalColumns: ['作成者', '更新者'],
    })
    expect(fileName).toBeTruthy()
  })

  afterAll(async () => {
    const fullPath = `${downloadPath}/${fileName}`
    await util.promisify(fs.unlink)(fullPath)
  })
})
