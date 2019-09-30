# API リファレンス

## ログイン、ページ表示、保存など

### login({ domain, username, password })

kintone にログインします。

- `domain` `<string>` kintone ドメイン
- `username` `<string>` kintone ユーザ名
- `password` `<string>` kintone パスワード
- returns: `<Promise>` ログインが成功した場合に resolve されます。

### gotoIndexPage(domain, appId, options)

指定したドメイン、アプリIDの一覧画面を表示します。

- `domain` `<string>` kintone ドメイン
- `appId` `<number>` アプリID
- `options` `<Object>` オプション
  - `queryParams` `<Object>` クエリパラメータ
- returns: `<Promise>` 表示が成功した場合に resolve されます。

```js
// 指定したドメイン・アプリID の一覧ページに遷移して「すべて」一覧を表示
gotoIndexPage(<domain>, <appId>, { queryParams: { view: 20 } });
```

### gotoCreatePage(domain, appId, options)

指定したドメイン、アプリIDの新規作成画面を表示します。

- `domain` `<string>` kintone ドメイン
- `appId` `<number>` アプリID
- `options` `<Object>` オプション
  - `queryParams` `<Object>` クエリパラメータ
- returns: `<Promise>` 表示が成功した場合に resolve されます。

### pressEditAndWaitForEditScreen()

編集ボタンをクリックし、編集画面の表示を待機します。

- returns: `<Promise>` 表示が成功した場合に resolve されます。

### pressSaveAndWaitForDetailScreen()

保存ボタンをクリックし、詳細画面への遷移を待機します。

- returns: `<Promise>` 表示が成功した場合に resolve されます。

### pressSaveAndGetErrorText()

保存ボタンをクリックし、エラーメッセージの表示を待機してメッセージ文字列を取得します。

新規作成、編集画面の保存時に任意の条件でエラーを返すカスタマイズをテストするケースを想定しています。

- returns: `<Promise<string>>` エラーメッセージを返します。

## 待機

### waitForMoment()

短時間（200 ms）待機します。

- returns: `<Promise>`

## フィールドへの入力（新規作成、編集画面）

### setSingleLineText(fieldCode, text)

指定フィールドコードの文字列（1行）フィールドに文字列を入力します。

- `fieldCode` `<string>` フィールドコード
- `text` `<string>` 文字列
- returns: `<Promise>` 入力が成功した場合に resolve されます。

### setMultiLineText(fieldCode, text)

指定フィールドコードの文字列（複数行）フィールドに文字列を入力します。

- `fieldCode` `<string>` フィールドコード
- `text` `<string>` 文字列
- returns: `<Promise>` 入力が成功した場合に resolve されます。

### setNumber(fieldCode, number)

指定したフィールドコードの数値フィールドに数値を入力します。

- `fieldCode` `<string>` フィールドコード
- `number` `<string>` 数値
- returns: `<Promise>` 入力が成功した場合に resolve されます。

### setDate(fieldCode, date)

指定したフィールドコードの日付フィールドに日付を入力します。

- `fieldCode` `<string>` フィールドコード
- `date` `<Date>` 日付。date オブジェクトの時刻のみ参照され、時刻は無視されます。
- returns: `<Promise>` 入力が成功した場合に resolve されます。

### setTime(fieldCode, date)

指定したフィールドコードの時刻フィールドに時刻を入力します。

- `fieldCode` `<string>` フィールドコード
- `date` `<Date>` 時刻。date オブジェクトの時刻のみ参照され、日付は無視されます。
- returns: `<Promise>` 入力が成功した場合に resolve されます。

### setDateTime(fieldCode, date)

指定したフィールドコードの日時フィールドに日時を入力します。

- `fieldCode` `<string>` フィールドコード
- `date` `<Date>` 日時
- returns: `<Promise>` 入力が成功した場合に resolve されます。

### selectRadioButton(fieldCode, item)

