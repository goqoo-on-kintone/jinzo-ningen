# Jinzo-Ningen

## 概要

jinzo-ningen は、puppeteer による kintone 操作を補助する Node.js 用ライブラリです。

## チュートリアル

このチュートリアルでは、jinzo-ningen とテスティングフレームワークの [Jest](https://jestjs.io/ja/) を使用して、カスタマイズを設定した kintone アプリの e2e テストを行います。

このチュートリアルは、下記の方を対象としています。

- kintone の操作とカスタマイズについての基本を理解している
- テストの実行環境に Node.js がインストールされており、npm の基本的な操作を理解している

### テストする kintone アプリとカスタマイズの作成

ここでは、レコードに単価と金額を入力し、内税／外税を選択するアプリを作成します。また、アプリに対して、消費税額と合計額を計算して自動入力するカスタマイズを登録します。

kintone アプリを新規作成して、フォームに以下のフィールドを追加します。

- 数値フィールド（フィールド名：単価、フィールドコード：price）
- 数値フィールド（フィールド名：数量、フィールドコード：amount）
- 数値フィールド（フィールド名：合計、フィールドコード：total）
- 数値フィールド（フィールド名：消費税額、フィールドコード：tax）
- ラジオボタンフィールド（フィールド名：消費税計算方法、フィールドコード：taxCalcMethod）

次に、下記のコードを `calc.js` として保存し、アプリのカスタマイズ JavaScript コードとして登録します。 

```js
(function() {
  // 消費税額と合計のフィールドを入力不可に
  kintone.events.on(['app.record.create.show', 'app.record.edit.show'], function(event) {
    event.record.total.disabled = true;
    event.record.tax.disabled = true;
    return event;
  });
  // 消費税額と合計を計算、フィールドにセット
  kintone.events.on(
    [
      'app.record.create.change.price',
      'app.record.create.change.amount',
      'app.record.create.change.taxCalcMethod',
      'app.record.edit.change.price',
      'app.record.edit.change.amount',
      'app.record.edit.change.taxCalcMethod',
    ],
    function(event) {
      const price = Number(event.record.price.value);
      const amount = Number(event.record.amount.value);
      if (!price || !amount) return;
      const taxCalcMethod = event.record.taxCalcMethod.value;
      const sum = price * amount;
      const tax = Math.floor((sum * 8) / 100);
      const total = taxCalcMethod === '内税' ? sum + tax : sum;
      event.record.tax.value = tax;
      event.record.total.value = total;
      return event;
    }
  );
})();

```

### Node.js プロジェクトとテストスクリプトの作成

アプリのカスタマイズをテストするために、Node.js プロジェクトとテストスクリプトを作成します。

任意のディレクトリを作成してルートに移動します。

```bash
mkdir jinzo-ningen-test
cd jinzo-ningen-test
```

下記のコマンドを実行してプロジェクトを初期化し、jinzo-ningen と必要なライブラリをインストールします。

- [jest-puppeteer](https://github.com/smooth-code/jest-puppeteer) は puppeteer と連携するための Jest 設定を簡便に行うための npm ライブラリです。

```bash
npm init
npm add --save-dev jinzo-ningen jest jest-puppeteer
```

プロジェクトのルートに下記の内容で `jest.config.js` を保存します。

```js
module.exports = {
  preset: 'jest-puppeteer',
}
```

プロジェクトのルートに下記の内容で `jest-puppeteer.config.js` を保存します。

ここでは `headless` に `false` を設定し、テスト時に headless ではない Chromium を表示して挙動を確認します。

```js
module.exports = {
  launch: {
    // headless ではない Chromium を使用する。デフォルトは true
    headless: false,
  },
}
```

`package.json` に下記のエントリを追加します。

```json
  "scripts": {
    "test": "jest"
  },
```

下記の内容でテストファイル `index.test.js` を作成します。テストの記述内容については、コメントを参考にしてください。

```js
const jz = require('jinzo-ningen');

// テスト全体のタイムアウト時間を設定（単位：ミリ秒）。
jest.setTimeout(60 * 1000);

// テストの記述
describe('計算テスト', () => {
  // ログイン情報はテストする kintone 環境、アプリに置き換える
  const domain = 'your_domain.cybozu.com';
  const username = 'your_username';
  const password = 'your_password';
  const appId = your_appId;

  // テストのセットアップ。ここで kintone へのログインを行う
  beforeAll(async () => {
    // global.page オブジェクトは jest-puppeteer が自動的にロードしている
    await page.setViewport({ width: 1920, height: 980 });
    // kintone にログイン（domain, username, password が必要）
    await jz.login(page, { domain, username, password });
  });

  describe('入力と保存、表示', () => {
    describe('新規作成画面での入力操作', () => {
      // テストのセットアップ。ここで新規作成画面を表示する
      beforeAll(async () => {
        // 新規作成画面を表示
        await jz.gotoCreatePage(page, domain, appId);
      });

      it('消費税額と合計額が外税で正しく計算できたこと', async () => {
        // 金額と数量を入力し、消費税計算方法を設定する
        await jz.setNumber(page, 'price', 1980);
        await jz.setNumber(page, 'amount', 5);
        await jz.selectRadioButton(page, 'taxCalcMethod', '外税');
        // 200 ms 待機（カスタマイズの処理完了前にテストが進行することを防止）
        await jz.waitForMoment(page);

        // 消費税額と合計額を取得し、正しく計算されたどうかテスト
        const tax = await jz.getNumber(page, 'tax');
        const total = await jz.getNumber(page, 'total');
        expect(tax).toEqual(792);
        expect(total).toEqual(9900);
      });

      it('消費税額と合計額が内税で正しく計算できたこと', async () => {
        // 金額と数量を入力し、消費税計算方法を設定する
        await jz.selectRadioButton(page, 'taxCalcMethod', '内税');
        // 200 ms 待機（カスタマイズの処理完了前にテストが進行することを防止）
        await jz.waitForMoment(page);

        // 消費税額と合計額を取得し、正しく計算されたどうかテスト
        const tax = await jz.getNumber(page, 'tax');
        const total = await jz.getNumber(page, 'total');
        expect(tax).toEqual(792);
        expect(total).toEqual(10692);
      });
    });
  });
});
```

以上でテストの準備は完了しました。

下記のコマンドでテストを実行します。

`npm test`

Chromium が起動、テストが実行されます。完了するとコンソールに以下のようなテスト結果が表示されます。

```bash
 PASS  ./index.test.js (6.699s)
  計算テスト
      新規作成画面での入力操作
        ✓ 消費税額と合計額が外税で正しく計算できたこと (376ms)
        ✓ 消費税額と合計額が外税で正しく計算できたこと (312ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        6.858s, estimated 26s
Ran all test suites.
```

## API リファレンス

### ログイン、ページ表示、保存など

#### login(page, { domain, username, password })

kintone にログインします。

- `page` `<Page>` Chromium の Page オブジェクト 
- `domain` `<string>` kintone ドメイン
- `username` `<string>` kintone ユーザ名
- `password` `<string>` kintone パスワード
- returns: `<Promise>` ログインが成功した場合に resolve されます。

#### gotoCreatePage(page, domain, appId, options)

指定したドメイン、アプリIDの新規作成画面を表示します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `domain` `<string>` kintone ドメイン
- `appId` `<number>` アプリID
- `options` `<Object>` オプション
  - `params` `<Object>` パラメータ
- returns: `<Promise>` 表示が成功した場合に resolve されます。

#### pressEditAndWaitForEditScreen(page)

編集ボタンをクリックし、編集画面の表示を待機します。

- `page` `<Page>` Chromium の Page オブジェクト 
- returns: `<Promise>` 表示が成功した場合に resolve されます。

#### pressSaveAndWaitForDetailScreen(page)

保存ボタンをクリックし、詳細画面への遷移を待機します。

- `page` `<Page>` Chromium の Page オブジェクト 
- returns: `<Promise>` 表示が成功した場合に resolve されます。

#### pressSaveAndGetErrorText(page)

保存ボタンをクリックし、エラーメッセージの表示を待機してメッセージ文字列を取得します。

新規作成、編集画面の保存時に任意の条件でエラーを返すカスタマイズをテストするケースを想定しています。

- `page` `<Page>` Chromium の Page オブジェクト 
- returns: `<Promise<string>>` エラーメッセージを返します。

### 待機

#### waitForMoment(page)

短時間（200 ms）待機します。

- `page` `<Page>` Chromium の Page オブジェクト 
- returns: `<Promise>`

### フィールドへの入力（新規作成、編集画面）

#### setSingleLineText(page, fieldCode, text)

指定フィールドコードの文字列（1行）フィールドに文字列を入力します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- `text` `<string>` 文字列
- returns: `<Promise>` 入力が成功した場合に resolve されます。

#### setMultiLineText(page, fieldCode, text)

指定フィールドコードの文字列（複数行）フィールドに文字列を入力します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- `text` `<string>` 文字列
- returns: `<Promise>` 入力が成功した場合に resolve されます。

#### setNumber(page, fieldCode, number)

指定したフィールドコードの数値フィールドに数値を入力します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- `number` `<string>` 数値
- returns: `<Promise>` 入力が成功した場合に resolve されます。

#### setDate(page, fieldCode, date)

指定したフィールドコードの日付フィールドに日付を入力します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- `date` `<Date>` 日付。date オブジェクトの時刻のみ参照され、時刻は無視されます。
- returns: `<Promise>` 入力が成功した場合に resolve されます。

#### setTime(page, fieldCode, date) 

指定したフィールドコードの時刻フィールドに時刻を入力します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- `date` `<Date>` 時刻。date オブジェクトの時刻のみ参照され、日付は無視されます。
- returns: `<Promise>` 入力が成功した場合に resolve されます。

#### setDateTime(page, fieldCode, date)

指定したフィールドコードの日時フィールドに日時を入力します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- `date` `<Date>` 日時
- returns: `<Promise>` 入力が成功した場合に resolve されます。

#### selectRadioButton(page, fieldCode, option)

指定したフィールドコードのラジオボタンフィールドでオプションを選択します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- `option` `<string>` オプション
- returns: `<Promise>` 入力が成功した場合に resolve されます。

#### selectDropdown(page, fieldCode, option)

指定したフィールドコードのドロップダウンフィールドでオプションを選択します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- `option` `<string>` オプション
- returns: `<Promise>` 入力が成功した場合に resolve されます。

#### checkCheckbox(page, fieldCode, optionCheckMap)

指定したフィールドコードのチェックボックスについて、オプションをチェックまたはチェックを外します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- `optionCheckMap` `<Object>` オプションとチェックの可否をセットしたオブジェクト
  - 例：`{ オプション1: true, オプション2: false }` チェックボックスのオプション1はチェック、オプション2はチェック解除された状態にセットされます。
  - `optionCheckMap` に含まれないオプションについては、状態を変更しません。
- returns: `<Promise>` 入力が成功した場合に resolve されます。

#### selectMultiSelect(page, fieldCode, optionSelectMap)

指定したフィールドコードの複数選択について、オプションを選択または選択解除します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- `optionCheckMap` `<Object>` オプションとチェックの可否をセットしたオブジェクト
  - `{ オプション1: true, オプション2: false }` 複数選択のオプション1は選択、オプション2は選択解除された状態にセットされます。
  - `optionCheckMap` に含まれないオプションについては、状態を変更しません。
- returns: `<Promise>` 入力が成功した場合に resolve されます。

### グループの操作（新規作成、編集画面）

#### openGroup(page, fieldCode)

指定したフィールドコードのグループを開きます。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise>` 操作が成功した場合に resolve されます。

#### closeGroup(page, fieldCode)

指定したフィールドコードのグループを閉じます。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise>` 操作が成功した場合に resolve されます。

### フィールドからの値の取得（新規作成、編集画面）

#### getSingleLineText(page, fieldCode)

指定したフィールドコードの文字列（1行）フィールドから値を取得します。

- `page` ``<Page>`` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<string>>` フィールド値を返します。

#### getMultiLineText(page, fieldCode)

指定したフィールドコードの文字列（複数行）フィールドから値を取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<string>>` フィールド値を返します。

#### getNumber(page, fieldCode)

指定したフィールドコードの数値フィールドから値を取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<number>>` フィールド値を返します。

#### getDate(page, fieldCode)

指定したフィールドコードの日付フィールドから日付を取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<Date>>` フィールド値を Date オブジェクトで返します。

#### getTime(page, fieldCode)

指定したフィールドコードの時刻フィールドから時刻を取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<Date>>` フィールド値を Date オブジェクトで返します。

#### getDateTime(page, fieldCode)

指定したフィールドコードの日付フィールドから日時を取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<Date>>` フィールド値を Date オブジェクトで返します。

#### isRadioButtonSelected(page, fieldCode, option)

指定したフィールドコードのラジオボタンのオプションが選択されているかどうかを取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- `option` `<string>` オプション
- returns: `<Promise<boolean>>` 指定したオプションが選択されているかどうかを返します。

#### isCheckBoxChecked(page, fieldCode, options)

指定したフィールドコードのチェックボックスのオプションがチェックされているかどうかを取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- `option` `<string>` オプション
- returns: `<Promise<Array<boolean>>>` 指定したオプションが選択されているかどうかを boolean の配列で返します。

#### isDropdownSelected(page, fieldCode, option)

指定したフィールドコードのドロップダウンのオプションが選択されているかどうかを取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- `option` `<string>` オプション
- returns: `<Promise<boolean>>` 指定したオプションが選択されているかどうかを返します。

#### isMultiSelectSelected(page, fieldCode, options)

指定したフィールドコードの複数選択のオプションが選択されているかどうかを取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- `option` `<string>` オプション
- returns: `<Promise<Array<boolean>>>` 指定したオプションが選択されているかどうかを返します。

#### isGroupOpened(page, fieldCode) 

指定したフィールドコードのグループが開いているかどうかを取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<boolean>>` 指定したグループが開いているかどうかを返します。

#### isGroupClosed(page, fieldCode) 

指定したフィールドコードのグループが閉じているかどうかを取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<boolean>>` 指定したグループが閉じているかどうかを返します。

### グループの操作（詳細画面）

#### openDetailGroup(page, fieldCode)

指定したフィールドコードのグループを開きます。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise>` 操作が成功した場合に resolve されます。

#### closeDetailGroup(page, fieldCode)

指定したフィールドコードのグループを閉じます。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise>` 操作が成功した場合に resolve されます。

### フィールドからの値の取得（詳細画面）

#### getDetailSingleLineText(page, fieldCode)

指定したフィールドコードの文字列（1行）フィールドから値を取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<string>>` フィールド値を返します。

#### getDetailMultiLineText(page, fieldCode)

指定したフィールドコードの文字列（複数行）フィールドから値を取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<string>>` フィールド値を返します。

#### getDetailNumber(page, fieldCode)

指定したフィールドコードの数値フィールドから値を取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<number>>` フィールド値を返します。

#### getDetailTime(page, fieldCode)

指定したフィールドコードの時刻フィールドから時刻を取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<Date>>` フィールド値を Date オブジェクトで返します。

#### getDetailDateTime(page, fieldCode)

指定したフィールドコードの日付フィールドから日時を取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<Date>>` フィールド値を Date オブジェクトで返します。

#### getDetailRadioButtonText(page, fieldCode)

指定したフィールドコードのラジオボタンについて、詳細画面で表示される選択済みオプションのテキストを取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<string>>` 取得したテキストを返します。

#### getDetailCheckBoxTexts(page, fieldCode)

指定したフィールドコードのチェックボックスについて、詳細画面で表示される選択済みオプションのテキストを配列で取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<Array<string>>>` 取得したテキストを配列で返します。

#### getDetailDropdownText(page, fieldCode)

指定したフィールドコードのドロップダウンについて、詳細画面で表示される選択済みオプションのテキストを取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<boolean>>` 取得したテキストを返します。

#### getDetailMultiSelectText(page, fieldCode)

指定したフィールドコードのチェックボックスについて、詳細画面で表示される選択済みオプションのテキストを配列で取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<Array<string>>>` 指定したオプションが選択されているかどうかを boolean の配列で返します。Detail

#### isDetailGroupOpened(page, fieldCode) 

指定したフィールドコードのグループが開いているかどうかを取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<boolean>>` 指定したグループが開いているかどうかを返します。

#### isDetailGroupClosed(page, fieldCode) 

指定したフィールドコードのグループが閉じているかどうかを取得します。

- `page` `<Page>` Chromium の Page オブジェクト 
- `fieldCode` `<string>` フィールドコード
- returns: `<Promise<boolean>>` 指定したグループが閉じているかどうかを返します。

### 開発用

#### setConsole(page)

Chromium に出力されるログをローカルの標準出力にリダイレクトします。

- `page` `<Page>` Chromium の Page オブジェクト 

## Licence

MIT
