const lib = require('../lib')
const { app, domain, username, password } = require('./config')

jest.setTimeout(60 * 1000)
/* eslint-disable no-console */
process.on('unhandledRejection', console.dir)

describe('jinzo-ningen-test', () => {
  beforeAll(async () => {
    await page.setViewport({ width: 1920, height: 980 })
    lib.setConsole(page)
    await lib.login(page, { domain, username, password })
  })

  const text1 = 'ゴーシュもセロの安心あとげで子ですわり楽隊たまし。'
  const text2 = `第一おれをさわりパンたちにして行ったのでも飛びか。それからこの皿でもここのゴーシュのわたした。ここます。切なも鳴っないこれに立って。こんどまでもばかのゴーシュをしやすきなたり出しましんはそれないた。\nなりてい。済む。」それからセロはからだを明るくしど楽器をしゃくにさわっては弾きでうながら楽長のどなりをむっとしゃくにさわってしですだ。「寄り、こうご天井へ習えて、ご窓を叩くたい。それに金星のゴーシュをつりあげでごらん見る。`
  const number = 1234567890
  const date1 = lib.parseLocalDateString('2000/01/01')
  const date2 = lib.parseLocalDateString('2000/01/01 12:34:00')

  describe('入力と保存、表示', () => {
    describe('新規作成画面への遷移と入力操作', () => {
      beforeAll(async () => {
        await lib.gotoCreatePage(page, domain, app['jinzo-ningen-test'])
      })

      describe('テキスト、数値が正常に入力できたこと', () => {
        it('文字列（1行）', async () => {
          await lib.setSingleLineText(page, '文字列__1行_', text1)
          const editText1 = await lib.getSingleLineText(page, '文字列__1行_')
          expect(editText1).toEqual(text1)
        })

        it('文字列（複数行）', async () => {
          await lib.setMultiLineText(page, '文字列__複数行_', text2)
          const editText2 = await lib.getMultiLineText(page, '文字列__複数行_')
          expect(editText2).toEqual(text2)
        })

        it('数値', async () => {
          await lib.setNumber(page, '数値', number)
          const editNumber = await lib.getNumber(page, '数値')
          expect(editNumber).toEqual(number)
        })
      })

      describe('選択値が正常に入力できたこと', () => {
        it('ラジオボタン', async () => {
          await lib.selectRadioButton(page, 'ラジオボタン', 'sample2')
          const editRadioButtonSelected = await lib.isRadioButtonSelected(page, 'ラジオボタン', 'sample2')
          expect(editRadioButtonSelected).toEqual(true)
        })

        it('チェックボックス', async () => {
          await lib.checkCheckBox(page, 'チェックボックス', { sample1: true, sample2: true })
          const editCheckboxChecked = await lib.isCheckBoxChecked(page, 'チェックボックス', ['sample1', 'sample2'])
          expect(editCheckboxChecked).toEqual([true, true])
        })

        it('複数選択', async () => {
          await lib.selectMultiSelect(page, '複数選択', {
            sample1: true,
            sample2: false,
            sample3: true,
            sample4: false,
          })
          const editMultiSelectSelected = await lib.isMultiSelectSelected(page, '複数選択', ['sample1', 'sample3'])
          expect(editMultiSelectSelected).toEqual([true, true])
        })

        it('ドロップダウン', async () => {
          await lib.selectDropdown(page, 'ドロップダウン', 'sample2')
          const editDropdownSelected = await lib.isDropdownSelected(page, 'ドロップダウン', 'sample2')
          expect(editDropdownSelected).toEqual(true)
        })
      })

      describe('日時が正常に入力できたこと', () => {
        it('日付', async () => {
          await lib.setDate(page, '日付', date1)
          const editDate = await lib.getDate(page, '日付')
          expect(editDate).toEqual(date1)
        })

        it('時刻', async () => {
          await lib.setTime(page, '時刻', date2)
          const editTime = await lib.getTime(page, '時刻', date2)
          expect(editTime).toEqual(date2)
        })

        it('日時', async () => {
          await lib.setDateTime(page, '日時', date2)
          const editDateTime = await lib.getDateTime(page, '日時')
          expect(editDateTime).toEqual(date2)
        })
      })

      describe('グループが正常に開閉できたこと', () => {
        it('開く', async () => {
          await lib.openGroup(page, 'グループ')
          const editGroupOpened = await lib.isGroupOpened(page, 'グループ')
          expect(editGroupOpened).toBeTruthy()
        })

        it('閉じる', async () => {
          await lib.closeGroup(page, 'グループ')
          const editGroupClosed = await lib.isGroupClosed(page, 'グループ')
          expect(editGroupClosed).toBeTruthy()
        })
      })
    })

    describe('保存と詳細画面の表示、ステータスの操作', () => {
      beforeAll(async () => {
        await lib.pressSaveAndWaitForDetailScreen(page)
      })

      describe('テキスト、数値が正常に保存できたこと', () => {
        it('文字列（1行）', async () => {
          const detailText = await lib.getDetailSingleLineText(page, '文字列__1行_')
          expect(detailText).toEqual(text1)
        })

        it('文字列（複数行）', async () => {
          const detailText = await lib.getDetailMultiLineText(page, '文字列__複数行_')
          expect(detailText).toEqual(text2)
        })

        it('数値', async () => {
          const detailNumber = await lib.getDetailNumber(page, '数値')
          expect(detailNumber).toEqual(number)
        })
      })

      describe('選択値が正常に保存できたこと', () => {
        it('ラジオボタン', async () => {
          const detailRadioButtonText = await lib.getDetailRadioButtonText(page, 'ラジオボタン')
          expect(detailRadioButtonText).toEqual('sample2')
        })

        it('チェックボックス', async () => {
          const detailCheckBoxTexts = await lib.getDetailCheckBoxTexts(page, 'チェックボックス')
          expect(detailCheckBoxTexts).toEqual(['sample1', 'sample2'])
        })

        it('複数選択', async () => {
          const detailMultiSelectTexts = await lib.getDetailMultiSelectTexts(page, '複数選択')
          expect(detailMultiSelectTexts).toEqual(['sample1', 'sample3'])
        })

        it('ドロップダウン', async () => {
          const detailDropdownText = await lib.getDetailDropdownText(page, 'ドロップダウン')
          expect(detailDropdownText).toEqual('sample2')
        })
      })

      describe('日時が正常に保存できたこと', () => {
        it('日付', async () => {
          const detailDate = await lib.getDetailDate(page, '日付')
          expect(detailDate).toEqual(date1)
        })

        it('時刻', async () => {
          const detailTime = await lib.getDetailTime(page, '時刻', date2)
          expect(detailTime).toEqual(date2)
        })

        it('日時', async () => {
          const detailDateTime = await lib.getDetailDateTime(page, '日時')
          expect(detailDateTime).toEqual(date2)
        })
      })

      describe('グループが正常に開閉できたこと', () => {
        it('開く', async () => {
          await lib.openDetailGroup(page, 'グループ')
          const detailGroupOpened = await lib.isDetailGroupOpened(page, 'グループ')
          expect(detailGroupOpened).toBeTruthy()
        })

        it('閉じる', async () => {
          await lib.closeDetailGroup(page, 'グループ')
          const detailGroupClosed = await lib.isDetailGroupClosed(page, 'グループ')
          expect(detailGroupClosed).toBeTruthy()
        })
      })

      describe('ステータス操作が正常にできたこと', () => {
        it('実行', async () => {
          await lib.pressDetailConfirmStatus(page)
          const detailStatusText = await lib.getDetailStatusText(page)
          expect(detailStatusText).toEqual('処理中')
        })
      })
    })

    describe('編集画面の表示と入力操作、保存', () => {
      beforeAll(async () => {
        await lib.pressEditAndWaitForEditScreen(page)
      })

      afterAll(async () => {
        await lib.pressSaveAndWaitForDetailScreen(page)
      })

      it('テキストが正常に入力できたこと', async () => {
        await lib.setMultiLineText(page, '文字列__複数行_', text2)
        const editText2 = await lib.getMultiLineText(page, '文字列__複数行_')
        expect(editText2).toEqual(text2)
      })
    })
  })
})
