const path = require('path')
require('colors')

const appRootUrl = (domain, appId, guestId) =>
  guestId ? `https://${domain}/k/guest/${guestId}/${appId}` : `https://${domain}/k/${appId}`

const fileNameFromPath = filePath => filePath.replace(/^.*[\\\/]/, '')

const validate = async (browser, domain, targetFileName) => {
  const page = await browser.newPage()
  await page.goto(`https://${domain}/k/importInfo`, { waitUntil: 'networkidle2' })
  const tbody = await page.$('tbody.importinfo-list-body')
  const tr = (await tbody.$$('tr'))[0]
  const tds = await tr.$$('td')
  const fileName = await page.evaluate(e => e.textContent, tds[3])
  const status = await page.evaluate(e => e.textContent, tds[4])
  const result = fileName === targetFileName && status === '完了'
  if (result) {
    console.warn(`file [${targetFileName}] upload successful`)
  } else {
    console.error(`file [${targetFileName}] upload failed`.bgRed)
  }
  await page.close()
}

module.exports = async (browser, { domain, appId, guestId }, filePath) => {
  const page = await browser.newPage()
  await page.goto(`${appRootUrl(domain, appId, guestId)}/importRecord`, { waitUntil: 'networkidle2' })

  const fullPath = path.resolve(process.cwd(), filePath)
  const input = await page.$('input[type=file]')
  await input.uploadFile(fullPath)
  await page.waitFor(1000)

  await page.click('input#import-uploadForm-gaia')
  await page.waitFor(1000)

  await page.close()
  await validate(browser, domain, fileNameFromPath(filePath))
}
