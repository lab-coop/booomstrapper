import _ from 'lodash'
import fs from 'fs'
import path from 'path'

import { runCommand } from './utils/SystemUtils'

const defaultConfigs = {
  eslint: '.eslintrc',
  prettier: '.prettierrc'
}

async function initializeProject(repositoryPath, projectType) {
  switch (projectType) {
    case 'create-react-app':
      return runCommand(`npx create-react-app ${repositoryPath}`, false)
    case 'plain-node':
      return runCommand('npm init -y', false, repositoryPath)
  }
}

async function installPackages(repositoryPath, packages) {
  return new Promise(async (resolve, reject) => {
    try {
      const packageNames = packages.join(' ')
      await runCommand(`yarn add ${packageNames}`, false, repositoryPath)
      const availableConfigs = _.intersection(
        packages,
        Object.keys(defaultConfigs)
      )
      availableConfigs.forEach(config => {
        fs.copyFileSync(
          path.join('.', 'scripts', 'configs', defaultConfigs[config]),
          path.join(repositoryPath, defaultConfigs[config])
        )
      })
    } catch (error) {
      reject(error)
    }
    resolve(true)
  })
}

module.exports = {
  installPackages,
  initializeProject
}
