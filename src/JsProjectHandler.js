import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import readPkgUp from 'read-pkg-up'
import writePkg from 'write-pkg'

import { runCommand } from './utils/SystemUtils'

async function initializeProject(repositoryPath, projectType) {
  switch (projectType) {
    case 'create-react-app':
      return runCommand(`npx create-react-app ${repositoryPath}`, false)
    case 'plain-node':
      await runCommand('npm init -y', false, repositoryPath)
      fs.writeFileSync(
        path.join(repositoryPath, 'index.js'),
        'console.log("hello world")\n'
      )
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
    } catch (error) {
      reject(error)
    }
    resolve(true)
  })
}

/**
 * @param {string} repositoryPath
 * @param {{name: string, command: string}} script
 */
function addScript(repositoryPath, script) {
  const { pkg, path } = readPkgUp.sync({
    cwd: repositoryPath,
    normalize: false
  })

  pkg.scripts = pkg.scripts ? pkg.scripts : {}
  pkg.scripts[script.name] = pkg.scripts[script.name] || ''
  pkg.scripts[script.name] += pkg.scripts[script.name]
    ? ` && ${script.command}`
    : script.command

  writePkg.sync(path, pkg)
}

module.exports = {
  installPackages,
  initializeProject,
  addScript,
  _generateInstallPackageCommands
}
