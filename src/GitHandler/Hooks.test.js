import test from 'ava'
import path from 'path'
import fs from 'fs-extra'

import {
  initializeTestProject,
  projectHasDependencies,
  getPkgContent
} from '../utils/TestUtils'
import { addHooks, getHooks } from './Hooks'

const HOOK_FOLDER_PATH = path.join(__dirname, '../../scripts/hooks/')
const TEST_HOOK_PATH = `${HOOK_FOLDER_PATH}/pre-commit-test.js`
const TEST_HOOK_CONTENT = {
  ruleName: 'angular----test',
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

// Integration test

test.serial(
  'add hooks should create uptade package.json with commands and dependecies',
  async t => {
    const testProjectPath = await initializeTestProject()
    fs.outputFileSync(TEST_HOOK_PATH, TEST_HOOK_FILE_CONTENT)
    await addHooks([TEST_HOOK_CONTENT], testProjectPath)

    const requiredDependencies = [
      { name: 'husky', env: 'dev' },
      ...TEST_HOOK_CONTENT.dependencies.map(dep => ({ name: dep, env: 'dev' }))
    ]
    const hasRequiredDependencies = projectHasDependencies(
      testProjectPath,
      requiredDependencies
    )
    t.true(
      hasRequiredDependencies,
      `Project has not the required dependencies ${JSON.stringify(
        requiredDependencies
      )}`
    )

    const packageScripts = getPkgContent(testProjectPath).scripts
    t.true(TEST_HOOK_CONTENT.hookType in packageScripts)
    t.true(
      packageScripts[TEST_HOOK_CONTENT.hookType].includes(
        TEST_HOOK_CONTENT.execute
      )
    )

    fs.removeSync(TEST_HOOK_PATH)
    fs.removeSync(testProjectPath)
  }
)
