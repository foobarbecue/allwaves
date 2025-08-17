const fs = require('node:fs')
const path = require('node:path')
const {Glob} = require('glob')

const [,, soloshotSdDir, allwavesCheckout] = process.argv

const seshFileSdPaths = new Glob(`${soloshotSdDir}/Track_*/*.SESSION`, {})
const seshFileGhDirPath = `${allwavesCheckout}/seshfiles/orig/`


for (seshFilePath of seshFileSdPaths) {
    const destFilePath = path.join(seshFileGhDirPath, path.basename(seshFilePath))
    console.log(`Copying ${seshFilePath} to ${destFilePath}`)
    fs.cpSync(seshFilePath, destFilePath)
    const symlinkName = destFilePath.replace(/\\?orig/,'').replace(/_\d{6}/,'')

    //TODO handle multiple sessions on same day
    try {
        console.log(`Creating symlink ${symlinkName} pointed to ${destFilePath}`)
        fs.symlinkSync(destFilePath, symlinkName)
    } catch (err) {
        console.error(err)
    }
}

