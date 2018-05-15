import test from 'ava'
import { _generateInstallPackageCommands } from './JsProjectHandler'

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
