# テストの実行について

テストの実行に先立って、以下の手順の通り kintone 上にテストアプリを作成、設定してください。

## テストアプリの作成

任意の kintone 環境にアプリをふたつのアプリ（それぞれを仮にメインアプリ、サブアプリとします。）を新規作成して、それぞれのアプリ ID をメモしておきます。なお、アプリの名称は任意です。

## .ginuerc ファイルの作成

`.ginuerc.sample.yml` を `.ginuerc.yml` としてコピー、以下のとおり編集します。

- `location` `env` `development` は変更しないでください。
- `your_domain` `your_username` `your_password` に任意の kintone 環境の情報を入力します。
- `your_main_app_id` `your_sub_app_id` に上記で作成したメインアプリ、サブアプリの ID を入力します。

```
location: kintone-settings
env:
  development:
    domain: your_domain.cybozu.com
    username: your_username
    password: your_password
    app:
      jinzo-ningen-test: your_main_app_id
      jinzo-ningen-test-sub: your_sub_app_id
```

## JSON ファイルの修正

`test/kintone-settings/development/jinzo-ningen-test/app_form_fields.json` の下記の項目で、`your_sub_app_id` を上記で作成したサブアプリの ID に置き換えます。

```
"ルックアップ": {
  "type": "SINGLE_LINE_TEXT",
  "code": "ルックアップ",
  "label": "ルックアップ",
  "noLabel": false,
  "required": false,
  "lookup": {
    "relatedApp": {
      "app": "your_sub_app_id",
      "code": ""
    },
```

## ginue によるテストアプリの設定

コマンドラインで以下のコマンドを実行します。

なお、プロンプトからの問い合わせにはすべて `Y` で答えてください。

```
cd test
npx ginue push development -A jinzo-ningen-test-sub
npx ginue deploy
npx ginue push development -A jinzo-ningen-test
npx ginue deploy
```

プロンプトからの問い合わせの例：

```
? [push] Are you sure? (Y/n)
? Add field "文字列__1行_" to development.jinzo-ningen-test? (Y/n)
```

## テストの実行

以上で kintone 上にテストアプリが設定され、テストの準備が完了しました。

以下のコマンドでテストを実行できます。

```
yarn test
```
