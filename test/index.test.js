const lib = require('../lib')
const { app, domain, username, password } = require('./config')

jest.setTimeout(60 * 1000)
/* eslint-disable no-console */
process.on('unhandledRejection', console.dir)

describe('jinzo-ningen-test', () => {
  beforeAll(async () => {
    const page = await global.__BROWSER__.newPage()
    await page.setViewport({ width: 1920, height: 980 })
    lib.setConsole(page)
    await lib.login(page, { domain, username, password })
  })

  const text1 = 'ゴーシュもセロの安心あとげで子ですわり楽隊たまし。'
  const text2 = `第一おれをさわりパンたちにして行ったのでも飛びか。それからこの皿でもここのゴーシュのわたした。ここます。切なも鳴っないこれに立って。こんどまでもばかのゴーシュをしやすきなたり出しましんはそれないた。\nなりてい。済む。」それからセロはからだを明るくしど楽器をしゃくにさわっては弾きでうながら楽長のどなりをむっとしゃくにさわってしですだ。「寄り、こうご天井へ習えて、ご窓を叩くたい。それに金星のゴーシュをつりあげでごらん見る。`
  const number = 1234567890
  const date1 = lib.parseLocalDateString('2000/01/01')
  const date2 = lib.parseLocalDateString('2000/01/01 12:34:00')

  const appId = app['jinzo-ningen-test']

  describe('画面遷移', () => {
    let page
    let recordId

    beforeAll(async () => {
      await lib.upload(global.__BROWSER__, { domain, appId }, 'test/csv/test-data.csv')

      page = await global.__BROWSER__.newPage()
      await lib.gotoIndexPage(page, domain, appId)

      recordId = await page.evaluate(async appId => {
        return (await kintone.api('/k/v1/records', 'GET', { app: appId })).records[0].$id.value
      }, appId)
    })

    afterAll(async () => {
      await lib.delete(global.__BROWSER__, { domain, appId })
    })

    it('新規画面に遷移すること', async () => {
      await lib.gotoCreatePage(page, domain, appId, { queryParams: { key1: 12345, key2: 'キー2' } })

      expect(page.url()).toEqual(`https://${domain}/k/${appId}/edit?key1=12345&key2=%E3%82%AD%E3%83%BC2`)
    })

    it('新規画面から詳細画面に遷移すること', async () => {
      await page.goto(`https://${domain}/k/${appId}/edit`, { waitUntil: 'networkidle2' })
      await lib.pressSaveAndWaitForDetailScreen(page)
      expect(page.url()).toEqual(`https://${domain}/k/${appId}/show`)
    })

    it('詳細画面から編集画面に遷移すること', async () => {
      await page.goto(`https://${domain}/k/${appId}/show#record=${recordId}`, {
        waitUntil: 'networkidle2',
      })
      await lib.pressEditAndWaitForEditScreen(page)
      expect(page.url()).toEqual(`https://${domain}/k/${appId}/show#record=${recordId}&mode=edit`)
    })
  })

  describe('新規作成画面', () => {
    let page
    beforeAll(async () => {
      page = await global.__BROWSER__.newPage()
      await lib.gotoCreatePage(page, domain, appId)
    })

    it('文字列（1行）が入力できること', async () => {
      await lib.setSingleLineText(page, '文字列__1行_', text1)
      const editText1 = await lib.getSingleLineText(page, '文字列__1行_')
      expect(editText1).toEqual(text1)
    })

    it('文字列（複数行）が入力できること', async () => {
      await lib.setMultiLineText(page, '文字列__複数行_', text2)
      const editText2 = await lib.getMultiLineText(page, '文字列__複数行_')
      expect(editText2).toEqual(text2)
    })

    it('数値が入力できること', async () => {
      await lib.setNumber(page, '数値', number)
      const editNumber = await lib.getNumber(page, '数値')
      expect(editNumber).toEqual(number)
    })

    it('ラジオボタンが設定できること', async () => {
      await lib.selectRadioButton(page, 'ラジオボタン', 'sample2')
      const editRadioButtonSelected = await lib.isRadioButtonSelected(page, 'ラジオボタン', 'sample2')
      expect(editRadioButtonSelected).toEqual(true)
    })

    it('チェックボックスが設定できること', async () => {
      await lib.checkCheckBox(page, 'チェックボックス', { sample1: true, sample2: true })
      const editCheckboxChecked = await lib.isCheckBoxChecked(page, 'チェックボックス', ['sample1', 'sample2'])
      expect(editCheckboxChecked).toEqual([true, true])
    })

    it('複数選択が選択できること', async () => {
      await lib.selectMultiSelect(page, '複数選択', {
        sample1: true,
        sample2: false,
        sample3: true,
        sample4: false,
      })
      const editMultiSelectSelected = await lib.isMultiSelectSelected(page, '複数選択', ['sample1', 'sample3'])
      expect(editMultiSelectSelected).toEqual([true, true])
    })

    it('ドロップダウンが選択できること', async () => {
      await lib.selectDropdown(page, 'ドロップダウン', 'sample2')
      const editDropdownSelected = await lib.isDropdownSelected(page, 'ドロップダウン', 'sample2')
      expect(editDropdownSelected).toEqual(true)
    })

    it('日付が入力できること', async () => {
      await lib.setDate(page, '日付', date1)
      const editDate = await lib.getDate(page, '日付')
      expect(editDate).toEqual(date1)
    })

    it('時刻が入力できること', async () => {
      await lib.setTime(page, '時刻', date2)
      const editTime = await lib.getTime(page, '時刻', date2)
      expect(editTime).toEqual(date2)
    })

    it('日時が入力できること', async () => {
      await lib.setDateTime(page, '日時', date2)
      const editDateTime = await lib.getDateTime(page, '日時')
      expect(editDateTime).toEqual(date2)
    })

    it('グループが開けること', async () => {
      await lib.openGroup(page, 'グループ')
      const editGroupOpened = await lib.isGroupOpened(page, 'グループ')
      expect(editGroupOpened).toBeTruthy()
    })

    it('グループが閉じれること', async () => {
      await lib.closeGroup(page, 'グループ')
      const editGroupClosed = await lib.isGroupClosed(page, 'グループ')
      expect(editGroupClosed).toBeTruthy()
    })
  })

  describe('詳細画面', () => {
    let page

    beforeAll(async () => {
      await lib.upload(global.__BROWSER__, { domain, appId: appId }, 'test/csv/test-data.csv')

      page = await global.__BROWSER__.newPage()
      await page.goto(`https://${domain}/k/${appId}/`, { waitUntil: 'networkidle2' })
      const recordId = await page.evaluate(async appId => {
        return (await kintone.api('/k/v1/records', 'GET', { app: appId })).records[0].$id.value
      }, appId)

      await page.goto(`https://${domain}/k/${appId}/show#record=${recordId}`, {
        waitUntil: 'networkidle2',
      })
    })

    afterAll(async () => {
      await lib.delete(global.__BROWSER__, { domain, appId })
    })

    it('文字列（1行）が取得できること', async () => {
      const detailText = await lib.getDetailSingleLineText(page, '文字列__1行_')
      expect(detailText).toEqual(text1)
    })

    it('文字列（複数行）が取得できること', async () => {
      const detailText = await lib.getDetailMultiLineText(page, '文字列__複数行_')
      expect(detailText).toEqual(text2)
    })

    it('数値が取得できること', async () => {
      const detailNumber = await lib.getDetailNumber(page, '数値')
      expect(detailNumber).toEqual(number)
    })

    it('ラジオボタンが取得できること', async () => {
      const detailRadioButtonText = await lib.getDetailRadioButtonText(page, 'ラジオボタン')
      expect(detailRadioButtonText).toEqual('sample2')
    })

    it('チェックボックスが取得できること', async () => {
      const detailCheckBoxTexts = await lib.getDetailCheckBoxTexts(page, 'チェックボックス')
      expect(detailCheckBoxTexts).toEqual(['sample1', 'sample2'])
    })

    it('複数選択が取得できること', async () => {
      const detailMultiSelectTexts = await lib.getDetailMultiSelectTexts(page, '複数選択')
      expect(detailMultiSelectTexts).toEqual(['sample1', 'sample3'])
    })

    it('ドロップダウンが取得できること', async () => {
      const detailDropdownText = await lib.getDetailDropdownText(page, 'ドロップダウン')
      expect(detailDropdownText).toEqual('sample2')
    })

    it('日付が取得できること', async () => {
      const detailDate = await lib.getDetailDate(page, '日付')
      expect(detailDate).toEqual(date1)
    })

    it('時刻が取得できること', async () => {
      const detailTime = await lib.getDetailTime(page, '時刻', date2)
      expect(detailTime).toEqual(date2)
    })

    it('日時が取得できること', async () => {
      const detailDateTime = await lib.getDetailDateTime(page, '日時')
      expect(detailDateTime).toEqual(date2)
    })

    it('グループが開けること', async () => {
      await lib.openDetailGroup(page, 'グループ')
      const detailGroupOpened = await lib.isDetailGroupOpened(page, 'グループ')
      expect(detailGroupOpened).toBeTruthy()
    })

    it('グループが閉じれること', async () => {
      await lib.closeDetailGroup(page, 'グループ')
      const detailGroupClosed = await lib.isDetailGroupClosed(page, 'グループ')
      expect(detailGroupClosed).toBeTruthy()
    })

    it('ステータスを処理中に変更できること', async () => {
      await lib.pressDetailConfirmStatus(page)
      const detailStatusText = await lib.getDetailStatusText(page)
      expect(detailStatusText).toEqual('処理中')
    })
  })
})
