# Jinzo-Ningen

[![npm version](https://badge.fury.io/js/jinzo-ningen.svg)](https://badge.fury.io/js/jinzo-ningen)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 概要

jinzo-ningen は、puppeteer による kintone 操作を補助する Node.js 用ライブラリです。

## Get Started

```bash
npm add --save-dev jinzo-ningen jest jest-puppeteer
# or
yarn add --dev jinzo-ningen jest jest-puppeteer
```

`jest.config.js`の作成

```js
module.exports = {
  preset: 'jest-puppeteer',
}
```

## チュートリアル

- [kintoneアプリのE2Eテストチュートリアル](./doc/tutorial.md)

## APIリファレンス

- [ログイン、ページ表示、保存など](./doc/reference.md#ログインページ表示保存など)
- [待機](./doc/reference.md#待機)
- [フィールドへの入力（新規作成、編集画面）](./doc/reference.md#フィールドへの入力新規作成編集画面)
- [グループの操作（新規作成、編集画面）](./doc/reference.mdグループの操作新規作成編集画)
- [フィールドからの値の取得（新規作成、編集画面）](./doc/reference.md#フィールドからの値の取得新規作成編集画面)
- [グループの操作（詳細画面）](./doc/reference.md#グループの操作詳細画面)
- [フィールドからの値の取得（詳細画面）](./doc/reference.md#フィールドからの値の取得詳細画面)

## TIPS

- jinzo-ningenは内部的にwaitを複数回呼び出している為、jestのTimeout(=5000ms)を超えることがあります。その場合`jest.setTimeout`でTimeoutを伸ばしましょう。

- 以下の内容で`jest-puppeteer.config.js`を作成すると、headlessモードを解除してテストを実行することができます。

```js
module.exports = {
  launch: {
    headless: false,
  },
}
```

## Licence

MIT
