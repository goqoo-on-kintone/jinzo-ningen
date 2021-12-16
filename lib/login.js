module.exports = async ({ domain, userName, password, basicAuthUserName, basicAuthPassword }) => {
  if (basicAuthUserName && basicAuthPassword) {
    page.authenticate({ username: basicAuthUserName, password: basicAuthPassword })
  }
  await page.goto(`https://${domain}/login`, { waitUntil: 'networkidle0' })
  await page.type('input[name=username]', userName)
  await page.type('input[name=password]', password)
  const submitButton = await page.$('input[type=submit]')
  await Promise.all([submitButton.click(), page.waitForNavigation()])

  const error = await page.$('.login-error-message')
  if (error) {
    console.error('kintone login failed.')
  } else {
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.click('a[class="service-slash"][href="/k/"]'),
    ])
    console.info(`Successfully logged into kintone as ${userName}`)
  }
}
