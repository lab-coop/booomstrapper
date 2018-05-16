import test from 'ava'
import fs from 'fs-extra'

import { getHooks } from './Hooks'

import {
  TEST_HOOK_PATH,
  TEST_HOOK_FILE_CONTENT,
  TEST_HOOK_CONTENT
} from './Hooks.test.helper.js'

test.serial('getHooks return list of valid hooks', t => {
  fs.outputFileSync(TEST_HOOK_PATH, TEST_HOOK_FILE_CONTENT)

  const hooks = getHooks()

  t.deepEqual(
    hooks.filter(hook => hook.ruleName === TEST_HOOK_CONTENT.ruleName),
    [TEST_HOOK_CONTENT]
  )

  fs.removeSync(TEST_HOOK_PATH)
})
