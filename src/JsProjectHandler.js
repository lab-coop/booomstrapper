import _ from 'lodash'
import fs from 'fs'
import path from 'path'

import { runCommand } from './utils/SystemUtils'
import { addSequenceItem } from './SequenceRunner'

import Logger from './Logger'
import { createCipher } from 'crypto';

const defaultConfigs = {
  eslint: '.eslintrc',
  prettier: '.prettierrc'
}

async function initializeCreateReactApp(repositoryPath) {
  // todo: check npm version
  await runCommand(`npx create-react-app ${repositoryPath}`, false)
}

async function installPackages(repositoryPath, packages) {
  return new Promise(async (resolve, reject) => {
    try {
      const packageName = packages.join(' ')
      // todo: fix temp hack for yarn handling
      const originalFolder = process.cwd()
      process.chdir(repositoryPath)
      await runCommand(
        `yarn add ${packageName}`, false
      )
      process.chdir(originalFolder)
      const availableConfigs = _.intersection(packages, Object.keys(defaultConfigs))
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
  initializeCreateReactApp,
  installPackages
}
