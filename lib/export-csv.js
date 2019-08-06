const { getDownloadFileUrl } = require('./url-utils')
const { downloadFileAndGetName } = require('./download-utils')

const exportToCsv = async (page, domain, appId, options = {}) => {
  const url = getDownloadFileUrl(domain, appId)
  const response = await page.goto(url, { waitUntil: 'networkidle2' })
  if (response.status === 520) {
    await page.close()
    throw new Error(`Got 520 error while goto export screen. \
      Maybe export file is not allowed to the test user.`)
  }

  if (options.additionalColumns) await addExportColumns(page, options.additionalColumns)

  await Promise.all([page.waitForNavigation('.downloadlist-content-header-gaia'), page.click('#export-submit-gaia')])
  let processed = false
  let retries = 120 // 2 min
  do {
    await page.waitFor(1000)
    // 再読み込みボタンだとクリック直後にダウンロードリンクが有効にならないため、ブラウザの再読み込みをつかう
    await page.reload({ waitUntil: 'networkidle0' })
    processed = await page.evaluate(() => {
      const td = document.querySelector('#view-list-data-processing-gaia td > span')
      return td && td.textContent === 'データがありません。'
    })
  } while (!processed && (retries -= 1))
  return downloadFileAndGetName(page, options.path, 'a.download-image-gaia')
}

const addExportColumns = async (page, columnLabels) => {
  for (const columnLabel of columnLabels) {
    await addExportColumn(page, columnLabel)
  }
}

const addExportColumn = async (page, columnLabel) => {
  const selector = '#fm-field-toolitems-cybozu .fm-toolitem-gaia'
  const index = await page.evaluate(
    ({ columnLabel, selector }) => {
      const nodes = [...document.querySelectorAll(selector)]
      return nodes.reduce((acc, node, index) => {
        return node.textContent === columnLabel ? index : acc
      }, -1)
    },
    { columnLabel, selector }
  )
  const item = (await page.$$(selector))[index]
  if (item) {
    const itemBox = await item.boundingBox()
    const x = itemBox.x + itemBox.width / 2
    const y = itemBox.y + itemBox.height / 2
    const columnsView = await page.$('.fm-row-gaia')
    const columnsViewBox = await columnsView.boundingBox()

    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.waitFor(100)
    await page.mouse.move(columnsViewBox.x + 5, y)
    await page.waitFor(100)
    await page.mouse.up()
    await page.waitFor(2000)
  }
}

module.exports = { exportToCsv }
