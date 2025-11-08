const fs = require('node:fs')
const path = require('node:path')
const {Glob} = require('glob')

function printHelp() {
    const script = path.basename(__filename)
    console.log(`Usage: node cli_tools\\${script} <SOLOSHOT_SD_DIR> <ALLWAVES_CHECKOUT_DIR>\n\nCopies *.SESSION files from a Soloshot SD card into the allwaves repo and creates a convenient symlink without the date suffix.\n\nArguments:\n  <SOLOSHOT_SD_DIR>         Path to the Soloshot SD card root (expects a SOLOSHOT3 directory).\n  <ALLWAVES_CHECKOUT_DIR>   Path to the allwaves repository checkout.\n\nOptions:\n  -h, --help                Show this help and exit.`)
}

const args = process.argv.slice(2)
if (args.includes('-h') || args.includes('--help')) {
    printHelp()
    process.exit(0)
}

const [soloshotSdDir, allwavesCheckout] = args
if (!soloshotSdDir || !allwavesCheckout) {
    console.error('Error: missing required arguments.')
    printHelp()
    process.exit(1)
}

const seshFileSdPaths = new Glob(`${soloshotSdDir}/Track_*/*.SESSION`, {})
const seshFileGhDirPath = `${allwavesCheckout}/seshfiles/orig/`

// Ensure destination directory exists
fs.mkdirSync(seshFileGhDirPath, { recursive: true })

for (seshFilePath of seshFileSdPaths) {
    const destFilePath = path.join(seshFileGhDirPath, path.basename(seshFilePath))
    console.log(`Copying ${seshFilePath} to ${destFilePath}`)
    fs.cpSync(seshFilePath, destFilePath)
    const symlinkName = destFilePath.replace(/\\?orig/,'').replace(/_\d{6}/,'')
    const origFileRelPath = destFilePath.replace(/^.*seshfiles/,'.')

    //TODO handle multiple sessions on same day
    try {
        console.log(`Creating symlink ${symlinkName} pointed to ${origFileRelPath}`)
        fs.symlinkSync(origFileRelPath, symlinkName)
    } catch (err) {
        console.error(err)
    }
}

