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
  configsToAdd.map(config => copyConfig(repoPath, `./scripts/misc/.${config}`))
}

module.exports = {
  addDefaultReadme,
  addDefaultConfigs
}
