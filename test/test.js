const { parseLocalDateString } = require('../lib/date-utils')
const login = require('../lib/login')
const { app, domain, username, password } = require('./config')
const {
  gotoCreatePage,
  setConsole,
  setSingleLineText,
  setMultiLineText,
  setNumber,
  selectRadioButton,
  checkCheckBox,
  selectMultiSelect,
  selectDropdown,
  setDate,
  setTime,
  setDateTime,
  openGroup,
  getSingleLineText,
  getMultiLineText,
  getNumber,
  getDate,
  getTime,
  getDateTime,
  isCheckBoxChecked,
  isRadioButtonSelected,
  isMultiSelectSelected,
  isDropdownSelected,
  isGroupOpened,
  getDetailSingleLineText,
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
  openDetailGroup,
  pressSaveAndWaitForDetailScreen,
  pressEditAndWaitForEditScreen,
  pressDetailConfirmStatus,
  getDetailStatusText,
} = require('../lib/page-utils')
const { generateRandomStr } = require('./utils.js')

jest.setTimeout(60 * 1000)
/* eslint-disable no-console */
process.on('unhandledRejection', console.dir)

describe('jinzo-ningen-test', () => {
  beforeAll(async () => {
    await page.setViewport({ width: 1920, height: 980 })
    setConsole(page)
    await login(page, { domain, username, password })
  })

  afterAll(async () => {})

  describe('入力と保存、表示', () => {
    const number = Math.floor(Math.random() * 10000000)
    const text1 = generateRandomStr(10)
    const text2 = `${generateRandomStr(50)}\n${generateRandomStr(50)}`
    const date1 = parseLocalDateString('2000/01/01')
    const date2 = parseLocalDateString('2000/01/01 12:34:00')

    describe('新規作成画面での入力操作', () => {
      let editText1,
        editText2,
        editNumber,
        editCheckboxChecked,
        editRadioButtonSelected,
        editMultiSelectSelected,
        editDropdownSelected,
        editDate,
        editTime,
        editDateTime,
        editGroupOpened
      beforeAll(async () => {
        await gotoCreatePage(page, domain, app['jinzo-ningen-test'])

        await setSingleLineText(page, '文字列__1行_', text1)
        await setMultiLineText(page, '文字列__複数行_', text2)
        await setNumber(page, '数値', number)
        await selectRadioButton(page, 'ラジオボタン', 'sample2')
        await checkCheckBox(page, 'チェックボックス', { sample1: true, sample2: true })
        await selectMultiSelect(page, '複数選択', { sample1: true, sample2: false, sample3: true, sample4: false })
        await selectDropdown(page, 'ドロップダウン', 'sample2')
        await setDate(page, '日付', date1)
        await setTime(page, '時刻', date2)
        await setDateTime(page, '日時', date2)
        await openGroup(page, 'グループ')
        editText1 = await getSingleLineText(page, '文字列__1行_')
        editText2 = await getMultiLineText(page, '文字列__複数行_')
        editNumber = await getNumber(page, '数値')
        editRadioButtonSelected = await isRadioButtonSelected(page, 'ラジオボタン', 'sample2')
        editCheckboxChecked = await isCheckBoxChecked(page, 'チェックボックス', ['sample1', 'sample2'])
        editMultiSelectSelected = await isMultiSelectSelected(page, '複数選択', ['sample1', 'sample3'])
        editDropdownSelected = await isDropdownSelected(page, 'ドロップダウン', 'sample2')
        editDate = await getDate(page, '日付')
        editTime = await getTime(page, '時刻', date2)
        editDateTime = await getDateTime(page, '日時')
        editGroupOpened = await isGroupOpened(page, 'グループ')
      })

      it('テキスト、数値が正常に入力できたこと', () => {
        expect([editNumber, editText1, editText2]).toEqual([number, text1, text2])
      })
      it('選択値が正常に入力できたこと', () => {
        expect([editRadioButtonSelected, editCheckboxChecked, editMultiSelectSelected, editDropdownSelected]).toEqual([
          true,
          [true, true],
          [true, true],
          true,
        ])
      })
      it('日時が正常に入力できたこと', () => {
        expect([editDate, editTime, editDateTime]).toEqual([date1, date2, date2])
      })
      it('グループが正常に開けたこと', () => {
        expect(editGroupOpened).toBeTruthy()
      })
    })

    describe('保存と詳細画面の表示', () => {
      let detailText1,
        detailText2,
        detailNumber,
        detailRadioButtonText,
        detailCheckBoxTexts,
        detailMultiSelectTexts,
        detailDropdownText,
        detailDate,
        detailTime,
        detailDateTime,
        detailGroupOpened,
        detailStatusText
      beforeAll(async () => {
        await pressSaveAndWaitForDetailScreen(page)

        detailText1 = await getDetailSingleLineText(page, '文字列__1行_')
        detailText2 = await getDetailMultiLineText(page, '文字列__複数行_')
        detailNumber = await getDetailNumber(page, '数値')
        detailRadioButtonText = await getDetailRadioButtonText(page, 'ラジオボタン')
        detailCheckBoxTexts = await getDetailCheckBoxTexts(page, 'チェックボックス')
        detailMultiSelectTexts = await getDetailMultiSelectTexts(page, '複数選択')
        detailDropdownText = await getDetailDropdownText(page, 'ドロップダウン')
        detailDate = await getDetailDate(page, '日付')
        detailTime = await getDetailTime(page, '時刻', date2)
        detailDateTime = await getDetailDateTime(page, '日時')
        await openDetailGroup(page, 'グループ')
        detailGroupOpened = await isDetailGroupOpened(page, 'グループ')
        await pressDetailConfirmStatus(page)
        detailStatusText = await getDetailStatusText(page)
      })
      it('テキスト、数値が正常に保存できたこと', () => {
        expect([detailNumber, detailText1, detailText2]).toEqual([number, text1, text2])
      })
      it('選択値が正常に保存できたこと', () => {
        expect([detailRadioButtonText, detailCheckBoxTexts, detailMultiSelectTexts, detailDropdownText]).toEqual([
          'sample2',
          ['sample1', 'sample2'],
          ['sample1', 'sample3'],
          'sample2',
        ])
      })
      it('日時が正常に保存できたこと', () => {
        expect([detailDate, detailTime, detailDateTime]).toEqual([date1, date2, date2])
      })
      it('グループが正常に開けたこと', () => {
        expect(detailGroupOpened).toBeTruthy()
      })
      it('ステータスが次に進められたこと', () => {
        expect(detailStatusText).toEqual('処理中')
      })
    })
    describe('編集画面での入力操作と保存', () => {
      let editText2
      beforeAll(async () => {
        await pressEditAndWaitForEditScreen(page)
        await setMultiLineText(page, '文字列__複数行_', text2)
        editText2 = await getMultiLineText(page, '文字列__複数行_')
        await pressSaveAndWaitForDetailScreen(page)
      })
      it('テキストが正常に入力できたこと', () => {
        expect(editText2).toEqual(text2)
      })
    })
  })
})
