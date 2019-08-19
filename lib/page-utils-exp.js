// still in experiment
const {
  WAIT_FOR_MOMENT_MS,
  WAIT_FOR_ACTION_MS,
  setInputValue,
  getFieldIdFromCode,
  getDetailStatusText,
} = require('./page-utils')

const setLookup = async (fieldCode, value) => {
  const text = typeof value === 'number' ? value.toString() : value
  // 値をクリアして取得ボタンをクリックすると選択ウィンドウが表示されるため、クリアはさせない
  if (!text) return false
  await setInputValue(fieldCode, text)
  const fieldId = await getFieldIdFromCode(fieldCode)
  const [handle] = await Promise.all([
    page.waitForSelector('.input-error-cybozu, .validator-valid-cybozu', { timeout: WAIT_FOR_ACTION_MS }),
    page.click(`.field-${fieldId} button.input-lookup-gaia`),
  ])
  return handle ? (await handle.getProperty('className')) === 'validator-valid-cybozu' : false
}

const showLookup = async (fieldCode, items) => {
  await setInputValue(fieldCode, '')
  const fieldId = await getFieldIdFromCode(fieldCode)
  const [dialog] = await Promise.all([
    page.waitForSelector('.ocean-ui-dialog', { visible: true, timeout: WAIT_FOR_ACTION_MS }),
    page.click(`.field-${fieldId} button.input-lookup-gaia`),
  ])
  // 理由は分からないが、この wait がないとうまく動かない
  await page.waitFor(WAIT_FOR_MOMENT_MS)
  if (items && items.clickFirstButton && dialog) {
    const buttons = await dialog.$$('.button-simple-cybozu')
    await buttons[0].click()
  }
}

const pressDetailConfirmStatus = async () => {
  const statusText = await getDetailStatusText()
  const [elementHandle] = await Promise.all([
    page.waitForSelector('.gaia-app-statusbar-assigneepopup', { visible: true, timeout: WAIT_FOR_ACTION_MS }),
    page.click('.gaia-app-statusbar-action'),
  ])
  if (elementHandle) {
    await Promise.all([
      // 処理ステータスの文字列が書き換わるのを wait
      page.waitForFunction(
        `document.querySelector('.gaia-app-statusbar-state-label').textContent !== '${statusText}'`,
        {
          timeout: WAIT_FOR_ACTION_MS,
        }
      ),
      page.click('.gaia-app-statusbar-assigneepopup-ok'),
    ])
  }
}

const reload = async page => {
  await page.reload({ waitUntil: 'networkidle0' })
}

const waitForSelector = async (page, selector) => {
  return page.waitForSelector(selector, { timeout: WAIT_FOR_ACTION_MS })
}

const reloadAndWaitForSelector = async (page, selector) => {
  const [handle] = await Promise.all([
    page.waitForSelector(selector, { visible: true, timeout: WAIT_FOR_ACTION_MS }),
    page.reload(),
  ])
  return handle
}

const getCurrentRecordId = async () => {
  const recordId = await page.evaluate(async () => {
    return kintone.app.record.getId()
  })
  return recordId
}

module.exports = {
  setLookup,
  showLookup,
  pressDetailConfirmStatus,
  reload,
  waitForSelector,
  reloadAndWaitForSelector,
  getCurrentRecordId,
}
