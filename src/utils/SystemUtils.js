'use strict'

import { exec } from 'child_process'
import Logger from '../Logger'

async function runCommand(command, showOutput = true) {
  Logger.debug(`Running command: ${command}`)

  const childProcess = exec(command, { cwd: process.cwd() }, error => {
    if (error) {
      Logger.error(`exec error: ${error}`)
    }
  })
  if (showOutput) {
    childProcess.stdout.pipe(process.stdout)
  }
  return new Promise(resolve => {
    childProcess.on('exit', () => {
      resolve(true)
    })
  })
}

module.exports = {
  runCommand
}
