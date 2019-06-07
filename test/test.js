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

jest.setTimeout(60 * 1000)
/* eslint-disable no-console */
process.on('unhandledRejection', console.dir)

describe('jinzo-ningen-test', () => {
  beforeAll(async () => {
    await page.setViewport({ width: 1920, height: 980 })
    setConsole(page)
    await login(page, { domain, username, password })
  })

  const text1 = 'ゴーシュもセロの安心あとげで子ですわり楽隊たまし。'
  const text2 = `第一おれをさわりパンたちにして行ったのでも飛びか。それからこの皿でもここのゴーシュのわたした。ここます。切なも鳴っないこれに立って。こんどまでもばかのゴーシュをしやすきなたり出しましんはそれないた。\nなりてい。済む。」それからセロはからだを明るくしど楽器をしゃくにさわっては弾きでうながら楽長のどなりをむっとしゃくにさわってしですだ。「寄り、こうご天井へ習えて、ご窓を叩くたい。それに金星のゴーシュをつりあげでごらん見る。`
  const number = 1234567890
  const date1 = parseLocalDateString('2000/01/01')
  const date2 = parseLocalDateString('2000/01/01 12:34:00')

  describe('入力と保存、表示', () => {
    describe('新規作成画面での入力操作', () => {
      beforeAll(async () => {
        await gotoCreatePage(page, domain, app['jinzo-ningen-test'])
      })

      it('テキスト、数値が正常に入力できたこと', async () => {
        await setSingleLineText(page, '文字列__1行_', text1)
        await setMultiLineText(page, '文字列__複数行_', text2)
        await setNumber(page, '数値', number)
        const editText1 = await getSingleLineText(page, '文字列__1行_')
        const editText2 = await getMultiLineText(page, '文字列__複数行_')
        const editNumber = await getNumber(page, '数値')

        expect(editNumber).toEqual(number)
        expect(editText1).toEqual(text1)
        expect(editText2).toEqual(text2)
      })

      it('選択値が正常に入力できたこと', async () => {
        await selectRadioButton(page, 'ラジオボタン', 'sample2')
        await checkCheckBox(page, 'チェックボックス', { sample1: true, sample2: true })
        await selectMultiSelect(page, '複数選択', { sample1: true, sample2: false, sample3: true, sample4: false })
        await selectDropdown(page, 'ドロップダウン', 'sample2')
        const editRadioButtonSelected = await isRadioButtonSelected(page, 'ラジオボタン', 'sample2')
        const editCheckboxChecked = await isCheckBoxChecked(page, 'チェックボックス', ['sample1', 'sample2'])
        const editMultiSelectSelected = await isMultiSelectSelected(page, '複数選択', ['sample1', 'sample3'])
        const editDropdownSelected = await isDropdownSelected(page, 'ドロップダウン', 'sample2')

        expect(editRadioButtonSelected).toEqual(true)
        expect(editCheckboxChecked).toEqual([true, true])
        expect(editMultiSelectSelected).toEqual([true, true])
        expect(editDropdownSelected).toEqual(true)
      })

      it('日時が正常に入力できたこと', async () => {
        await setDate(page, '日付', date1)
        await setTime(page, '時刻', date2)
        await setDateTime(page, '日時', date2)
        const editDate = await getDate(page, '日付')
        const editTime = await getTime(page, '時刻', date2)
        const editDateTime = await getDateTime(page, '日時')

        expect(editDate).toEqual(date1)
        expect(editTime).toEqual(date2)
        expect(editDateTime).toEqual(date2)
      })

      it('グループが正常に開けたこと', async () => {
        await openGroup(page, 'グループ')
        const editGroupOpened = await isGroupOpened(page, 'グループ')

        expect(editGroupOpened).toBeTruthy()
      })
    })

    describe('保存と詳細画面の表示、ステータスの操作', () => {
      beforeAll(async () => {
        await pressSaveAndWaitForDetailScreen(page)
      })

      it('テキスト、数値が正常に保存できたこと', async () => {
        const detailText1 = await getDetailSingleLineText(page, '文字列__1行_')
        const detailText2 = await getDetailMultiLineText(page, '文字列__複数行_')
        const detailNumber = await getDetailNumber(page, '数値')

        expect(detailText1).toEqual(text1)
        expect(detailText2).toEqual(text2)
        expect(detailNumber).toEqual(number)
      })

      it('選択値が正常に保存できたこと', async () => {
        const detailRadioButtonText = await getDetailRadioButtonText(page, 'ラジオボタン')
        const detailCheckBoxTexts = await getDetailCheckBoxTexts(page, 'チェックボックス')
        const detailMultiSelectTexts = await getDetailMultiSelectTexts(page, '複数選択')
        const detailDropdownText = await getDetailDropdownText(page, 'ドロップダウン')

        expect(detailRadioButtonText).toEqual('sample2')
        expect(detailCheckBoxTexts).toEqual(['sample1', 'sample2'])
        expect(detailMultiSelectTexts).toEqual(['sample1', 'sample3'])
        expect(detailDropdownText).toEqual('sample2')
      })

      it('日時が正常に保存できたこと', async () => {
        const detailDate = await getDetailDate(page, '日付')
        const detailTime = await getDetailTime(page, '時刻', date2)
        const detailDateTime = await getDetailDateTime(page, '日時')

        expect(detailDate).toEqual(date1)
        expect(detailTime).toEqual(date2)
        expect(detailDateTime).toEqual(date2)
      })

      it('グループが正常に開けたこと', async () => {
        await openDetailGroup(page, 'グループ')
        const detailGroupOpened = await isDetailGroupOpened(page, 'グループ')

        expect(detailGroupOpened).toBeTruthy()
      })

      it('ステータスが次に進められたこと', async () => {
        await pressDetailConfirmStatus(page)
        const detailStatusText = await getDetailStatusText(page)

        expect(detailStatusText).toEqual('処理中')
      })
    })

    describe('編集画面での入力操作と保存', () => {
      beforeAll(async () => {
        await pressEditAndWaitForEditScreen(page)
      })

      afterAll(async () => {
        await pressSaveAndWaitForDetailScreen(page)
      })

      it('テキストが正常に入力できたこと', async () => {
        await setMultiLineText(page, '文字列__複数行_', text2)
        const editText2 = await getMultiLineText(page, '文字列__複数行_')

        expect(editText2).toEqual(text2)
      })
    })
  })
})
