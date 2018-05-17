'use strict'

import fs from 'fs'
import path from 'path'

function addDefaultReadme(repoPath, repoName) {
  fs.writeFileSync(
    path.join(repoPath, 'Readme.md'),
    `## ${repoName}\n\nRepository created via Boomstrapper`
  )
}

function copyConfig(repoPath, configPath) {
  fs.copyFileSync(configPath, path.join(repoPath, path.basename(configPath)))
}

function addDefaultConfigs(repoPath, configsToAdd) {
  configsToAdd.map(config => addDefaultConfig(repoPath, config))
}

function addDefaultConfig(repoPath, configName) {
  copyConfig(repoPath, `./scripts/configs/.${configName}`)
}

module.exports = {
  addDefaultReadme,
  addDefaultConfigs,
  addDefaultConfig
}
