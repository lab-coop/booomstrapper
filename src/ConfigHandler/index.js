'use strict'

import fs from 'fs'
import path from 'path'

const CONFIG_DIRECTORY = './assets/configs'

function addDefaultReadme(repoPath, repoName) {
  fs.writeFileSync(
    path.join(repoPath, 'Readme.md'),
    `## ${repoName}\n\nRepository created via Boomstrapper`
  )
}

function copyConfig(repoPath, configPath) {
  fs.copyFileSync(configPath, path.join(repoPath, `.${path.basename(configPath)}`))
}

function addDefaultConfigs(repoPath, configsToAdd) {
  configsToAdd.map(config => addDefaultConfig(repoPath, config))
}

function addDefaultConfig(repoPath, configName) {
  copyConfig(repoPath, path.join(CONFIG_DIRECTORY, configName))
}

module.exports = {
  addDefaultReadme,
  addDefaultConfigs,
  addDefaultConfig
}
