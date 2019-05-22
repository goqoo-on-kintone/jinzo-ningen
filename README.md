# Jinzo-Ningen

## Requirement

- [puppeteer](https://github.com/GoogleChrome/puppeteer)

## Usage

### Kintone login

```js
const puppeteer = require('puppeteer')
const { login } = require('jinzo-ningen')

const browser = await puppeteer.launch()
await login(browser, { domain: 'xxxx.cybozu.com', username: 'xxxx', password: 'xxxx' })
```

### Test data upload/delete

```js
const puppeteer = require('puppeteer')
const { upload, deleteAll } = require('jinzo-ningen')

const browser = await puppeteer.launch()
await upload(browser, { domain: 'xxxx.cybozu.com', appId: 0 }, 'test/csv/xxxx.csv')
await deleteAll(browser, { domain: 'xxxx.cybozu.com', appId: 0 })
```

if using guest space

```js
await upload(browser, { domain: 'xxxx.cybozu.com', appId: 0, guestId: 0 }, 'test/csv/xxxx.csv')
await deleteAll(browser, { domain: 'xxxx.cybozu.com', appId: 0, guestId: 0 })
```
