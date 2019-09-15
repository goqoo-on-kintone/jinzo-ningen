exports.getRecord = async recordId => {
  const record = await page.evaluate(async recordId => {
    const id = recordId || kintone.app.record.getId()
    if (!id) throw Error('レコード番号が取得できません')
    return kintone
      .api(kintone.api.url('/k/v1/record', true), 'GET', {
        app: kintone.app.getId(),
        id,
      })
      .then(({ record }) => record)
      .catch(error => ({ type: 'error', ...error }))
  }, recordId)
  if (record.type === 'error') {
    throw Error(record.message)
  }
  return record
}

exports.getRecords = async query => {
  const records = await page.evaluate(async query => {
    const { records } = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
      app: kintone.app.getId(),
      query: query || kintone.app.getQuery(),
    })
    return records
  }, query)
  return records
}
