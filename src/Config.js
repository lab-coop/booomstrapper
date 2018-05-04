const os = require('os')
const fs = require('fs')
const path = require('path')
const { get, set } = require('lodash')
const homeDir = os.homedir()
const defaultConfigFolder = path.join(homeDir, '.booomstrapper')
const defaultConfigFile = path.join(defaultConfigFolder, 'config.json')

const defaultConfigPath = path.join(
  homeDir,
  defaultConfigFolder,
  defaultConfigFile
)

var configFileContent = new Map()

initializeConfig = () => {
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
