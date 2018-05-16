import test from 'ava'
import fs from 'fs-extra'

import { getProjectOptions } from './index'

import {
  TEST_DESCRIPTOR_PATH,
  TEST_DESCRIPTOR_FILE_CONTENT,
  TEST_DESCRIPTOR_CONTENT
} from './ProjectOptionHandler.test.helper.js'

test.serial('getProjectOptions return list of valid options', t => {
  fs.outputFileSync(TEST_DESCRIPTOR_PATH, TEST_DESCRIPTOR_FILE_CONTENT)

  const options = getProjectOptions()
  t.deepEqual(
    options.filter(option => option.ruleName === TEST_DESCRIPTOR_CONTENT.ruleName),
    [TEST_DESCRIPTOR_CONTENT]
  )

  fs.removeSync(TEST_DESCRIPTOR_PATH)
})
