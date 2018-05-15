'use strict'

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
    childProcess.on('exit', async code => {
      if (resolveOutput) {
        resolve(data)
      } else {
        resolve(code)
      }
    })
  })
}

module.exports = {
  runCommand
}
