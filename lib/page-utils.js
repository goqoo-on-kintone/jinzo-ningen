const { formatLocalDate, parseLocalDateString } = require('./date-utils')
const { getCreateUrl, getIndexUrl } = require('./url-utils')

const WAIT_FOR_ACTION_MS = 5000
const WAIT_FOR_MOMENT_MS = 300

const getSingleLineText = async fieldCode => {
  const inputs = await getInputs(fieldCode)
  return inputs[0].value
}

const getMultiLineText = async fieldCode => {
  const inputs = await getInputs(fieldCode)
  return inputs[0].value
}

const getNumber = async fieldCode => {
  const inputs = await getInputs(fieldCode)
  return Number(inputs[0].value)
}

const getDate = async fieldCode => {
  const dateStr = await getDateAsString(fieldCode)
  return parseLocalDateString(dateStr)
}

const getDateAsString = async fieldCode => {
  const fieldId = await getFieldIdFromCode(fieldCode)
  return page.evaluate(
    fieldId => document.querySelector(`.field-${fieldId} input.input-date-text-cybozu`).value,
    fieldId
  )
}

const getTime = async (fieldCode, baseDate) => {
  const timeStr = await getTimeAsString(fieldCode)
  const dateStr = formatLocalDate(baseDate || new Date(), 'YYYY-MM-DD')
  return parseLocalDateString(`${dateStr.substring(0, 10)} ${timeStr}`)
}

const getTimeAsString = async fieldCode => {
  const fieldId = await getFieldIdFromCode(fieldCode)
  return page.evaluate(
    fieldId => document.querySelector(`.field-${fieldId} input.input-time-text-cybozu`).value,
    fieldId
  )
}

const getDateTime = async fieldCode => {
  const dateTimeStr = await getDateTimeAsString(fieldCode)
  return parseLocalDateString(dateTimeStr)
}

const getDateTimeAsString = async fieldCode => {
  const dateStr = await getDateAsString(fieldCode)
  const timeStr = await getTimeAsString(fieldCode)
  return `${dateStr} ${timeStr}`
}

const getInputValues = async fieldCodes => {
  const values = []
  for (const fieldCode of fieldCodes) {
    const inputs = await getInputs(fieldCode)
    if (inputs.length > 0) values.push(inputs[0].value)
  }
  return values
}

const isRadioButtonSelected = async (fieldCode, item) => {
  const inputs = await getInputs(fieldCode)
  return inputs.some(input => input.value === item && input.checked)
}

const isCheckBoxChecked = async (fieldCode, items) => {
  const result = []
  for (const item of items) {
    const checkBox = await getCheckBoxFromLabel(fieldCode, item)
    result.push(checkBox.checked)
  }
  return result
}

const isDropdownSelected = async (fieldCode, item) => {
  const fieldId = await getFieldIdFromCode(fieldCode)
  return page.evaluate(
    ({ fieldId, item }) => {
      const node = document.querySelector(`.field-${fieldId} .gaia-argoui-select-label`)
      return node && node.textContent === item
    },
    { fieldId, item }
  )
}

const isMultiSelectSelected = async (fieldCode, items) => {
  const fieldId = await getFieldIdFromCode(fieldCode)
  return page.evaluate(
    ({ fieldId, items }) => {
      const nodes = document.querySelectorAll(`.field-${fieldId} .multipleselect-cybozu div.goog-menuitem`)
      const checkedMap = Array.from(nodes).reduce((map, node) => {
        const item = node.querySelector('div').textContent
        const checked = node.getAttribute('aria-checked') === 'true'
        return { ...map, [item]: checked }
      }, {})
      return items.map(item => checkedMap[item])
    },
    { fieldId, items }
  )
}

const isGroupOpened = async fieldCode => {
  return getGroupStatus(fieldCode, 'control-group-gaia-expanded')
}

const isGroupClosed = async fieldCode => {
  return getGroupStatus(fieldCode, 'control-group-gaia-collapsed')
}

const getGroupStatus = async (fieldCode, className) => {
  const fieldId = await getFieldIdFromCode(fieldCode)
  return page.evaluate(
    ({ fieldId, className }) => {
      const node = document.querySelector(`.field-${fieldId}`)
      return node.className.includes(className)
    },
    { fieldId, className }
  )
}

