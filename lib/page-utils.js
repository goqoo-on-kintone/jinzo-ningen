const { formatLocalDate, parseLocalDateString } = require('./date-utils')
const { getCreateUrl } = require('./url-utils')

const WAIT_FOR_ACTION_MS = 5000
const WAIT_FOR_MOMENT_MS = 300

const getSingleLineText = async (page, fieldLabel) => {
  const inputs = await getInputs(page, fieldLabel)
  return inputs[0].value
}

const getMultiLineText = async (page, fieldLabel) => {
  const inputs = await getInputs(page, fieldLabel)
  return inputs[0].value
}

const getNumber = async (page, fieldLabel) => {
  const inputs = await getInputs(page, fieldLabel)
  return Number(inputs[0].value)
}

const getDate = async (page, fieldLabel) => {
  const dateStr = await getDateAsString(page, fieldLabel)
  return parseLocalDateString(dateStr)
}

const getDateAsString = async (page, fieldLabel) => {
  const fieldId = await getFieldIdFromLabel(page, fieldLabel)
  return page.evaluate(
    fieldId => document.querySelector(`.field-${fieldId} input.input-date-text-cybozu`).value,
    fieldId
  )
}

const getTime = async (page, fieldLabel, baseDate) => {
  const timeStr = await getTimeAsString(page, fieldLabel)
  const dateStr = formatLocalDate(baseDate || new Date(), 'YYYY-MM-DD')
  return parseLocalDateString(`${dateStr.substring(0, 10)} ${timeStr}`)
}

const getTimeAsString = async (page, fieldLabel) => {
  const fieldId = await getFieldIdFromLabel(page, fieldLabel)
  return page.evaluate(
    fieldId => document.querySelector(`.field-${fieldId} input.input-time-text-cybozu`).value,
    fieldId
  )
}

const getDateTime = async (page, fieldLabel) => {
  const dateTimeStr = await getDateTimeAsString(page, fieldLabel)
  return parseLocalDateString(dateTimeStr)
}

const getDateTimeAsString = async (page, fieldLabel) => {
  const dateStr = await getDateAsString(page, fieldLabel)
  const timeStr = await getTimeAsString(page, fieldLabel)
  return `${dateStr} ${timeStr}`
}

const getInputValues = async (page, fieldLabels) => {
  const values = []
  for (const fieldLabel of fieldLabels) {
    const inputs = await getInputs(page, fieldLabel)
    if (inputs.length > 0) values.push(inputs[0].value)
  }
  return values
}

const isRadioButtonSelected = async (page, fieldLabel, optionLabel) => {
  const inputs = await getInputs(page, fieldLabel)
  return inputs.some(input => input.value === optionLabel && input.checked)
}

const isCheckBoxChecked = async (page, fieldLabel, optionLabels) => {
  const result = []
  for (const optionLabel of optionLabels) {
    const checkBox = await getCheckBoxFromLabel(page, fieldLabel, optionLabel)
    result.push(checkBox.checked)
  }
  return result
}

const isDropdownSelected = async (page, fieldLabel, optionLabel) => {
  const fieldId = await getFieldIdFromLabel(page, fieldLabel)
  return page.evaluate(
    ({ fieldId, optionLabel }) => {
      const node = document.querySelector(`.field-${fieldId} .gaia-argoui-select-label`)
      return node && node.textContent === optionLabel
    },
    { fieldId, optionLabel }
  )
}

const isMultiSelectSelected = async (page, fieldLabel, optionLabels) => {
  const fieldId = await getFieldIdFromLabel(page, fieldLabel)
  return page.evaluate(
    ({ fieldId, optionLabels }) => {
      const nodes = document.querySelectorAll(`.field-${fieldId} .multipleselect-cybozu div.goog-menuitem`)
      const checkedMap = Array.from(nodes).reduce((map, node) => {
        const optionLabel = node.querySelector('div').textContent
        const checked = node.getAttribute('aria-checked') === 'true'
        return { ...map, [optionLabel]: checked }
      }, {})
      return optionLabels.map(optionLabel => checkedMap[optionLabel])
    },
    { fieldId, optionLabels }
  )
}

const isGroupOpened = async (page, fieldLabel) => {
  return getGroupStatus(page, fieldLabel, 'control-group-gaia-expanded')
}

