const { formatLocalDate, parseLocalDateString } = require('./date-utils')
const { getCreateUrl } = require('./url-utils')

const WAIT_FOR_ACTION_MS = 5000
const WAIT_FOR_MOMENT_MS = 300

const getSingleLineText = async (page, fieldCode) => {
  const inputs = await getInputs(page, fieldCode)
  return inputs[0].value
}

const getMultiLineText = async (page, fieldCode) => {
  const inputs = await getInputs(page, fieldCode)
  return inputs[0].value
}

const getNumber = async (page, fieldCode) => {
  const inputs = await getInputs(page, fieldCode)
  return Number(inputs[0].value)
}

const getDate = async (page, fieldCode) => {
  const dateStr = await getDateAsString(page, fieldCode)
  return parseLocalDateString(dateStr)
}

const getDateAsString = async (page, fieldCode) => {
  const fieldId = await getFieldIdFromCode(page, fieldCode)
  return page.evaluate(
    fieldId => document.querySelector(`.field-${fieldId} input.input-date-text-cybozu`).value,
    fieldId
  )
}

const getTime = async (page, fieldCode, baseDate) => {
  const timeStr = await getTimeAsString(page, fieldCode)
  const dateStr = formatLocalDate(baseDate || new Date(), 'YYYY-MM-DD')
  return parseLocalDateString(`${dateStr.substring(0, 10)} ${timeStr}`)
}

const getTimeAsString = async (page, fieldCode) => {
  const fieldId = await getFieldIdFromCode(page, fieldCode)
  return page.evaluate(
    fieldId => document.querySelector(`.field-${fieldId} input.input-time-text-cybozu`).value,
    fieldId
  )
}

const getDateTime = async (page, fieldCode) => {
  const dateTimeStr = await getDateTimeAsString(page, fieldCode)
  return parseLocalDateString(dateTimeStr)
}

const getDateTimeAsString = async (page, fieldCode) => {
  const dateStr = await getDateAsString(page, fieldCode)
  const timeStr = await getTimeAsString(page, fieldCode)
  return `${dateStr} ${timeStr}`
}

const getInputValues = async (page, fieldCodes) => {
  const values = []
  for (const fieldCode of fieldCodes) {
    const inputs = await getInputs(page, fieldCode)
    if (inputs.length > 0) values.push(inputs[0].value)
  }
  return values
}

const isRadioButtonSelected = async (page, fieldCode, option) => {
  const inputs = await getInputs(page, fieldCode)
  return inputs.some(input => input.value === option && input.checked)
}

const isCheckBoxChecked = async (page, fieldCode, options) => {
  const result = []
  for (const option of options) {
    const checkBox = await getCheckBoxFromLabel(page, fieldCode, option)
    result.push(checkBox.checked)
  }
  return result
}

const isDropdownSelected = async (page, fieldCode, option) => {
  const fieldId = await getFieldIdFromCode(page, fieldCode)
  return page.evaluate(
    ({ fieldId, option }) => {
      const node = document.querySelector(`.field-${fieldId} .gaia-argoui-select-label`)
      return node && node.textContent === option
    },
    { fieldId, option }
  )
}

const isMultiSelectSelected = async (page, fieldCode, options) => {
  const fieldId = await getFieldIdFromCode(page, fieldCode)
  return page.evaluate(
    ({ fieldId, options }) => {
      const nodes = document.querySelectorAll(`.field-${fieldId} .multipleselect-cybozu div.goog-menuitem`)
      const checkedMap = Array.from(nodes).reduce((map, node) => {
        const option = node.querySelector('div').textContent
        const checked = node.getAttribute('aria-checked') === 'true'
        return { ...map, [option]: checked }
      }, {})
      return options.map(option => checkedMap[option])
    },
    { fieldId, options }
  )
}

const isGroupOpened = async (page, fieldCode) => {
  return getGroupStatus(page, fieldCode, 'control-group-gaia-expanded')
}

const isGroupClosed = async (page, fieldCode) => {
  return getGroupStatus(page, fieldCode, 'control-group-gaia-collapsed')
}

const getGroupStatus = async (page, fieldCode, className) => {
  const fieldId = await getFieldIdFromCode(page, fieldCode)
  return page.evaluate(
    ({ fieldId, className }) => {
      const node = document.querySelector(`.field-${fieldId}`)
      return node.className.includes(className)
    },
    { fieldId, className }
  )
}

