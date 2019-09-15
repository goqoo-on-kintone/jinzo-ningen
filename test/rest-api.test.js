const lib = require('../lib')
const { app, domain, username, password } = require('./config')

jest.setTimeout(60 * 1000)
/* eslint-disable no-console */
process.on('unhandledRejection', console.dir)
const appId = app['jinzo-ningen-test']

beforeAll(async () => {
  await lib.login({ domain, username, password })
  await lib.upload({ domain, appId }, 'test/csv/test-data.csv')
})

afterAll(async () => {
  await lib.delete({ domain, appId })
})

describe('getRecords', () => {
  it('1件取得できる', async () => {
    await page.goto(`https://${domain}/k/${appId}/`, { waitUntil: 'networkidle2' })
    const records = await lib.getRecords()
    expect(records.length).toBe(1)
  })

  it('0件取得（クエリを指定', async () => {
    await page.goto(`https://${domain}/k/${appId}/`, { waitUntil: 'networkidle2' })
    const records = await lib.getRecords('レコード番号 = 0')
    expect(records.length).toBe(0)
  })
})

describe('getRecord', () => {
  it('レコード内容を取得できる', async () => {
    await page.goto(`https://${domain}/k/${appId}/`, { waitUntil: 'networkidle2' })
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
    await expect(lib.getRecord(Number.MAX_SAFE_INTEGER)).rejects.toThrow()
  })
})
