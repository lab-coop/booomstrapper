import test from 'ava'
import fs from 'fs-extra'

import { initializeTestProject } from '../utils/TestUtils'
import { getHooks } from './Hooks'

import {
  TEST_HOOK_FILE_CONTENT,
  TEST_HOOK_CONTENT
} from './Hooks.test.helper.js'

test.serial('getHooks return list of valid hooks', async t => {
  const tempTestFolder = await initializeTestProject()
  const testHookDir = `${tempTestFolder}/scripts/hooks`
  const testHookPath = `${testHookDir}/pre-commit-test.js`
  fs.outputFileSync(testHookPath, TEST_HOOK_FILE_CONTENT)

  const hooks = getHooks(testHookDir)

  t.deepEqual(
    hooks.filter(hook => hook.ruleName === TEST_HOOK_CONTENT.ruleName),
    [TEST_HOOK_CONTENT]
  )

  fs.removeSync(tempTestFolder)
})
