import path from 'path'
import osTmpdir from 'os-tmpdir'
import test from 'ava'
import readPkgUp from 'read-pkg-up'
import rimraf from 'rimraf'

import { createEmptyFolder } from './utils/SystemUtils'
import {
  initializeProject,
  addScript,
  _generateInstallPackageCommands
} from './JsProjectHandler'

test('addScript adds a script to an existing node project', async t => {
  const tempTestFolder = await initializeTestProject()
  addScript(tempTestFolder, { name: 'precommit', command: 'echo hello' })
  const { pkg } = readPkgUp.sync({
    cwd: tempTestFolder,
    normalize: false
  })
  t.is(pkg.scripts.precommit, 'echo hello')
  rimraf.sync(tempTestFolder)
})

test('addScript appends a script to the existing scripts if there are any', async t => {
  const tempTestFolder = await initializeTestProject()
  addScript(tempTestFolder, { name: 'test', command: 'ava' })
  const { pkg } = readPkgUp.sync({
    cwd: tempTestFolder,
    normalize: false
  })
  t.is(pkg.scripts.test, 'echo "Error: no test specified" && exit 1 && ava')
  rimraf.sync(tempTestFolder)
})

test('generateInstallPackageCommands returns separate commands for dev and prod dependencies', t => {
  const installPackageCommands = _generateInstallPackageCommands([
    { name: 'ava', env: 'dev' },
    { name: 'react' },
    { name: 'prettier', env: 'dev' }
  ])
  t.deepEqual(
    installPackageCommands.sort(),
    ['yarn add react', 'yarn add --dev ava prettier'].sort()
  )
})

test('generateInstallPackageCommands only creates command for an env if it is required', t => {
  const installPackageCommands = _generateInstallPackageCommands([
    { name: 'ava', env: 'dev' }
  ])
  t.deepEqual(installPackageCommands, ['yarn add --dev ava'])
})

async function initializeTestProject() {
  const tempTestFolder = path.join(
    osTmpdir(),
    `booomstrapper_test_temp_dir_${Math.random()}`
  )
  createEmptyFolder(tempTestFolder)
  await initializeProject(tempTestFolder, 'plain-node')
  return tempTestFolder
}