const getCheckBoxFromLabel = async (page, fieldCode, option) => {
  const fieldId = await getFieldIdFromCode(page, fieldCode)
  // チェックボックスオプションの input を取得する
  // オプションのラベルは input の属性ではなく input に for で紐付けられた label のテキストなので、
  // まず label を取得して対応するチェックボックスオプションを取得する
  const input = await page.evaluate(
    ({ fieldId, option }) => {
      const rootSelector = `.control-multiple_check-field-gaia.field-${fieldId}`
      const labels = document.querySelectorAll(`${rootSelector} label`)
      const label = Array.from(labels).find(label => label.textContent === option)
      if (!label) throw new Error(`Cannot find option labeled as '${fieldCode}`)
      const input = document.querySelector(`${rootSelector} input[id="${label.htmlFor}"]`)
      return { id: input.id, checked: input.checked }
    },
    { fieldId, option }
  )
  return input
}

const getInputs = async (page, fieldCode) => {
  const fieldId = await getFieldIdFromCode(page, fieldCode)
  const inputs = await page.evaluate(fieldId => {
    const nodes = document.querySelectorAll(`.field-${fieldId} input, .field-${fieldId} textarea`)
    return Array.from(nodes).map(node => {
      const { type, value, checked } = node
      return { type, value, checked }
    })
  }, fieldId)
  return inputs
}

const setInputValues = async (page, fieldCodeValueMap) => {
  for (const [fieldCode, value] of Object.entries(fieldCodeValueMap)) {
    await setInputValue(page, fieldCode, value)
  }
}

const setInputValue = async (page, fieldCode, value) => {
  if (typeof value === 'string') {
    if (value.indexOf('\n') >= 0) {
      await setMultiLineText(page, fieldCode, value)
    } else {
      await setSingleLineText(page, fieldCode, value)
    }
  } else if (typeof value === 'number') {
    await setNumber(page, fieldCode, value.toString())
  } else if (value instanceof Date) {
    await setDate(page, fieldCode, value)
  }
}

const setSingleLineText = async (page, fieldCode, text) => {
  await typeInputTexts(page, 'input-text-cybozu', fieldCode, text)
}

const setMultiLineText = async (page, fieldCode, text) => {
  await typeInputTexts(page, 'textarea-cybozu', fieldCode, text.split('\n'))
}

const setNumber = async (page, fieldCode, number) => {
  await typeInputTexts(page, 'input-number-cybozu', fieldCode, number.toString())
}

const setDate = async (page, fieldCode, date) => {
  await typeInputTexts(page, 'input-date-text-cybozu', fieldCode, formatLocalDate(date, 'YYYY-MM-DD'))
}

const setTime = async (page, fieldCode, date) => {
  // 時刻はクリック → 時入力 → タブ → 分入力
  const fieldId = await getFieldIdFromCode(page, fieldCode)
  const selector = `.field-${fieldId} input.input-time-text-cybozu`
  const elementHandle = await page.$(selector)
  if (elementHandle) {
    const dateStr = formatLocalDate(date, 'HHmm')
    await page.click(selector)
    await page.keyboard.type(dateStr.substring(0, 2))
    await page.keyboard.press('Tab')
    await page.keyboard.type(dateStr.substring(2, 4))
  }
}

const setDateTime = async (page, fieldCode, date) => {
  await setDate(page, fieldCode, date)
  await setTime(page, fieldCode, date)
}

const typeInputTexts = async (page, inputSelector, fieldCode, value) => {
  // input の change イベントを起動するために（直接 value を設定せず）キー操作で入力する
  // see: https://github.com/segmentio/nightmare/issues/810#issuecomment-389819641
  const fieldId = await getFieldIdFromCode(page, fieldCode)
  const selector = `.field-${fieldId} .${inputSelector}`
  const elementHandle = await page.$(selector)
  if (elementHandle) {
    // フィールドのテキストをキー操作でクリア see: https://github.com/segmentio/nightmare/issues/810#issuecomment-454993184
    // 複数行の場合はクリック3回で段落が選択されるので、中身がなくなるまで繰り返す
    while (await page.$eval(selector, element => element.value)) {
      await elementHandle.click({ clickCount: 3 })
      await elementHandle.press('Backspace')
    }
    const lines = Array.isArray(value) ? value : [value]
    for (const [index, line] of lines.entries()) {
      await elementHandle.type(line)
      if (index < lines.length - 1) await elementHandle.press('Enter')
    }
  }
}

