import test from 'ava'
import fs from 'fs-extra'

import { enableProjectOptions } from './index'

import {
  initializeTestProject,
  projectHasDependencies,
  getPkgContent
} from '../utils/TestUtils'

import {
  TEST_DESCRIPTOR_PATH,
  TEST_DESCRIPTOR_FILE_CONTENT,
  TEST_DESCRIPTOR_CONTENT
} from './ProjectOptionHandler.test.helper.js'

test.beforeEach(async t => {
  const testProjectPath = await initializeTestProject()
  fs.outputFileSync(TEST_DESCRIPTOR_PATH, TEST_DESCRIPTOR_FILE_CONTENT)
  await enableProjectOptions([TEST_DESCRIPTOR_CONTENT], testProjectPath)
  t.context.testProjectPath = testProjectPath
})

test.afterEach(t => {
  fs.removeSync(TEST_DESCRIPTOR_PATH)
  fs.removeSync(t.context.testProjectPath)
})

test.serial(
  'enableProjectOptions should add required dependencies to package.json',
  async t => {
    const requiredDependencies = [
      { name: 'husky', env: 'dev' },
      ...TEST_DESCRIPTOR_CONTENT.dependencies.map(dep => ({ name: dep, env: 'dev' }))
    ]
    const hasRequiredDependencies = projectHasDependencies(
      t.context.testProjectPath,
      requiredDependencies
    )
    t.true(
      hasRequiredDependencies,
      `Project does not have the required dependencies ${JSON.stringify(
        requiredDependencies
      )}`
    )
  }
)

test('enableProjectOptions adds the required commands to package.json scripts', async t => {
  const packageScripts = getPkgContent(t.context.testProjectPath).scripts
  t.true(
    packageScripts[TEST_DESCRIPTOR_CONTENT.scriptName].includes(
      TEST_DESCRIPTOR_CONTENT.execute
    )
  )
})