指定したフィールドコードのラジオボタンフィールドで項目を選択します。

- `fieldCode` `<string>` フィールドコード
- `item` `<string>` 項目
- returns: `<Promise>` 入力が成功した場合に resolve されます。

### selectDropdown(fieldCode, item)

指定したフィールドコードのドロップダウンフィールドで項目を選択します。

- `fieldCode` `<string>` フィールドコード
- `item` `<string>` 項目
- returns: `<Promise>` 入力が成功した場合に resolve されます。

### checkCheckbox(fieldCode, itemCheckMap)

指定したフィールドコードのチェックボックスについて、項目をチェックまたはチェックを外します。

- `fieldCode` `<string>` フィールドコード
- `itemCheckMap` `<Object>` 項目とチェックの可否をセットしたオブジェクト
  - 例：`{ 項目1: true, 項目2: false }` チェックボックスの項目1はチェック、項目2はチェック解除された状態にセットされます。
  - `itemCheckMap` に含まれない項目については、状態を変更しません。
- returns: `<Promise>` 入力が成功した場合に resolve されます。

### selectMultiSelect(fieldCode, itemSelectMap)

指定したフィールドコードの複数選択について、項目を選択または選択解除します。

- `fieldCode` `<string>` フィールドコード
- `itemSelectMap` `<Object>` 項目とチェックの可否をセットしたオブジェクト
  - `{ 項目1: true, 項目2: false }` 複数選択の項目1は選択、項目2は選択解除された状態にセットされます。
  - `itemSelectMap` に含まれない項目については、状態を変更しません。
- returns: `<Promise>` 入力が成功した場合に resolve されます。

## グループの操作（新規作成、編集画面）

### openGroup(fieldCode)

指定したフィールドコードのグループを開きます。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise>` 操作が成功した場合に resolve されます。

### closeGroup(fieldCode)

指定したフィールドコードのグループを閉じます。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise>` 操作が成功した場合に resolve されます。

## フィールドからの値の取得（新規作成、編集画面）

### getSingleLineText(fieldCode)

指定したフィールドコードの文字列（1行）フィールドから値を取得します。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<string>>` フィールド値を返します。

### getMultiLineText(fieldCode)

指定したフィールドコードの文字列（複数行）フィールドから値を取得します。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<string>>` フィールド値を返します。

### getNumber(fieldCode)

指定したフィールドコードの数値フィールドから値を取得します。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<number>>` フィールド値を返します。

### getDate(fieldCode)

指定したフィールドコードの日付フィールドから日付を取得します。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<Date>>` フィールド値を Date オブジェクトで返します。

### getTime(fieldCode)

指定したフィールドコードの時刻フィールドから時刻を取得します。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<Date>>` フィールド値を Date オブジェクトで返します。

### getDateTime(fieldCode)

指定したフィールドコードの日付フィールドから日時を取得します。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<Date>>` フィールド値を Date オブジェクトで返します。

### isRadioButtonSelected(fieldCode, item)

指定したフィールドコードのラジオボタンの項目が選択されているかどうかを取得します。

- `fieldCode` `<string>` フィールドコード
- `item` `<string>` 項目
- returns: `<Promise<boolean>>` 指定した項目が選択されているかどうかを返します。

### isCheckBoxChecked(fieldCode, items)

指定したフィールドコードのチェックボックスの項目がチェックされているかどうかを取得します。

- `fieldCode` `<string>` フィールドコード
- `items` `<Array<string>>` 項目
- returns: `<Promise<Array<boolean>>>` 指定した項目が選択されているかどうかを boolean の配列で返します。

### isDropdownSelected(fieldCode, item)

指定したフィールドコードのドロップダウンの項目が選択されているかどうかを取得します。

- `fieldCode` `<string>` フィールドコード
- `item` `<string>` 項目
- returns: `<Promise<boolean>>` 指定した項目が選択されているかどうかを返します。

