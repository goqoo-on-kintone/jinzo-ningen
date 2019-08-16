# チュートリアル

このチュートリアルでは、jinzo-ningen とテスティングフレームワークの [Jest](https://jestjs.io/ja/) を使用して、カスタマイズを設定した kintone アプリの e2e テストを行います。

このチュートリアルは、下記の方を対象としています。

- kintone の操作とカスタマイズについての基本を理解している
- テストの実行環境に Node.js がインストールされており、npm の基本的な操作を理解している

## テストする kintone アプリとカスタマイズの作成

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

## Node.js プロジェクトとテストスクリプトの作成

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
    await jz.login({ domain, username, password });
  });

  describe('入力と保存、表示', () => {
    describe('新規作成画面での入力操作', () => {
      // テストのセットアップ。ここで新規作成画面を表示する
      beforeAll(async () => {
        // 新規作成画面を表示
        await jz.gotoCreatePage(domain, appId);
      });

      it('消費税額と合計額が外税で正しく計算できたこと', async () => {
        // 金額と数量を入力し、消費税計算方法を設定する
        await jz.setNumber('price', 1980);
        await jz.setNumber('amount', 5);
        await jz.selectRadioButton('taxCalcMethod', '外税');
        // 200 ms 待機（カスタマイズの処理完了前にテストが進行することを防止）
        await jz.waitForMoment();

        // 消費税額と合計額を取得し、正しく計算されたどうかテスト
        const tax = await jz.getNumber('tax');
        const total = await jz.getNumber('total');
        expect(tax).toEqual(792);
        expect(total).toEqual(9900);
      });

      it('消費税額と合計額が内税で正しく計算できたこと', async () => {
        // 金額と数量を入力し、消費税計算方法を設定する
        await jz.selectRadioButton('taxCalcMethod', '内税');
        // 200 ms 待機（カスタマイズの処理完了前にテストが進行することを防止）
        await jz.waitForMoment();

        // 消費税額と合計額を取得し、正しく計算されたどうかテスト
        const tax = await jz.getNumber('tax');
        const total = await jz.getNumber('total');
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