const getCheckBoxFromLabel = async (fieldCode, item) => {
  const fieldId = await getFieldIdFromCode(fieldCode)
  // チェックボックスオプションの input を取得する
  // オプションのラベルは input の属性ではなく input に for で紐付けられた label のテキストなので、
  // まず label を取得して対応するチェックボックスオプションを取得する
  const input = await page.evaluate(
    ({ fieldId, item }) => {
      const rootSelector = `.control-multiple_check-field-gaia.field-${fieldId}`
      const labels = document.querySelectorAll(`${rootSelector} label`)
      const label = Array.from(labels).find(label => label.textContent === item)
      if (!label) throw new Error(`Cannot find item labeled as '${fieldCode}`)
      const input = document.querySelector(`${rootSelector} input[id="${label.htmlFor}"]`)
      return { id: input.id, checked: input.checked }
    },
    { fieldId, item }
  )
  return input
}

const getInputs = async fieldCode => {
  const fieldId = await getFieldIdFromCode(fieldCode)
  const inputs = await page.evaluate(fieldId => {
    const nodes = document.querySelectorAll(`.field-${fieldId} input, .field-${fieldId} textarea`)
    return Array.from(nodes).map(node => {
      const { type, value, checked } = node
      return { type, value, checked }
    })
  }, fieldId)
  return inputs
}

const setInputValues = async fieldCodeValueMap => {
  for (const [fieldCode, value] of Object.entries(fieldCodeValueMap)) {
    await setInputValue(fieldCode, value)
  }
}

const setInputValue = async (fieldCode, value) => {
  if (typeof value === 'string') {
    if (value.indexOf('\n') >= 0) {
      await setMultiLineText(fieldCode, value)
    } else {
      await setSingleLineText(fieldCode, value)
    }
  } else if (typeof value === 'number') {
    await setNumber(fieldCode, value.toString())
  } else if (value instanceof Date) {
    await setDate(fieldCode, value)
  }
}

const setSingleLineText = async (fieldCode, text) => {
  await typeInputTexts('input-text-cybozu', fieldCode, text)
}

const setMultiLineText = async (fieldCode, text) => {
  await typeInputTexts('textarea-cybozu', fieldCode, text.split('\n'))
}

const setNumber = async (fieldCode, number) => {
  await typeInputTexts('input-number-cybozu', fieldCode, number.toString())
}

const setDate = async (fieldCode, date) => {
  await typeInputTexts('input-date-text-cybozu', fieldCode, formatLocalDate(date, 'YYYY-MM-DD'))
}

