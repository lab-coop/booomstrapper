import path from 'path'
import osTmpdir from 'os-tmpdir'
import readPkgUp from 'read-pkg-up'

import { createEmptyFolder } from './SystemUtils'
import { initializeProject } from '../JsProjectHandler'

/**
 * @returns tempTestFolderPath
 */
async function initializeTestProject() {
  const tempTestFolderPath = path.join(
    osTmpdir(),
    `booomstrapper_test_temp_dir_${Math.random()}`
  )
  createEmptyFolder(tempTestFolderPath)
  await initializeProject(tempTestFolderPath, 'plain-node')
  return tempTestFolderPath
}

/**
 * @param {string} repositoryPath
 * @param {{name: string, env: ('prod'|'dev')}[]} dependencyList
 * @returns {boolean}
 */
function projectHasDependencies(repositoryPath, dependencyList) {
  const { pkg } = readPkgUp.sync({
    cwd: repositoryPath,
    normalize: false
  })
  const envToPackageJSONKey = {
    prod: 'dependencies',
    dev: 'devDependencies'
  }
  return dependencyList
    .map(
      dependency => dependency.name in pkg[envToPackageJSONKey[dependency.env]]
    )
    .every(b => b)
}

module.exports = {
  initializeTestProject,
  projectHasDependencies
}
