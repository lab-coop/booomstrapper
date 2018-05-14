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

const HOOK_FOLDER_PATH = path.join(__dirname, '../../scripts/hooks/')
const TEST_HOOK_PATH = `${HOOK_FOLDER_PATH}/pre-commit-test.js`
const TEST_HOOK_CONTENT = {
  ruleName: 'angular',
  execute: 'validate-commit-msg',
  dependencies: ['validate-commit'],
  hookType: 'commitmsg'
}

const TEST_HOOK_FILE_CONTENT = `module.exports = ${JSON.stringify(
  TEST_HOOK_CONTENT
)}`

test.serial('getHooks return list of valid hooks', t => {
  fs.outputFileSync(TEST_HOOK_PATH, TEST_HOOK_FILE_CONTENT)

  const hooks = getHooks()

  t.deepEqual(
    hooks.filter(hook => hook.ruleName === TEST_HOOK_CONTENT.ruleName),
    [TEST_HOOK_CONTENT]
  )

  fs.removeSync(TEST_HOOK_PATH)
})

test('filterHookScriptsToInclude returns the correct hooks files based on hooks and settings', t => {
  const anOtherHook = {
    ...TEST_HOOK_CONTENT,
    ruleName: 'anOtherHook'
  }
  const hooks = [TEST_HOOK_CONTENT, anOtherHook]
  const filter = [TEST_HOOK_CONTENT.ruleName]
  t.deepEqual(filterHookScriptsToInclude(hooks, filter), [TEST_HOOK_CONTENT])
})

// Integration test

test.serial(
  'add hooks should create a .githooks directory and uptade package.json',
  async t => {
    const testProjectPath = await initializeTestProject()
    fs.outputFileSync(TEST_HOOK_PATH, TEST_HOOK_FILE_CONTENT)
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