const setTime = async (fieldCode, date) => {
  // 時刻はクリック → 時入力 → タブ → 分入力
  const fieldId = await getFieldIdFromCode(fieldCode)
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

const setDateTime = async (fieldCode, date) => {
  await setDate(fieldCode, date)
  await setTime(fieldCode, date)
}

const typeInputTexts = async (inputSelector, fieldCode, value) => {
  // input の change イベントを起動するために（直接 value を設定せず）キー操作で入力する
  // see: https://github.com/segmentio/nightmare/issues/810#issuecomment-389819641
  const fieldId = await getFieldIdFromCode(fieldCode)
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

const selectRadioButton = async (fieldCode, item) => {
  const fieldId = await getFieldIdFromCode(fieldCode)
  const itemId = await page.evaluate(
    ({ fieldId, item }) => {
      const nodes = document.querySelectorAll(`.field-${fieldId} .input-radio-item-cybozu input`)
      const selectedItem = Array.from(nodes).find(node => node.value === item)
      return selectedItem && selectedItem.id
    },
    { fieldId, item }
  )
  if (itemId) await page.click(`[id="${itemId}"`)
}

const selectDropdown = async (fieldCode, item) => {
  // ドロップダウンの項目はフィールド本体とは別要素として display: none で配置されている
  // まずフィールドをクリック
  const fieldId = await getFieldIdFromCode(fieldCode)
  await page.click(`.field-${fieldId} .gaia-argoui-select`)
  // 表示された項目から選択したい項目を検索してそれをクリック
  const itemId = await page.evaluate(selectItem => {
    const items = document.querySelectorAll('ul.gaia-argoui-selectmenu:not([style*="display: none"]) .goog-option')
    const selectedItem = Array.from(items).find(item => {
      return item.querySelector('.goog-menuitem-content').textContent === selectItem
    })
    return selectedItem && selectedItem.id
  }, item)
  if (itemId) await page.click(`[id="${itemId}"]`)
}

const checkCheckBox = async (fieldCode, itemCheckMap) => {
  for (const [item, checked] of Object.entries(itemCheckMap)) {
    const checkBox = await getCheckBoxFromLabel(fieldCode, item)
    if (checkBox.checked !== checked) {
      await page.click(`input[id="${checkBox.id}"]`)
    }
  }
}

const selectMultiSelect = async (fieldCode, itemSelectMap) => {
  const fieldId = await getFieldIdFromCode(fieldCode)
  // node.click() では反応しないので要素のIDを取得しておき page.click で要素指定してクリック
  const ids = await page.evaluate(
    ({ fieldId, itemSelectMap }) => {
      const nodes = document.querySelectorAll(`.field-${fieldId} .multipleselect-cybozu div.goog-menuitem`)
      return Array.from(nodes).reduce((ids, node) => {
        const selected = node.getAttribute('aria-checked') === 'true'
        const item = node.querySelector('div.goog-menuitem-content').textContent
        if (selected !== itemSelectMap[item]) {
          ids.push(node.getAttribute('id'))
        }
        return ids
      }, [])
    },
    { fieldId, itemSelectMap }
  )
  for (const id of ids) await page.click(`[id="${id}"]`)
}

const openGroup = async fieldCode => {
  await toggleGroup(fieldCode, 'control-group-gaia-collapsed')
}

const closeGroup = async fieldCode => {
  await toggleGroup(fieldCode, 'control-group-gaia-expanded')
}

const toggleGroup = async (fieldCode, className) => {
  const fieldId = await getFieldIdFromCode(fieldCode)
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

const pressSaveAndWaitForDetailScreen = async () => {
  try {
    const [handle] = await Promise.all([
      page.waitForSelector('.showlayout-gaia', { timeout: WAIT_FOR_ACTION_MS }),
      page.click('.gaia-argoui-app-edit-buttons button[class$="-save"]'),
    ])
    return handle
  } catch (error) {
    const errorInfo = await getInputErrorInfo()
    console.error(errorInfo)
    throw new Error(error)
  }
}

const pressEditAndWaitForEditScreen = async () => {
  const [handle] = await Promise.all([
    page.waitForSelector('.editablelayout-gaia', { timeout: WAIT_FOR_ACTION_MS }),
    page.click('.gaia-argoui-app-toolbar a.gaia-argoui-app-menu-edit'),
  ])
  return handle
}

const pressSaveAndGetErrorText = async () => {
  await Promise.all([
    page.waitForSelector('.notifier-error-cybozu', { visible: true, timeout: WAIT_FOR_ACTION_MS }),
    page.click('.gaia-argoui-app-edit-buttons button[class$="-save"]'),
  ])
  const errorText = await getNotifierBodyText()
  // エラー通知を閉じる
  await page.click('.notifier-remove-cybozu')
  return errorText
}

const getDetailSingleLineText = async fieldCode => {
  const fieldId = await getFieldIdFromCode(fieldCode)
  const value = await page.evaluate(fieldId => {
    const node = document.querySelector(`.value-${fieldId} span`)
    return node.textContent
  }, fieldId)
  return value
}

const getDetailSingleLineTexts = async fieldCodes => {
  const values = []
  for (const fieldCode of fieldCodes) {
    values.push(await getDetailSingleLineText(fieldCode))
  }
  return values
}

const getDetailMultiLineText = async fieldCode => {
  const fieldId = await getFieldIdFromCode(fieldCode)
  const textLines = await page.evaluate(fieldId => {
    const nodeList = document.querySelectorAll(`.control-multiple_line_text-field-gaia .value-${fieldId} div`)
    return Array.from(nodeList)
      .map(node => node.textContent)
      .join('\n')
  }, fieldId)
  return textLines
}

const getDetailMultiSelectTexts = async fieldCode => {
  const fieldId = await getFieldIdFromCode(fieldCode)
  return page.evaluate(
    ({ fieldId }) => {
      const nodes = document.querySelectorAll(`.field-${fieldId} span div`)
      return Array.from(nodes).map(node => node.textContent)
    },
    { fieldId }
  )
}

const getDetailNumber = async fieldCode => {
  const value = await getDetailSingleLineText(fieldCode)
  return Number(value)
}

const getDetailRadioButtonText = async fieldCode => {
  return getDetailSingleLineText(fieldCode)
}

const getDetailCheckBoxTexts = async fieldCode => {
  const fieldId = await getFieldIdFromCode(fieldCode)
  const value = await page.evaluate(fieldId => {
    // グルーピングに使われている span をスキップ
    const nodes = document.querySelectorAll(`.value-${fieldId} span span`)
    return Array.from(nodes).map(node => node.textContent)
  }, fieldId)
  return value
}

const getDetailDropdownText = async fieldCode => {
  return getDetailSingleLineText(fieldCode)
}

const getDetailDate = async fieldCode => {
  const dateStr = await getDetailSingleLineText(fieldCode)
  return parseLocalDateString(dateStr)
}

const getDetailTime = async (fieldCode, baseDate) => {
  const timeStr = await getDetailSingleLineText(fieldCode)
  const dateStr = formatLocalDate(baseDate || new Date(), 'YYYY-MM-DD')
  return parseLocalDateString(`${dateStr.substring(0, 10)} ${timeStr}`)
}

const getDetailDateTime = async fieldCode => {
  const dateStr = await getDetailSingleLineText(fieldCode)
  return parseLocalDateString(dateStr)
}

const isDetailGroupOpened = async fieldCode => {
  return isGroupOpened(fieldCode)
}

const isDetailGroupClosed = async fieldCode => {
  return isGroupClosed(fieldCode)
}

const openDetailGroup = async fieldCode => {
  await openGroup(fieldCode)
}

const closeDetailGroup = async fieldCode => {
  await closeGroup(fieldCode)
}

const getDetailStatusText = async () => {
  return page.evaluate(() => document.querySelector('span.gaia-app-statusbar-state-label').textContent)
}

const gotoCreatePage = async (domain, appId, options) => {
  const url = getCreateUrl(domain, appId, options)
  await page.goto(url, { waitUntil: 'networkidle2' })
}

const gotoIndexPage = async (domain, appId, options) => {
  const url = getIndexUrl(domain, appId, options)
  await page.goto(url, { waitUntil: 'networkidle2' })
}

const getFieldCodeFromLabel = async fieldLabel => {
  const fieldMap = await getFieldMap()
  const item = Object.values(fieldMap).find(field => field.label === fieldLabel)
  if (!item) throw new Error(`Cannot find field labeled as '${fieldLabel}'`)
  return item.var
}

const getFieldIdFromCode = async fieldCode => {
  const fieldMap = await getFieldMap()
  const item = Object.values(fieldMap).find(field => field.var === fieldCode)
  if (!item) throw new Error(`Cannot find field with code: '${fieldCode}'`)
  return item.id
}

const getFieldLabelFromId = async fieldId => {
  const fieldMap = await getFieldMap()
  const item = Object.values(fieldMap).find(field => field.id === fieldId)
  if (!item) throw new Error(`Cannot find field with id: '${fieldId}'`)
  return item.label
}

const getFieldMap = async () => {
  return page.evaluate(() => {
    return cybozu.data.page.FORM_DATA.schema.table.fieldList
  })
}

const getNotifierBodyText = async () => {
  const value = await page.evaluate(() => {
    const item = document.querySelector('.notifier-body-cybozu li')
    return item.textContent
  })
  return value
}

const getInputErrorInfo = async () => {
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
    const fieldCode = await getFieldLabelFromId(valueId)
    info[fieldCode] = errorText
  }
  return info
}

const setConsole = () => {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(msg.text())
    } else {
      console.warn(msg.text())
    }
  })
}

const waitForMoment = async () => {
  await page.waitFor(WAIT_FOR_MOMENT_MS)
}

module.exports = {
  WAIT_FOR_MOMENT_MS,
  WAIT_FOR_ACTION_MS,
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
  getDetailStatusText,
  gotoCreatePage,
  gotoIndexPage,
  getNotifierBodyText,
  pressSaveAndGetErrorText,
  pressSaveAndWaitForDetailScreen,
  pressEditAndWaitForEditScreen,
  waitForMoment,
  setConsole,
  getFieldCodeFromLabel,
  getFieldIdFromCode,
}