const selectRadioButton = async (page, fieldCode, option) => {
  const fieldId = await getFieldIdFromCode(page, fieldCode)
  await page.evaluate(
    ({ fieldId, option }) => {
      const nodes = document.querySelectorAll(`.field-${fieldId} .input-radio-item-cybozu input`)
      const node = Array.from(nodes).find(node => node.value === option)
      node && node.click()
    },
    { fieldId, option }
  )
}

const selectDropdown = async (page, fieldCode, option) => {
  // ドロップダウンの項目はフィールド本体とは別要素として display: none で配置されている
  // まずフィールドをクリック
  const fieldId = await getFieldIdFromCode(page, fieldCode)
  await page.click(`.field-${fieldId} .gaia-argoui-select`)
  // 表示された項目から選択したい項目を検索してそれをクリック
  const dropdownItemId = await page.evaluate(option => {
    const items = document.querySelectorAll('ul.gaia-argoui-selectmenu:not([style*="display: none"]) .goog-option')
    const selectedItem = Array.from(items).find(item => {
      return item.querySelector('.goog-menuitem-content').textContent === option
    })
    return selectedItem.id
  }, option)
  await page.click(`[id="${dropdownItemId}"]`)
}

const checkCheckBox = async (page, fieldCode, optionCheckMap) => {
  for (const [option, checked] of Object.entries(optionCheckMap)) {
    const checkBox = await getCheckBoxFromLabel(page, fieldCode, option)
    if (checkBox.checked !== checked) {
      await page.click(`input[id="${checkBox.id}"]`)
    }
  }
}

const selectMultiSelect = async (page, fieldCode, optionSelectMap) => {
  const fieldId = await getFieldIdFromCode(page, fieldCode)
  // node.click() では反応しないので要素のIDを取得しておき page.click で要素指定してクリック
  const ids = await page.evaluate(
    ({ fieldId, optionSelectMap }) => {
      const nodes = document.querySelectorAll(`.field-${fieldId} .multipleselect-cybozu div.goog-menuitem`)
      return Array.from(nodes).reduce((ids, node) => {
        const selected = node.getAttribute('aria-checked') === 'true'
        const option = node.querySelector('div.goog-menuitem-content').textContent
        if (selected !== optionSelectMap[option]) {
          ids.push(node.getAttribute('id'))
        }
        return ids
      }, [])
    },
    { fieldId, optionSelectMap }
  )
  for (const id of ids) await page.click(`[id="${id}"]`)
}

const setLookup = async (page, fieldCode, value) => {
  const text = typeof value === 'number' ? value.toString() : value
  // 値をクリアして取得ボタンをクリックすると選択ウィンドウが表示されるため、クリアはさせない
  if (!text) return false
  await setInputValue(page, fieldCode, text)
  const fieldId = await getFieldIdFromCode(page, fieldCode)
  const [handle] = await Promise.all([
    page.waitForSelector('.input-error-cybozu, .validator-valid-cybozu', { timeout: WAIT_FOR_ACTION_MS }),
    page.click(`.field-${fieldId} button.input-lookup-gaia`),
  ])
  return handle ? (await handle.getProperty('className')) === 'validator-valid-cybozu' : false
}

const showLookup = async (page, fieldCode, options) => {
  await setInputValue(page, fieldCode, '')
  const fieldId = await getFieldIdFromCode(page, fieldCode)
  const [dialog] = await Promise.all([
    page.waitForSelector('.ocean-ui-dialog', { visible: true, timeout: WAIT_FOR_ACTION_MS }),
    page.click(`.field-${fieldId} button.input-lookup-gaia`),
  ])
  // 理由は分からないが、この wait がないとうまく動かない
  await page.waitFor(WAIT_FOR_MOMENT_MS)
  if (options && options.clickFirstButton && dialog) {
    const buttons = await dialog.$$('.button-simple-cybozu')
    await buttons[0].click()
  }
}

const openGroup = async (page, fieldCode) => {
  await toggleGroup(page, fieldCode, 'control-group-gaia-collapsed')
}

const closeGroup = async (page, fieldCode) => {
  await toggleGroup(page, fieldCode, 'control-group-gaia-expanded')
}

const toggleGroup = async (page, fieldCode, className) => {
  const fieldId = await getFieldIdFromCode(page, fieldCode)
  await page.evaluate(
    ({ fieldId, className }) => {
      const node = document.querySelector(`.field-${fieldId}`)
      if (node.className.includes(className)) {
        node.querySelector('span[role=button]').click()
      }
    },
    { fieldId, className }
  )
}

