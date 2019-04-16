require('colors')

module.exports = async (browser, { domain, username, password }) => {
  const page = await browser.newPage()
  await page.goto(`https://${domain}/login`)
  await page.type('input[name=username]', username)
  await page.type('input[name=password]', password)
  await (await page.$('input[type=submit]')).click()
  await page.waitForNavigation();
  
  const error = await page.$('.login-error-message')
  if (error) {
    console.log('Kintone login failed'.bgRed)
  } else {
    console.log('Kintone login successful')
  }
}