const isGroupClosed = async (page, fieldLabel) => {
  return getGroupStatus(page, fieldLabel, 'control-group-gaia-collapsed')
}

const getGroupStatus = async (page, fieldLabel, className) => {
  const fieldId = await getFieldIdFromLabel(page, fieldLabel)
  return page.evaluate(
    ({ fieldId, className }) => {
      const node = document.querySelector(`.field-${fieldId}`)
      return node.className.includes(className)
    },
    { fieldId, className }
  )
}

const getCheckBoxFromLabel = async (page, fieldLabel, optionLabel) => {
  const fieldId = await getFieldIdFromLabel(page, fieldLabel)
  // チェックボックスオプションの input を取得する
  // オプションのラベルは input の属性ではなく input に for で紐付けられた label のテキストなので、
  // まず label を取得して対応するチェックボックスオプションを取得する
  const input = await page.evaluate(
    ({ fieldId, optionLabel }) => {
      const rootSelector = `.control-multiple_check-field-gaia.field-${fieldId}`
      const labels = document.querySelectorAll(`${rootSelector} label`)
      const label = Array.from(labels).find(label => label.textContent === optionLabel)
      if (!label) throw new Error(`Cannot find option labeled as '${fieldLabel}`)
      const input = document.querySelector(`${rootSelector} input[id="${label.htmlFor}"]`)
      return { id: input.id, checked: input.checked }
    },
    { fieldId, optionLabel }
  )
  return input
}

const getInputs = async (page, fieldLabel) => {
  const fieldId = await getFieldIdFromLabel(page, fieldLabel)
  const inputs = await page.evaluate(fieldId => {
    const nodes = document.querySelectorAll(`.field-${fieldId} input, .field-${fieldId} textarea`)
    return Array.from(nodes).map(node => {
      const { type, value, checked } = node
      return { type, value, checked }
    })
  }, fieldId)
  return inputs
}

const setInputValues = async (page, fieldLabelValueMap) => {
  for (const [fieldLabel, value] of Object.entries(fieldLabelValueMap)) {
    await setInputValue(page, fieldLabel, value)
  }
}

const setInputValue = async (page, fieldLabel, value) => {
  if (typeof value === 'string') {
    if (value.indexOf('\n') >= 0) {
      await setMultiLineText(page, fieldLabel, value)
    } else {
      await setSingleLineText(page, fieldLabel, value)
    }
  } else if (typeof value === 'number') {
    await setNumber(page, fieldLabel, value.toString())
  } else if (value instanceof Date) {
    await setDate(page, fieldLabel, value)
  }
}

const setSingleLineText = async (page, fieldLabel, text) => {
  await typeInputTexts(page, 'input-text-cybozu', fieldLabel, text)
}

const setMultiLineText = async (page, fieldLabel, text) => {
  await typeInputTexts(page, 'textarea-cybozu', fieldLabel, text.split('\n'))
}

const setNumber = async (page, fieldLabel, number) => {
  await typeInputTexts(page, 'input-number-cybozu', fieldLabel, number.toString())
}

const setDate = async (page, fieldLabel, date) => {
  await typeInputTexts(page, 'input-date-text-cybozu', fieldLabel, formatLocalDate(date, 'YYYY-MM-DD'))
}