### isMultiSelectSelected(fieldCode, items)

指定したフィールドコードの複数選択の項目が選択されているかどうかを取得します。

- `fieldCode` `<string>` フィールドコード
- `items` `<Array<string>>` 項目
- returns: `<Promise<Array<boolean>>>` 指定した項目が選択されているかどうかを返します。

### isGroupOpened(fieldCode)

指定したフィールドコードのグループが開いているかどうかを取得します。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<boolean>>` 指定したグループが開いているかどうかを返します。

### isGroupClosed(fieldCode)

指定したフィールドコードのグループが閉じているかどうかを取得します。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<boolean>>` 指定したグループが閉じているかどうかを返します。

## グループの操作（詳細画面）

### openDetailGroup(fieldCode)

指定したフィールドコードのグループを開きます。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise>` 操作が成功した場合に resolve されます。

### closeDetailGroup(fieldCode)

指定したフィールドコードのグループを閉じます。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise>` 操作が成功した場合に resolve されます。

## フィールドからの値の取得（詳細画面）

### getDetailSingleLineText(fieldCode)

指定したフィールドコードの文字列（1行）フィールドから値を取得します。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<string>>` フィールド値を返します。

### getDetailMultiLineText(fieldCode)

指定したフィールドコードの文字列（複数行）フィールドから値を取得します。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<string>>` フィールド値を返します。

### getDetailNumber(fieldCode)

指定したフィールドコードの数値フィールドから値を取得します。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<number>>` フィールド値を返します。

### getDetailTime(fieldCode)

指定したフィールドコードの時刻フィールドから時刻を取得します。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<Date>>` フィールド値を Date オブジェクトで返します。

### getDetailDateTime(fieldCode)

指定したフィールドコードの日付フィールドから日時を取得します。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<Date>>` フィールド値を Date オブジェクトで返します。

### getDetailRadioButtonText(fieldCode)

指定したフィールドコードのラジオボタンについて、詳細画面で表示される選択済み項目のテキストを取得します。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<string>>` 取得したテキストを返します。

### getDetailCheckBoxTexts(fieldCode)

指定したフィールドコードのチェックボックスについて、詳細画面で表示される選択済み項目のテキストを配列で取得します。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<Array<string>>>` 取得したテキストを配列で返します。

### getDetailDropdownText(fieldCode)

指定したフィールドコードのドロップダウンについて、詳細画面で表示される選択済み項目のテキストを取得します。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<boolean>>` 取得したテキストを返します。

### getDetailMultiSelectText(fieldCode)

指定したフィールドコードのチェックボックスについて、詳細画面で表示される選択済み項目のテキストを配列で取得します。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<Array<string>>>` 指定した項目が選択されているかどうかを boolean の配列で返します。Detail

### isDetailGroupOpened(fieldCode)

指定したフィールドコードのグループが開いているかどうかを取得します。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<boolean>>` 指定したグループが開いているかどうかを返します。

### isDetailGroupClosed(fieldCode)

指定したフィールドコードのグループが閉じているかどうかを取得します。

- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<boolean>>` 指定したグループが閉じているかどうかを返します。

## レコード取得

### getRecord({ appId, recordId })

レコードを1件取得します。
引数を省略した場合、現在の画面のレコード情報を取得します。

- `appId` `<number>` アプリID（省略可能）
- `recordId` `<number>` レコード番号（省略可能）
- returns: `<Object>` レコードオブジェクトを返します。

### getRecords({ appId, query })

レコードを複数件取得します。
引数を省略した場合、現在の画面に表示されているレコード一覧情報を取得します。

- `appId` `<number>` アプリID（省略可能）
- `query` `<string>` クエリ文字列（省略可能）
- returns: `<Array<Object>>` レコードオブジェクト配列を返します。

## 開発用

### setConsole()

Chromium に出力されるログをローカルの標準出力にリダイレクトします。
