'use strict'

import { exec } from 'child_process'
import Logger from '../Logger'

async function runCommand(
  command,
  showOutput = true,
  pathToRunOn = process.cwd(),
  resolveOutput = true
) {
  Logger.debug(`Running command: ${command}`)
  let outputData = ''

  const childProcess = exec(command, { cwd: pathToRunOn }, (error, stdout) => {
    if (error) {
      Logger.error(`exec error: ${error}`)
    } else {
      outputData = stdout
    }
  })
  if (showOutput) {
    childProcess.stdout.pipe(process.stdout)
  }
  return new Promise(resolve => {
    childProcess.on('exit', async () => {
      if (resolveOutput) {
        resolve(outputData)
      } else {
        resolve(true)
      }
    })
  })
}

module.exports = {
  runCommand
}
