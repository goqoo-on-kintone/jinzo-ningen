const path = require('path')

const appRootUrl = (domain, appId, guestId) =>
  guestId ? `https://${domain}/k/guest/${guestId}/${appId}` : `https://${domain}/k/${appId}`

const fileNameFromPath = filePath => filePath.replace(/^.*[\\\/]/, '')

const validate = async (domain, targetFileName) => {
  await page.goto(`https://${domain}/k/importInfo`, { waitUntil: 'networkidle2' })
  const tbody = await page.$('tbody.importinfo-list-body')
  const [tr] = await tbody.$$('tr')
  const tds = await tr.$$('td')
  const fileName = await page.evaluate(e => e.textContent, tds[3])
  const status = await page.evaluate(e => e.textContent, tds[4])
  const result = fileName === targetFileName && status === '完了'
  if (result) {
    console.warn(`file [${targetFileName}] upload successful`)
  } else {
    console.error(`file [${targetFileName}] upload failed`)
  }
}

module.exports = async ({ domain, appId, guestId }, filePath) => {
  await page.goto(`${appRootUrl(domain, appId, guestId)}/importRecord`, { waitUntil: 'networkidle2' })

  const fullPath = path.resolve(process.cwd(), filePath)
  const input = await page.$('input[type=file]')
  await input.uploadFile(fullPath)
  await page.waitFor(1000)

  await page.click('input#import-uploadForm-gaia')
  await page.waitFor(1000)

  await validate(domain, fileNameFromPath(filePath))
}
