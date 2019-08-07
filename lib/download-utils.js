const fs = require('fs')
const util = require('util')
const path = require('path')

const downloadFileAndGetName = async (page, downloadPath, downloadSelector) => {
  // テンポラリのディレクトリを作成（ファイルのダウンロードの監視に空のディレクトリが都合がよいため）
  const tempPath = path.resolve(downloadPath, require('uuid/v4')())
  await util.promisify(fs.mkdir)(tempPath)
  // パスを指定してダウンロード
  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: tempPath,
  })
  await page.waitForSelector(downloadSelector, { visible: true })
  await page.click(downloadSelector)
  // ダウンロード完了の待機
  const fileName = await waitFileDownloadAndGetName(tempPath)
  // ダウンロードしたファイルを移動、テンポラリのダウンロードパスを削除
  await util.promisify(fs.rename)(path.resolve(tempPath, fileName), path.resolve(downloadPath, fileName))
  await util.promisify(fs.rmdir)(tempPath)
  return fileName
}

const waitFileDownloadAndGetName = async downloadPath => {
  const MAX_RETRY = 300
  let retry = 0
  do {
    const dirents = await util.promisify(fs.readdir)(downloadPath, { withFileTypes: true })
    const found = dirents.find(dirent => {
      // ダウンロード中のファイルと隠しファイルを除外
      return dirent.isFile() && !dirent.name.match(/\.crdownload$|(^|\/)\.[^/.]/)
    })
    if (found) return found.name
    await new Promise(resolve => setTimeout(resolve, 200))
  } while ((retry += 1) < MAX_RETRY)
  return null
}

module.exports = {
  downloadFileAndGetName,
}
