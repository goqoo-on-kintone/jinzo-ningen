const path = require('path')

const appRootUrl = (domain, appId, guestId) =>
  guestId ? `https://${domain}/k/guest/${guestId}/${appId}` : `https://${domain}/k/${appId}`

const fileNameFromPath = filePath => filePath.replace(/^.*[\\\/]/, '')

const validate = async (domain, targetFileName) => {
  await page.goto(`https://${domain}/k/importInfo`, { waitUntil: 'networkidle0' })
  await page.waitForFunction(
    targetFileName => {
      const tbody = document.querySelector('tbody.importinfo-list-body')
      const [tr] = tbody.querySelectorAll('tr')
      const tds = tr.querySelectorAll('td')
      const fileName = tds[3].textContent
      const status = tds[4].textContent
      return fileName === targetFileName && status === '完了'
    },
    {},
    targetFileName
  )
}

module.exports = async ({ domain, appId, guestId }, filePath) => {
  await page.goto(`${appRootUrl(domain, appId, guestId)}/importRecord`, { waitUntil: 'networkidle2' })

  const fullPath = path.resolve(process.cwd(), filePath)
  const input = await page.$('input[type=file]')
  await input.uploadFile(fullPath)
  await page.waitForTimeout(1000)

  await page.click('input#import-uploadForm-gaia')
  await page.waitForTimeout(1000)

  await validate(domain, fileNameFromPath(filePath))
}
