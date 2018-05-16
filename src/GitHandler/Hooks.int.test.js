import test from 'ava'
import fs from 'fs-extra'

import { addHooks } from './Hooks'

import {
  initializeTestProject,
  projectHasDependencies,
  getPkgContent
} from '../utils/TestUtils'

import {
  TEST_HOOK_PATH,
  TEST_HOOK_FILE_CONTENT,
  TEST_HOOK_CONTENT
} from './Hooks.test.helper.js'

test.beforeEach(async t => {
  const testProjectPath = await initializeTestProject()
  fs.outputFileSync(TEST_HOOK_PATH, TEST_HOOK_FILE_CONTENT)
  await addHooks([TEST_HOOK_CONTENT], testProjectPath)
  t.context.testProjectPath = testProjectPath
})

test.afterEach(t => {
  fs.removeSync(TEST_HOOK_PATH)
  fs.removeSync(t.context.testProjectPath)
})

test.serial(
  'addHooks should add required dependecies to package.json',
  async t => {
    const requiredDependencies = [
      { name: 'husky', env: 'dev' },
      ...TEST_HOOK_CONTENT.dependencies.map(dep => ({ name: dep, env: 'dev' }))
    ]
    const hasRequiredDependencies = projectHasDependencies(
      t.context.testProjectPath,
      requiredDependencies
    )
    t.true(
      hasRequiredDependencies,
      `Project has not the required dependencies ${JSON.stringify(
        requiredDependencies
      )}`
    )
  }
)

test('addHooks adds the required commands to package.json scripts', async t => {
  const packageScripts = getPkgContent(t.context.testProjectPath).scripts
  t.true(
    packageScripts[TEST_HOOK_CONTENT.hookType].includes(
      TEST_HOOK_CONTENT.execute
    )
  )
})
