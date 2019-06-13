const getRecords = async (page, { appId, query }) => {
  const records = await page.evaluate(
    async ({ appId, query }) => {
      const url = kintone.api.url('/k/v1/records', true)
      try {
        const { records } = await kintone.api(url, 'GET', { app: appId || kintone.app.getId(), query })
        return records
      } catch (error) {
        console.error(JSON.stringify(error))
        throw new Error(error)
      }
    },
    { appId, query }
  )
  return records
}

const updateStatus = async (page, { appId, recordId, action }) => {
  await page.evaluate(
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
        throw new Error(error)
      }
    },
    { appId, recordId, action }
  )
}
const postRecord = async (page, appId, record) => {
  const recordId = await page.evaluate(
    async ({ appId, record }) => {
      const url = kintone.api.url('/k/v1/record', true)
      try {
        const { id } = await kintone.api(url, 'POST', { app: appId, record })
        return id
      } catch (error) {
        console.error(JSON.stringify(error))
        throw new Error(error)
      }
    },
    { appId, record }
  )
  return recordId
}

const postRecords = async (page, appId, records) => {
  const recordIds = await page.evaluate(
    async ({ appId, records }) => {
      const url = kintone.api.url('/k/v1/records', true)
      try {
        const { ids } = await kintone.api(url, 'POST', { app: appId, records })
        return ids
      } catch (error) {
        console.error(JSON.stringify(error))
        throw new Error(error)
      }
    },
    { appId, records }
  )
  return recordIds
}

const deleteRecords = async (page, appId, recordIds) => {
  await page.evaluate(
    async ({ appId, recordIds }) => {
      const url = kintone.api.url('/k/v1/records', true)
      try {
        await kintone.api(url, 'DELETE', { app: appId || kintone.app.getId(), ids: recordIds })
      } catch (error) {
        console.error(JSON.stringify(error))
        throw new Error(error)
      }
    },
    { appId, recordIds }
  )
}

module.exports = {
  getRecords,
  postRecord,
  postRecords,
  deleteRecords,
  updateStatus,
}