const pressSaveAndWaitForDetailScreen = async page => {
  try {
    const [handle] = await Promise.all([
      page.waitForSelector('.showlayout-gaia', { timeout: WAIT_FOR_ACTION_MS }),
      page.click('.gaia-argoui-app-edit-buttons button[class$="-save"]'),
    ])
    return handle
  } catch (error) {
    const errorInfo = await getInputErrorInfo(page)
    console.error(errorInfo)
    throw new Error(error)
  }
}

const pressEditAndWaitForEditScreen = async page => {
  const [handle] = await Promise.all([
    page.waitForSelector('.editablelayout-gaia', { timeout: WAIT_FOR_ACTION_MS }),
    page.click('.gaia-argoui-app-toolbar a.gaia-argoui-app-menu-edit'),
  ])
  return handle
}

const pressSaveAndGetErrorText = async page => {
  await Promise.all([
    page.waitForSelector('.notifier-error-cybozu', { visible: true, timeout: WAIT_FOR_ACTION_MS }),
    page.click('.gaia-argoui-app-edit-buttons button[class$="-save"]'),
  ])
  const errorText = await getNotifierBodyText(page)
  // エラー通知を閉じる
  await page.click('.notifier-remove-cybozu')
  return errorText
}

const getDetailSingleLineText = async (page, fieldCode) => {
  const fieldId = await getFieldIdFromCode(page, fieldCode)
  const value = await page.evaluate(fieldId => {
    const node = document.querySelector(`.value-${fieldId} span`)
    return node.textContent
  }, fieldId)
  return value
}

const getDetailSingleLineTexts = async (page, fieldCodes) => {
  const values = []
  for (const fieldCode of fieldCodes) {
    values.push(await getDetailSingleLineText(page, fieldCode))
  }
  return values
}

const getDetailMultiLineText = async (page, fieldCode) => {
  const fieldId = await getFieldIdFromCode(page, fieldCode)
  const textLines = await page.evaluate(fieldId => {
    const nodeList = document.querySelectorAll(`.control-multiple_line_text-field-gaia .value-${fieldId} div`)
    return Array.from(nodeList)
      .map(node => node.textContent)
      .join('\n')
  }, fieldId)
  return textLines
}

const getDetailMultiSelectTexts = async (page, fieldCode) => {
  const fieldId = await getFieldIdFromCode(page, fieldCode)
  return page.evaluate(
    ({ fieldId }) => {
      const nodes = document.querySelectorAll(`.field-${fieldId} span div`)
      return Array.from(nodes).map(node => node.textContent)
    },
    { fieldId }
  )
}

const getDetailNumber = async (page, fieldCode) => {
  const value = await getDetailSingleLineText(page, fieldCode)
  return Number(value)
}

const getDetailRadioButtonText = async (page, fieldCode) => {
  return getDetailSingleLineText(page, fieldCode)
}

const getDetailCheckBoxTexts = async (page, fieldCode) => {
  const fieldId = await getFieldIdFromCode(page, fieldCode)
  const value = await page.evaluate(fieldId => {
    // グルーピングに使われている span をスキップ
    const nodes = document.querySelectorAll(`.value-${fieldId} span span`)
    return Array.from(nodes).map(node => node.textContent)
  }, fieldId)
  return value
}

const getDetailDropdownText = async (page, fieldCode) => {
  return getDetailSingleLineText(page, fieldCode)
}

const getDetailDate = async (page, fieldCode) => {
  const dateStr = await getDetailSingleLineText(page, fieldCode)
  return parseLocalDateString(dateStr)
}

const getDetailTime = async (page, fieldCode, baseDate) => {
  const timeStr = await getDetailSingleLineText(page, fieldCode)
  const dateStr = formatLocalDate(baseDate || new Date(), 'YYYY-MM-DD')
  return parseLocalDateString(`${dateStr.substring(0, 10)} ${timeStr}`)
}

const getDetailDateTime = async (page, fieldCode) => {
  const dateStr = await getDetailSingleLineText(page, fieldCode)
  return parseLocalDateString(dateStr)
}

const isDetailGroupOpened = async (page, fieldCode) => {
  return isGroupOpened(page, fieldCode)
}

const isDetailGroupClosed = async (page, fieldCode) => {
  return isGroupClosed(page, fieldCode)
}

const openDetailGroup = async (page, fieldCode) => {
  await openGroup(page, fieldCode)
}

