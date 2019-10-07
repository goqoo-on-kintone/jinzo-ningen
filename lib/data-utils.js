exports.getRecord = async ({ appId, recordId } = {}) => {
  const record = await page.evaluate(
    async ({ appId, recordId }) => {
      const id = recordId || kintone.app.record.getId()
      if (!id) throw new Error('レコード番号が取得できません')
      try {
        const { record } = await kintone.api(kintone.api.url('/k/v1/record', true), 'GET', {
          app: appId || kintone.app.getId(),
          id,
        })
        return record
      } catch (error) {
        console.error(JSON.stringify(error))
        return { type: 'error', ...error }
      }
    },
    { appId, recordId }
  )
  if (record.type === 'error') {
    throw new Error(record.message)
  }
  return record
}

exports.getRecords = async ({ appId, query } = {}) => {
  const records = await page.evaluate(
    async ({ appId, query }) => {
      const url = kintone.api.url('/k/v1/records', true)
      try {
        const { records } = await kintone.api(url, 'GET', {
          app: appId || kintone.app.getId(),
          query: query || kintone.app.getQuery(),
        })
        return records
      } catch (error) {
        console.error(JSON.stringify(error))
        return { type: 'error', ...error }
      }
    },
    { appId, query }
  )
  if (records.type === 'error') {
    throw new Error(records.message)
  }
  return records
}

exports.updateStatus = async ({ appId, recordId, action } = {}) => {
  const result = await page.evaluate(
    async ({ appId, recordId, action }) => {
      const url = kintone.api.url('/k/v1/record/status', true)
      try {
        const response = await kintone.api(url, 'PUT', {
          app: appId || kintone.app.getId(),
          id: recordId || kintone.app.record.getId(),
          action,
        })
        return response
      } catch (error) {
        console.error(JSON.stringify(error))
        return { type: 'error', ...error }
      }
    },
    { appId, recordId, action }
  )
  if (result.type === 'error') {
    throw new Error(result.message)
  }
}

exports.postRecord = async ({ appId, record } = {}) => {
  const recordId = await page.evaluate(async _ => {
    const { appId, record } = JSON.parse(_)
    const url = kintone.api.url('/k/v1/record', true)
    try {
      const { id } = await kintone.api(url, 'POST', { app: appId || kintone.app.getId(), record: record })
      return id
    } catch (error) {
      console.error(JSON.stringify(error))
      return { type: 'error', ...error }
    }
  }, JSON.stringify({ appId, record }))
  if (recordId.type === 'error') {
    throw new Error(recordId.message)
  }
  return recordId
}

exports.postRecords = async ({ appId, records } = {}) => {
  const recordIds = await page.evaluate(async _ => {
    const { appId, records } = JSON.parse(_)
    const url = kintone.api.url('/k/v1/records', true)
    try {
      const { ids } = await kintone.api(url, 'POST', { app: appId || kintone.app.getId(), records })
      return ids
    } catch (error) {
      console.error(JSON.stringify(error))
      return { type: 'error', ...error }
    }
  }, JSON.stringify({ appId, records }))
  if (recordIds.type === 'error') {
    throw new Error(recordIds.message)
  }
  return recordIds
}

exports.deleteRecords = async ({ appId, recordIds } = {}) => {
  const result = await page.evaluate(
    async ({ appId, recordIds }) => {
      const url = kintone.api.url('/k/v1/records', true)
      try {
        const result = await kintone.api(url, 'DELETE', { app: appId || kintone.app.getId(), ids: recordIds })
        return result
      } catch (error) {
        console.error(JSON.stringify(error))
        return { type: 'error', ...error }
      }
    },
    { appId, recordIds }
  )
  if (result.type === 'error') {
    throw new Error(result.message)
  }
}
