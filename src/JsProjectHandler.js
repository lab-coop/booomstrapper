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
  const packagesByEnv = []
  const envIndexInList = {}
  packages.forEach(npmPackage => {
    const env = npmPackage.env === 'dev' ? 'dev' : 'prod'
    if (!(env in envIndexInList)) {
      envIndexInList[env] = packagesByEnv.push({ packageNames: [], env }) - 1
    }
    packagesByEnv[envIndexInList[env]].packageNames.push(npmPackage.name)
  })
  return _assembleInstallCommands(packagesByEnv)
}

function _assembleInstallCommand(packageNames, env) {
  if (packageNames.length === 0) return
  return `yarn add${env === 'dev' ? ' --dev' : ''} ${packageNames.join(' ')}`
}

/**
 * @param {{packageNames: string[], env?: string}[]} packagesByEnv
 */
function _assembleInstallCommands(packagesByEnv) {
  const commands = packagesByEnv
    .map(packages =>
      _assembleInstallCommand(packages.packageNames, packages.env)
    )
    .filter(command => command)
  return commands
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