const closeDetailGroup = async (page, fieldCode) => {
  await closeGroup(page, fieldCode)
}

const pressDetailConfirmStatus = async page => {
  const statusText = await getDetailStatusText(page)
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

const getDetailStatusText = async page => {
  return page.evaluate(() => document.querySelector('span.gaia-app-statusbar-state-label').textContent)
}

const gotoCreatePage = async (page, domain, appId) => {
  const url = getCreateUrl(domain, appId)
  await page.goto(url, { waitUntil: 'networkidle2' })
}

let fieldMap

const getFieldCodeFromLabel = async (page, fieldLabel) => {
  await setFieldMap()
  const item = Object.values(fieldMap).find(field => field.label === fieldLabel)
  if (!item) throw new Error(`Cannot find field labeled as '${fieldLabel}'`)
  return item.var
}

const getFieldIdFromCode = async (page, fieldCode) => {
  await setFieldMap()
  const item = Object.values(fieldMap).find(field => field.var === fieldCode)
  if (!item) throw new Error(`Cannot find field with code: '${fieldCode}'`)
  return item.id
}

const getFieldLabelFromId = async (page, fieldId) => {
  await setFieldMap()
  const item = Object.values(fieldMap).find(field => field.id === fieldId)
  if (!item) throw new Error(`Cannot find field with id: '${fieldId}'`)
  return item.label
}

const setFieldMap = async () => {
  if (!fieldMap) {
    const map = await page.evaluate(async () => {
      return cybozu.data.page.FORM_DATA.schema.table.fieldList
    })
    fieldMap = map
  }
}

const getCurrentRecordId = async page => {
  const recordId = await page.evaluate(async () => {
    return kintone.app.record.getId()
  })
  return recordId
}

const getNotifierBodyText = async page => {
  const value = await page.evaluate(async () => {
    const item = document.querySelector('.notifier-body-cybozu li')
    return item.textContent
  })
  return value
}

const getInputErrorInfo = async page => {
  const rawInfo = await page.evaluate(() => {
    const nodes = document.querySelectorAll('.input-error-cybozu')
    return Array.from(nodes).reduce((map, node) => {
      const errorText = node.textContent
      const valueNode = node.closest('.control-value-gaia')
      const valueId = valueNode.className.match(/value-(\d+)/)[1]
      return { ...map, [valueId]: errorText }
    }, {})
  })
  const info = {}
  for (const [valueId, errorText] of Object.entries(rawInfo)) {
    const fieldCode = await getFieldLabelFromId(page, valueId)
    info[fieldCode] = errorText
  }
  return info
}

const setConsole = page => {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(msg.text())
    } else {
      console.warn(msg.text())
    }
  })
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

const waitForMoment = async page => {
  await page.waitFor(WAIT_FOR_MOMENT_MS)
}

module.exports = {
  getSingleLineText,
  getMultiLineText,
  getNumber,
  getDate,
  getDateAsString,
  getTime,
  getTimeAsString,
  getDateTime,
  getDateTimeAsString,
  isRadioButtonSelected,
  isCheckBoxChecked,
  isDropdownSelected,
  isMultiSelectSelected,
  isGroupOpened,
  isGroupClosed,
  getInputValues,
  setSingleLineText,
  setMultiLineText,
  setNumber,
  setDate,
  setTime,
  setDateTime,
  selectRadioButton,
  selectDropdown,
  checkCheckBox,
  selectMultiSelect,
  showLookup,
  setLookup,
  setInputValue,
  setInputValues,
  openGroup,
  closeGroup,
  getDetailSingleLineText,
  getDetailSingleLineTexts,
  getDetailMultiLineText,
  getDetailNumber,
  getDetailRadioButtonText,
  getDetailCheckBoxTexts,
  getDetailMultiSelectTexts,
  getDetailDropdownText,
  getDetailDate,
  getDetailTime,
  getDetailDateTime,
  isDetailGroupOpened,
  isDetailGroupClosed,
  openDetailGroup,
  closeDetailGroup,
  pressDetailConfirmStatus,
  getDetailStatusText,
  gotoCreatePage,
  getCurrentRecordId,
  getNotifierBodyText,
  pressSaveAndGetErrorText,
  pressSaveAndWaitForDetailScreen,
  pressEditAndWaitForEditScreen,
  waitForSelector,
  waitForMoment,
  reload,
  reloadAndWaitForSelector,
  setConsole,
  getFieldCodeFromLabel,
}
