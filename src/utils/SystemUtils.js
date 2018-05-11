'use strict'

import fs from 'fs'
import rimraf from 'rimraf'
import { exec } from 'child_process'
import Logger from '../Logger'

async function runCommand(
  command,
  showOutput = true,
  pathToRunOn = process.cwd(),
  resolveOutput = false
) {
  Logger.debug(`Running command: ${command}`)

  const childProcess = exec(command, { cwd: pathToRunOn }, error => {
    if (error) {
      Logger.error(`exec error: ${error}`)
    }
  })

  let data = ''
  childProcess.stdout.on('data', chunk => (data += chunk))
  if (showOutput) {
    childProcess.stdout.pipe(process.stdout)
  }
  return new Promise(resolve => {
    childProcess.on('exit', async () => {
      if (resolveOutput) {
        resolve(data)
      } else {
        resolve(true)
      }
    })
  })
}

function createEmptyFolder(folderPath) {
  if (fs.existsSync(folderPath)) {
    rimraf.sync(folderPath)
  }
  fs.mkdirSync(folderPath)
}

module.exports = {
  runCommand,
  createEmptyFolder
}
