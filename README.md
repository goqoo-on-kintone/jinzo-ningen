# Jinzo-Ningen

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

- [ログイン、ページ表示、保存など](./doc/reference.md#%e3%83%ad%e3%82%b0%e3%82%a4%e3%83%b3%e3%80%81%e3%83%9a%e3%83%bc%e3%82%b8%e8%a1%a8%e7%a4%ba%e3%80%81%e4%bf%9d%e5%ad%98%e3%81%aa%e3%81%a9)
- [待機](./doc/reference.md#%E5%BE%85%E6%A9%9F)
- [フィールドへの入力（新規作成、編集画面）](./doc/reference.md#%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E3%81%B8%E3%81%AE%E5%85%A5%E5%8A%9B%EF%BC%88%E6%96%B0%E8%A6%8F%E4%BD%9C%E6%88%90%E3%80%81%E7%B7%A8%E9%9B%86%E7%94%BB%E9%9D%A2%EF%BC%89)
- [グループの操作（新規作成、編集画面）](./doc/reference.md#%E3%82%B0%E3%83%AB%E3%83%BC%E3%83%97%E3%81%AE%E6%93%8D%E4%BD%9C%EF%BC%88%E6%96%B0%E8%A6%8F%E4%BD%9C%E6%88%90%E3%80%81%E7%B7%A8%E9%9B%86%E7%94%BB%E9%9D%A2%EF%BC%89)
- [フィールドからの値の取得（新規作成、編集画面）](./doc/reference.md#%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E3%81%8B%E3%82%89%E3%81%AE%E5%80%A4%E3%81%AE%E5%8F%96%E5%BE%97%EF%BC%88%E6%96%B0%E8%A6%8F%E4%BD%9C%E6%88%90%E3%80%81%E7%B7%A8%E9%9B%86%E7%94%BB%E9%9D%A2%EF%BC%89)
- [グループの操作（詳細画面）](./doc/reference.md#%E3%82%B0%E3%83%AB%E3%83%BC%E3%83%97%E3%81%AE%E6%93%8D%E4%BD%9C%EF%BC%88%E8%A9%B3%E7%B4%B0%E7%94%BB%E9%9D%A2%EF%BC%89)
- [フィールドからの値の取得（詳細画面）](./doc/reference.md#%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E3%81%8B%E3%82%89%E3%81%AE%E5%80%A4%E3%81%AE%E5%8F%96%E5%BE%97%EF%BC%88%E8%A9%B3%E7%B4%B0%E7%94%BB%E9%9D%A2%EF%BC%89)

## TIPS

- jinzo-ningenは内部的にwaitを複数回呼び出している為、jestのTimeout(=5000ms)を超えることがあります。その場合`jest.setTimeout`でTimeoutを伸ばしましょう。

## Licence

MIT
