const { getCreateUrl, getIndexUrl } = require('../lib/url-utils')
const { app, domain } = require('./config')

describe('#getCreateUrl', () => {
  it('新規登録ページのURLが作成されること', () => {
    const url = getCreateUrl(domain, app['jinzo-ningen-test'])
    expect(url).toEqual(`https://${domain}/k/${app['jinzo-ningen-test']}/edit`)
  })

  it('新規登録ページのURLが作成されること（パラメータあり）', () => {
    const url = getCreateUrl(domain, app['jinzo-ningen-test'], {
      queryParams: { key1: 12345, key2: 'キー2' },
    })
    expect(url).toEqual(`https://${domain}/k/${app['jinzo-ningen-test']}/edit?key1=12345&key2=%E3%82%AD%E3%83%BC2`)
  })
})

describe('#getIndexUrl', () => {
  it('一覧ページのURLが作成されること', () => {
    const url = getIndexUrl(domain, app['jinzo-ningen-test'])
    expect(url).toEqual(`https://${domain}/k/${app['jinzo-ningen-test']}/`)
  })

  it('一覧ページのURLが作成されること（一覧ID指定）', () => {
    const url = getIndexUrl(domain, app['jinzo-ningen-test'], { queryParams: { view: 20 } })
    expect(url).toEqual(`https://${domain}/k/${app['jinzo-ningen-test']}/?view=20`)
  })

  it('一覧ページのURLが作成されること（パラメータ指定）', () => {
    const url = getIndexUrl(domain, app['jinzo-ningen-test'], { queryParams: { key1: 12345, key2: 'キー2' } })
    expect(url).toEqual(`https://${domain}/k/${app['jinzo-ningen-test']}/?key1=12345&key2=%E3%82%AD%E3%83%BC2`)
  })

  it('一覧ページのURLが作成されること（一覧ID、パラメータ指定）', () => {
    const url = getIndexUrl(domain, app['jinzo-ningen-test'], {
      queryParams: { view: 20, key1: 12345, key2: 'キー2' },
    })
    expect(url).toEqual(`https://${domain}/k/${app['jinzo-ningen-test']}/?view=20&key1=12345&key2=%E3%82%AD%E3%83%BC2`)
  })
})
