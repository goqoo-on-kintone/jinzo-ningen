require('colors')

module.exports = async (page, { domain, username, password }) => {
  await page.goto(`https://${domain}/login`)
  await page.type('input[name=username]', username)
  await page.type('input[name=password]', password)
  await (await page.$('input[type=submit]')).click()
  await page.waitForNavigation()

  const error = await page.$('.login-error-message')
  if (error) {
    console.error('kintone login failed.'.bgRed)
  } else {
    await page.goto(`https://${domain}/k/#/portal`, { waitUntil: 'networkidle2' })
  }
}
