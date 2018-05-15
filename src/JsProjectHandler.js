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

/**
 * @param {{name: string, env?: string}[]} packages
 * @private
 */
function _generateInstallPackageCommands(packages) {
  const devPackages = packages.filter(pckg => pckg.env === 'dev')
  const prodPackages = _.difference(packages, devPackages)
  let res = []
  if (devPackages.length > 0)
    res.push(`yarn add --dev ${devPackages.map(p => p.name).join(' ')}`)
  if (prodPackages.length > 0)
    res.push(`yarn add ${prodPackages.map(p => p.name).join(' ')}`)
  return res
}

/**
 * @param {string} repositoryPath
 * @param {{name: string, env?: string}[]} packages packages
 */
async function installPackages(repositoryPath, packages) {
  return new Promise(async (resolve, reject) => {
    try {
      const installCommands = _generateInstallPackageCommands(packages)
      await Promise.all(
        installCommands.map(installCommand =>
          runCommand(installCommand, false, repositoryPath)
        )
      )
      const packageNames = packages.map(npmPackage => npmPackage.name)
      const availableConfigs = _.intersection(
        packageNames,
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
  initializeProject,
  _generateInstallPackageCommands
}