const setTime = async (page, fieldLabel, date) => {
  // 時刻はクリック → 時入力 → タブ → 分入力
  const fieldId = await getFieldIdFromLabel(page, fieldLabel)
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

const setDateTime = async (page, fieldLabel, date) => {
  await setDate(page, fieldLabel, date)
  await setTime(page, fieldLabel, date)
}

const typeInputTexts = async (page, inputSelector, fieldLabel, value) => {
  // input の change イベントを起動するために（直接 value を設定せず）キー操作で入力する
  // see: https://github.com/segmentio/nightmare/issues/810#issuecomment-389819641
  const fieldId = await getFieldIdFromLabel(page, fieldLabel)
  const selector = `.field-${fieldId} .${inputSelector}`
  const elementHandle = await page.$(selector)
  if (elementHandle) {
    // フィールドのテキストをキー操作でクリア see: https://github.com/segmentio/nightmare/issues/810#issuecomment-454993184
    await elementHandle.click({ clickCount: 3 })
    await elementHandle.press('Backspace')
    const lines = Array.isArray(value) ? value : [value]
    for (const [index, line] of lines.entries()) {
      await elementHandle.type(line)
      if (index < lines.length - 1) await elementHandle.press('Enter')
    }
  }
}

const selectRadioButton = async (page, fieldLabel, optionLabel) => {
  const fieldId = await getFieldIdFromLabel(page, fieldLabel)
  await page.evaluate(
    ({ fieldId, optionLabel }) => {
      const nodes = document.querySelectorAll(`.field-${fieldId} .input-radio-item-cybozu input`)
      const node = Array.from(nodes).find(node => node.value === optionLabel)
      if (node && !node.getAttribute('checked')) node.click()
    },
    { fieldId, optionLabel }
  )
}

const selectDropdown = async (page, fieldLabel, optionLabel) => {
  // ドロップダウンの項目はフィールド本体とは別要素として display: none で配置されている
  // まずフィールドをクリック
  const fieldId = await getFieldIdFromLabel(page, fieldLabel)
  await page.click(`.field-${fieldId} .gaia-argoui-select`)
  // 表示された項目から選択したい項目を検索してそれをクリック
  const dropdownItemId = await page.evaluate(optionLabel => {
    const items = document.querySelectorAll('ul.gaia-argoui-selectmenu:not([style*="display: none"]) .goog-option')
    const selectedItem = Array.from(items).find(item => {
      return item.querySelector('.goog-menuitem-content').textContent === optionLabel
    })
    return selectedItem.id
  }, optionLabel)
  await page.click(`[id="${dropdownItemId}"]`)
}

const checkCheckBox = async (page, fieldLabel, optionLabelCheckMap) => {
  for (const [optionLabel, checked] of Object.entries(optionLabelCheckMap)) {
    const checkBox = await getCheckBoxFromLabel(page, fieldLabel, optionLabel)
    if (checkBox.checked !== checked) {
      await page.click(`input[id="${checkBox.id}"]`)
    }
  }
}

const selectMultiSelect = async (page, fieldLabel, optionLabelSelectMap) => {
  const fieldId = await getFieldIdFromLabel(page, fieldLabel)
  // node.click() では反応しないので要素のIDを取得しておき page.click で要素指定してクリック
  const ids = await page.evaluate(
    ({ fieldId, optionLabelSelectMap }) => {
      const nodes = document.querySelectorAll(`.field-${fieldId} .multipleselect-cybozu div.goog-menuitem`)
      return Array.from(nodes).reduce((ids, node) => {
        const selected = node.getAttribute('aria-checked') === 'true'
        const optionLabel = node.querySelector('div.goog-menuitem-content').textContent
        if (selected !== optionLabelSelectMap[optionLabel]) {
          ids.push(node.getAttribute('id'))
        }
        return ids
      }, [])
    },
    { fieldId, optionLabelSelectMap }
  )
  for (const id of ids) await page.click(`[id="${id}"]`)
}

const setLookup = async (page, fieldLabel, value) => {
  const text = typeof value === 'number' ? value.toString() : value
  // 値をクリアして取得ボタンをクリックすると選択ウィンドウが表示されるため、クリアはさせない
  if (!text) return false
  await setInputValue(page, fieldLabel, text)
  const fieldId = await getFieldIdFromLabel(page, fieldLabel)
  const [handle] = await Promise.all([
    page.waitForSelector('.input-error-cybozu, .validator-valid-cybozu', { timeout: WAIT_FOR_ACTION_MS }),
    page.click(`.field-${fieldId} button.input-lookup-gaia`),
  ])
  return handle ? (await handle.getProperty('className')) === 'validator-valid-cybozu' : false
}

const showLookup = async (page, fieldLabel, options) => {
  await setInputValue(page, fieldLabel, '')
  const fieldId = await getFieldIdFromLabel(page, fieldLabel)
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

const openGroup = async (page, fieldLabel) => {
  await toggleGroup(page, fieldLabel, 'control-group-gaia-collapsed')
}

const closeGroup = async (page, fieldLabel) => {
  await toggleGroup(page, fieldLabel, 'control-group-gaia-expanded')
}

const toggleGroup = async (page, fieldLabel, className) => {
  const fieldId = await getFieldIdFromLabel(page, fieldLabel)
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

const getDetailSingleLineText = async (page, fieldLabel) => {
  const fieldId = await getFieldIdFromLabel(page, fieldLabel)
  const value = await page.evaluate(fieldId => {
    const node = document.querySelector(`.value-${fieldId} span`)
    return node.textContent
  }, fieldId)
  return value
}

const getDetailSingleLineTexts = async (page, fieldLabels) => {
  const values = []
  for (const fieldLabel of fieldLabels) {
    values.push(await getDetailSingleLineText(page, fieldLabel))
  }
  return values
}

const getDetailMultiLineText = async (page, fieldLabel) => {
  const fieldId = await getFieldIdFromLabel(page, fieldLabel)
  const textLines = await page.evaluate(fieldId => {
    const nodeList = document.querySelectorAll(`.control-multiple_line_text-field-gaia .value-${fieldId} div`)
    return Array.from(nodeList)
      .map(node => node.textContent)
      .join('\n')
  }, fieldId)
  return textLines
}

const getDetailMultiSelectTexts = async (page, fieldLabel) => {
  const fieldId = await getFieldIdFromLabel(page, fieldLabel)
  return page.evaluate(
    ({ fieldId }) => {
      const nodes = document.querySelectorAll(`.field-${fieldId} span div`)
      return Array.from(nodes).map(node => node.textContent)
    },
    { fieldId }
  )
}

const getDetailNumber = async (page, fieldLabel) => {
  const value = await getDetailSingleLineText(page, fieldLabel)
  return Number(value)
}

const getDetailRadioButtonText = async (page, fieldLabel) => {
  return getDetailSingleLineText(page, fieldLabel)
}

const getDetailCheckBoxTexts = async (page, fieldLabel) => {
  const fieldId = await getFieldIdFromLabel(page, fieldLabel)
  const value = await page.evaluate(fieldId => {
    // グルーピングに使われている span をスキップ
    const nodes = document.querySelectorAll(`.value-${fieldId} span span`)
    return Array.from(nodes).map(node => node.textContent)
  }, fieldId)
  return value
}

const getDetailDropdownText = async (page, fieldLabel) => {
  return getDetailSingleLineText(page, fieldLabel)
}

const getDetailDate = async (page, fieldLabel) => {
  const dateStr = await getDetailSingleLineText(page, fieldLabel)
  return parseLocalDateString(dateStr)
}

const getDetailTime = async (page, fieldLabel, baseDate) => {
  const timeStr = await getDetailSingleLineText(page, fieldLabel)
  const dateStr = formatLocalDate(baseDate || new Date(), 'YYYY-MM-DD')
  return parseLocalDateString(`${dateStr.substring(0, 10)} ${timeStr}`)
}

const getDetailDateTime = async (page, fieldLabel) => {
  const dateStr = await getDetailSingleLineText(page, fieldLabel)
  return parseLocalDateString(dateStr)
}

const isDetailGroupOpened = async (page, fieldLabel) => {
  return isGroupOpened(page, fieldLabel)
}

const isDetailGroupClosed = async (page, fieldLabel) => {
  return isGroupClosed(page, fieldLabel)
}

const openDetailGroup = async (page, fieldLabel) => {
  await openGroup(page, fieldLabel)
}

const closeDetailGroup = async (page, fieldLabel) => {
  await closeGroup(page, fieldLabel)
}

const gotoCreatePage = async (page, domain, appId) => {
  const url = getCreateUrl(domain, appId)
  await page.goto(url, { waitUntil: 'networkidle2' })
}

let fieldMap

const getFieldIdFromLabel = async (page, fieldLabel) => {
  await setFieldMap()
  const item = Object.values(fieldMap).find(field => field.label === fieldLabel)
  if (!item) throw new Error(`Cannot find field labeled as '${fieldLabel}'`)
  return item.id
}

const getFieldLabelFromId = async (page, fieldId) => {
  await setFieldMap()
  const item = Object.values(fieldMap).find(field => field.id === fieldId)
  if (!item) throw new Error(`Cannot find field id is '${fieldId}'`)
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
    const fieldLabel = await getFieldLabelFromId(page, valueId)
    info[fieldLabel] = errorText
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
}
