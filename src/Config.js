'use strict'

import os from 'os'
import fs from 'fs'
import path from 'path'
import { get, set } from 'lodash'

const homeDir = os.homedir()
const defaultConfigFolder = path.join(homeDir, '.booomstrapper')
const defaultConfigFile = path.join(defaultConfigFolder, 'config.json')

var configFileContent = new Map()

function initializeConfig() {
  if (!fs.existsSync(defaultConfigFolder)) {
    fs.mkdirSync(defaultConfigFolder)
  }
  if (!fs.existsSync(defaultConfigFile)) {
    fs.writeFileSync(defaultConfigFile, '{}')
  }
  configFileContent = require(defaultConfigFile)
}

module.exports = {
  get: (key, defaultValue = null) => get(configFileContent, key, defaultValue),
  set: (key, newValue, overwrite = false) => {
    if (!overwrite && get(key))
      throw new Error(`${key} already set in the config.`)
    set(configFileContent, key, newValue)
    fs.writeFileSync(
      defaultConfigFile,
      JSON.stringify(configFileContent, null, 2)
    )
  },
  initializeConfig
}
