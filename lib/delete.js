require('colors')

const appRootUrl = (domain, appId, guestId) =>
  guestId ? `https://${domain}/k/guest/${guestId}/${appId}` : `https://${domain}/k/${appId}`

module.exports = async (browser, { domain, appId, guestId }) => {
  const page = await browser.newPage()
  await page.goto(`${appRootUrl(domain, appId, guestId)}/?view=20`, { waitUntil: 'networkidle2' })
  await page.click('div[title=オプション]')
  const deleteLink = await page.$('a[title=一括削除][aria-disabled=false]')
  if (deleteLink) {
    await deleteLink.click()
    await page.waitFor(1000)

    await page.click('button[name=delete]')
    await page.waitFor(1000)

    console.warn(`All data in app[${appId}] is deleted successful`)
  } else {
    console.error('Bulk delete is not valid'.bgRed)
  }
  await page.close()
}
