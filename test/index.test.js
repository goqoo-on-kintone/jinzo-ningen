const lib = require('../lib')
const { app, domain, username, password, basic } = require('./config')

jest.setTimeout(60 * 1000)
/* eslint-disable no-console */
process.on('unhandledRejection', console.dir)

describe('jinzo-ningen-test', () => {
  beforeAll(async () => {
    await page.setViewport({ width: 1920, height: 980 })
    lib.setConsole()
    const [basicAuthUserName, basicAuthPassword] = (basic || '').split(':')
    await lib.login({
      domain,
      userName: username,
      password,
      basicAuthUserName,
      basicAuthPassword,
    })
  })

  const text1 = 'ゴーシュもセロの安心あとげで子ですわり楽隊たまし。'
  const text2 = `第一おれをさわりパンたちにして行ったのでも飛びか。それからこの皿でもここのゴーシュのわたした。ここます。切なも鳴っないこれに立って。こんどまでもばかのゴーシュをしやすきなたり出しましんはそれないた。\nなりてい。済む。」それからセロはからだを明るくしど楽器をしゃくにさわっては弾きでうながら楽長のどなりをむっとしゃくにさわってしですだ。「寄り、こうご天井へ習えて、ご窓を叩くたい。それに金星のゴーシュをつりあげでごらん見る。`
  const number = 1234567890
  const date1 = lib.parseLocalDateString('2000/01/01')
  const date2 = lib.parseLocalDateString('2000/01/01 12:34:00')

  const appId = app['jinzo-ningen-test']

  describe('画面遷移', () => {
    let recordId

    beforeAll(async () => {
      await lib.upload({ domain, appId }, 'test/csv/test-data.csv')

      await lib.gotoIndexPage(domain, appId)

      recordId = await page.evaluate(async appId => {
        return (await kintone.api('/k/v1/records', 'GET', { app: appId })).records[0].$id.value
      }, appId)
    })

    afterAll(async () => {
      await lib.delete({ domain, appId })
    })

    it('新規画面に遷移すること', async () => {
      await lib.gotoCreatePage(domain, appId, { queryParams: { key1: 12345, key2: 'キー2' } })

      expect(page.url()).toEqual(`https://${domain}/k/${appId}/edit?key1=12345&key2=%E3%82%AD%E3%83%BC2`)
    })

    it('新規画面から詳細画面に遷移すること', async () => {
      await page.goto(`https://${domain}/k/${appId}/edit`, { waitUntil: 'networkidle2' })
      await lib.pressSaveAndWaitForDetailScreen()
      const nextRecordId = Number(recordId) + 1
      expect(page.url()).toEqual(`https://${domain}/k/${appId}/show#record=${nextRecordId}`)
    })

    it('詳細画面から編集画面に遷移すること', async () => {
      await page.goto(`https://${domain}/k/${appId}/show#record=${recordId}`, {
        waitUntil: 'networkidle2',
      })
      await lib.pressEditAndWaitForEditScreen()
      expect(page.url()).toEqual(`https://${domain}/k/${appId}/show#record=${recordId}&mode=edit`)
    })
  })

  describe('新規作成画面', () => {
    beforeAll(async () => {
      await lib.gotoCreatePage(domain, appId)
    })

    afterAll(async () => {
      await page.click('.gaia-ui-actionmenu-cancel')
    })

    it('文字列（1行）が入力できること', async () => {
      await lib.setSingleLineText('文字列__1行_', text1)
      const editText1 = await lib.getSingleLineText('文字列__1行_')
      expect(editText1).toEqual(text1)
    })

    it('文字列（複数行）が入力できること', async () => {
      await lib.setMultiLineText('文字列__複数行_', text2)
      const editText2 = await lib.getMultiLineText('文字列__複数行_')
      expect(editText2).toEqual(text2)
    })

    it('数値が入力できること', async () => {
      await lib.setNumber('数値', number)
      const editNumber = await lib.getNumber('数値')
      expect(editNumber).toEqual(number)
    })

    it('ラジオボタンが設定できること', async () => {
      await lib.selectRadioButton('ラジオボタン', 'sample2')
      const editRadioButtonSelected = await lib.isRadioButtonSelected('ラジオボタン', 'sample2')
      expect(editRadioButtonSelected).toEqual(true)
    })

    it('チェックボックスが設定できること', async () => {
      await lib.checkCheckBox('チェックボックス', { sample1: true, sample2: true })
      const editCheckboxChecked = await lib.isCheckBoxChecked('チェックボックス', ['sample1', 'sample2'])
      expect(editCheckboxChecked).toEqual([true, true])
    })

    it('複数選択が選択できること', async () => {
      await lib.selectMultiSelect('複数選択', {
        sample1: true,
        sample2: false,
        sample3: true,
        sample4: false,
      })
      const editMultiSelectSelected = await lib.isMultiSelectSelected('複数選択', ['sample1', 'sample3'])
      expect(editMultiSelectSelected).toEqual([true, true])
    })

    it('ドロップダウンが選択できること', async () => {
      await lib.selectDropdown('ドロップダウン', 'sample2')
      const editDropdownSelected = await lib.isDropdownSelected('ドロップダウン', 'sample2')
      expect(editDropdownSelected).toEqual(true)
    })

    it('日付が入力できること', async () => {
      await lib.setDate('日付', date1)
      const editDate = await lib.getDate('日付')
      expect(editDate).toEqual(date1)
    })

    it('時刻が入力できること', async () => {
      await lib.setTime('時刻', date2)
      const editTime = await lib.getTime('時刻', date2)
      expect(editTime).toEqual(date2)
    })

    it('日時が入力できること', async () => {
      await lib.setDateTime('日時', date2)
      const editDateTime = await lib.getDateTime('日時')
      expect(editDateTime).toEqual(date2)
    })

    it('グループが開けること', async () => {
      await lib.openGroup('グループ')
      const editGroupOpened = await lib.isGroupOpened('グループ')
      expect(editGroupOpened).toBeTruthy()
    })

    it('グループが閉じれること', async () => {
      await lib.closeGroup('グループ')
      const editGroupClosed = await lib.isGroupClosed('グループ')
      expect(editGroupClosed).toBeTruthy()
    })
  })

  describe('詳細画面', () => {
    beforeAll(async () => {
      await lib.upload({ domain, appId: appId }, 'test/csv/test-data.csv')

      await page.goto(`https://${domain}/k/${appId}/`, { waitUntil: 'networkidle2' })
      const recordId = await page.evaluate(async appId => {
        return (await kintone.api('/k/v1/records', 'GET', { app: appId })).records[0].$id.value
      }, appId)

      await page.goto(`https://${domain}/k/${appId}/show#record=${recordId}`, {
        waitUntil: 'networkidle2',
      })
    })

    afterAll(async () => {
      await lib.delete({ domain, appId })
    })

    it('文字列（1行）が取得できること', async () => {
      const detailText = await lib.getDetailSingleLineText('文字列__1行_')
      expect(detailText).toEqual(text1)
    })

    it('文字列（複数行）が取得できること', async () => {
      const detailText = await lib.getDetailMultiLineText('文字列__複数行_')
      expect(detailText).toEqual(text2)
    })

    it('数値が取得できること', async () => {
      const detailNumber = await lib.getDetailNumber('数値')
      expect(detailNumber).toEqual(number)
    })

    it('ラジオボタンが取得できること', async () => {
      const detailRadioButtonText = await lib.getDetailRadioButtonText('ラジオボタン')
      expect(detailRadioButtonText).toEqual('sample2')
    })

    it('チェックボックスが取得できること', async () => {
      const detailCheckBoxTexts = await lib.getDetailCheckBoxTexts('チェックボックス')
      expect(detailCheckBoxTexts).toEqual(['sample1', 'sample2'])
    })

    it('複数選択が取得できること', async () => {
      const detailMultiSelectTexts = await lib.getDetailMultiSelectTexts('複数選択')
      expect(detailMultiSelectTexts).toEqual(['sample1', 'sample3'])
    })

    it('ドロップダウンが取得できること', async () => {
      const detailDropdownText = await lib.getDetailDropdownText('ドロップダウン')
      expect(detailDropdownText).toEqual('sample2')
    })

    it('日付が取得できること', async () => {
      const detailDate = await lib.getDetailDate('日付')
      expect(detailDate).toEqual(date1)
    })

    it('時刻が取得できること', async () => {
      const detailTime = await lib.getDetailTime('時刻', date2)
      expect(detailTime).toEqual(date2)
    })

    it('日時が取得できること', async () => {
      const detailDateTime = await lib.getDetailDateTime('日時')
      expect(detailDateTime).toEqual(date2)
    })

    it('グループが開けること', async () => {
      await lib.openDetailGroup('グループ')
      const detailGroupOpened = await lib.isDetailGroupOpened('グループ')
      expect(detailGroupOpened).toBeTruthy()
    })

    it('グループが閉じれること', async () => {
      await lib.closeDetailGroup('グループ')
      const detailGroupClosed = await lib.isDetailGroupClosed('グループ')
      expect(detailGroupClosed).toBeTruthy()
    })

    it('ステータスを処理中に変更できること', async () => {
      await lib.pressDetailConfirmStatus()
      const detailStatusText = await lib.getDetailStatusText()
      expect(detailStatusText).toEqual('処理中')
    })
  })

  describe('data-utils', () => {
    beforeAll(async () => {
      await lib.upload({ domain, appId }, 'test/csv/test-data.csv')
    })

    afterAll(async () => {
      await lib.delete({ domain, appId })
    })

    describe('getRecords', () => {
      it('1件取得できる', async () => {
        await page.goto(`https://${domain}/k/${appId}/?view=20`, { waitUntil: 'networkidle2' })
        const records = await lib.getRecords()
        expect(records.length).toBe(1)
      })

      it('0件取得（クエリを指定', async () => {
        await page.goto(`https://${domain}/k/${appId}/?view=20`, { waitUntil: 'networkidle2' })
        const records = await lib.getRecords({ query: 'レコード番号 = 0' })
        expect(records.length).toBe(0)
      })
    })

    describe('getRecord', () => {
      it('レコード内容を取得できる', async () => {
        await page.goto(`https://${domain}/k/${appId}/?view=20`, { waitUntil: 'networkidle2' })
        const recordId = await page.evaluate(async appId => {
          return (await kintone.api('/k/v1/records', 'GET', { app: appId })).records[0].$id.value
        }, appId)
        await page.goto(`https://${domain}/k/${appId}/show#record=${recordId}`, {
          waitUntil: 'networkidle2',
        })

        const record = await lib.getRecord()
        expect(record['文字列__1行_'].value).toEqual('ゴーシュもセロの安心あとげで子ですわり楽隊たまし。')
      })

      it('存在しないレコードはエラー', async () => {
        await expect(lib.getRecord({ recordId: Number.MAX_SAFE_INTEGER })).rejects.toThrow()
      })
    })

    describe('updateStatus', () => {
      it('ステータスを更新できる', async () => {
        await page.goto(`https://${domain}/k/${appId}/?view=20`, { waitUntil: 'networkidle2' })
        const recordId = await page.evaluate(async appId => {
          return (await kintone.api('/k/v1/records', 'GET', { app: appId })).records[0].$id.value
        }, appId)
        await lib.updateStatus({ appId, recordId, action: '処理開始' })
        const record = await lib.getRecord({ app: appId, recordId })
        expect(record['ステータス'].value === '処理中')
      })
    })

    describe('postRecord', () => {
      it('レコードが登録できる', async () => {
        await page.goto(`https://${domain}/k/${appId}/?view=20`, { waitUntil: 'networkidle2' })
        const record = {
          文字列__1行_: {
            type: 'SINGLE_LINE_TEXT',
            value: 'レコード登録テスト',
          },
        }
        const recordId = await lib.postRecord({ appId, record })
        const postedRecord = await lib.getRecord({ appId, recordId })
        expect(record['文字列__1行_'].value).toEqual(postedRecord['文字列__1行_'].value)
      })
    })

    describe('postRecords', () => {
      it('複数レコードが登録できる', async () => {
        await page.goto(`https://${domain}/k/${appId}/?view=20`, { waitUntil: 'networkidle2' })
        const records = [
          {
            文字列__1行_: {
              type: 'SINGLE_LINE_TEXT',
              value: 'レコード登録テスト1',
            },
          },
          {
            文字列__1行_: {
              type: 'SINGLE_LINE_TEXT',
              value: 'レコード登録テスト2',
            },
          },
        ]
        const recordIds = await lib.postRecords({ appId, records })
        const postedRecord1 = await lib.getRecord({ appId, recordId: recordIds[0] })
        const postedRecord2 = await lib.getRecord({ appId, recordId: recordIds[1] })
        expect(records[0]['文字列__1行_'].value).toEqual(postedRecord1['文字列__1行_'].value)
        expect(records[1]['文字列__1行_'].value).toEqual(postedRecord2['文字列__1行_'].value)
      })
    })

    describe('deleteRecords', () => {
      it('複数レコードが削除できる', async () => {
        await page.goto(`https://${domain}/k/${appId}/?view=20`, { waitUntil: 'networkidle2' })
        const records = [
          {
            文字列__1行_: {
              type: 'SINGLE_LINE_TEXT',
              value: 'レコード登録テスト1',
            },
          },
          {
            文字列__1行_: {
              type: 'SINGLE_LINE_TEXT',
              value: 'レコード登録テスト2',
            },
          },
        ]
        const recordIds = await lib.postRecords({ appId, records })
        await lib.deleteRecords({ appId, recordIds })
        await expect(lib.getRecord({ appId, recordId: recordIds[0] })).rejects.toThrow()
        await expect(lib.getRecord({ appId, recordId: recordIds[1] })).rejects.toThrow()
      })
    })
  })
})
