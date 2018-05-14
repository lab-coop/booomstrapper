import test from 'ava'
import path from 'path'
import fs from 'fs-extra'
import rewire from 'rewire'

import {
  initializeTestProject,
  projectHasDependencies
} from '../utils/TestUtils'
import { addHooks, getHooks } from './Hooks'

const HooksModule = rewire('./Hooks')
const filterHookScriptsToInclude = HooksModule.__get__(
  'filterHookScriptsToInclude'
)

const angularSettings = {
  ruleName: 'angular---test',
  execute: 'validate-commit-msg',
  dependencies: ['validate-commit'],
  hookType: 'commitmsg'
}

const hookFile = {
  name: 'test-angular-commit-msg.js',
  content: `module.exports = ${JSON.stringify(angularSettings)}`
}

const hookFolderPath = path.join(__dirname, '../../scripts/hooks/')
const hookFilePath = `${hookFolderPath}/${hookFile.name}`

test.serial('getHooks return list of valid hooks', t => {
  fs.outputFileSync(hookFilePath, hookFile.content)

  const hooks = getHooks()

  t.deepEqual(
    hooks.filter(hook => hook.ruleName === angularSettings.ruleName),
    [angularSettings]
  )

  fs.removeSync(hookFilePath)
})

test('filterHookScriptsToInclude returns the correct hooks files based on hooks and settings', t => {
  const anOtherHook = {
    ...angularSettings,
    ruleName: 'anOtherHook'
  }
  const hooks = [angularSettings, anOtherHook]
  const filter = [angularSettings.ruleName]
  t.deepEqual(filterHookScriptsToInclude(hooks, filter), [angularSettings])
})

// Integration test

const TEST_HOOK_PATH = './scripts/hooks/pre-commit-test.js'
const TEST_HOOK_CONTENT = {
  ruleName: 'angular',
  execute: 'validate-commit-msg',
  dependencies: ['validate-commit'],
  hookType: 'commitmsg'
}

test.serial(
  'add hooks should create a .githooks directory and uptade package.json',
  async t => {
    const testProjectPath = await initializeTestProject()
    fs.outputFileSync(
      TEST_HOOK_PATH,
      `module.exports = ${JSON.stringify(TEST_HOOK_CONTENT)}`
    )
    await addHooks(['pre-commit-test'], testProjectPath)

    const hasRequiredDependencies = projectHasDependencies(testProjectPath, [
      { name: 'husky', env: 'dev' }
    ])
    t.true(
      hasRequiredDependencies,
      `Project has not the required dependencies ${JSON.stringify([
        { name: 'husky', env: 'dev' }
      ])}`
    )

    fs.removeSync(TEST_HOOK_PATH)
    fs.removeSync(testProjectPath)
  }
)
