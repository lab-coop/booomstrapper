import path from 'path'
import { runCommand } from './utils/SystemUtils'

async function initializeCreateReactApp(repositoryPath) {
  // todo: check npm version
  await runCommand(`npx create-react-app ${repositoryPath}`, false)
}

async function installPackages(repositoryPath, packages) {
  const packageName = packages.join(' ')
  // todo: fix temp hack for yarn handling
  const originalFolder = process.cwd()
  process.chdir(repositoryPath)
  await runCommand(
    `yarn add ${packageName}`,
    false
  )
  process.chdir(originalFolder)
}

module.exports = {
  initializeCreateReactApp,
  installPackages
}
