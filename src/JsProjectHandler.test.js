import test from 'ava'
import { _generateInstallPackagesCommands } from './JsProjectHandler'

test('generateInstallPackagesCommands returns separate commands for dev and prod dependencies', t => {
  const installPackagesCommands = _generateInstallPackagesCommands([
    { name: 'ava', env: 'dev' },
    { name: 'react' },
    { name: 'prettier', env: 'dev' }
  ])
  t.deepEqual(
    installPackagesCommands.sort(),
    ['yarn add react', 'yarn add --dev ava prettier'].sort()
  )
})

test('generateInstallPackagesCommands only creates command for an env if it is required', t => {
  const installPackagesCommands = _generateInstallPackagesCommands([
    { name: 'ava', env: 'dev' }
  ])
  t.deepEqual(installPackagesCommands, ['yarn add --dev ava'])
})
