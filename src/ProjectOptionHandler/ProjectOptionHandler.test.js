import test from 'ava'
import fs from 'fs-extra'

import { initializeTestProject } from '../utils/TestUtils'
import { getProjectOptions } from './index'

import {
  TEST_DESCRIPTOR_FILE_CONTENT,
  TEST_DESCRIPTOR_CONTENT
} from './ProjectOptionHandler.test.helper.js'

test.serial('getProjectOptions return list of valid options', async t => {
  const tempTestFolder = await initializeTestProject()
  const testOptionDir = `${tempTestFolder}/hooks`
  const testOptionPath = `${testOptionDir}/pre-commit-test.js`
  fs.outputFileSync(testOptionPath, TEST_DESCRIPTOR_FILE_CONTENT)

  const options = getProjectOptions(testOptionDir)

  t.deepEqual(
    options.filter(option => option.ruleName === TEST_DESCRIPTOR_CONTENT.ruleName),
    [TEST_DESCRIPTOR_CONTENT]
  )

  fs.removeSync(tempTestFolder)
})
