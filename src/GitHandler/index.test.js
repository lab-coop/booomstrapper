import test from 'ava'
import fs from 'fs-extra'

import { addHooks } from './index'
import {
  initializeTestProject,
  projectHasDependencies
} from '../utils/TestUtils'

const TEST_HOOK_PATH = './scripts/hooks/pre-commit/pre-commit-test.sample'

test('add hooks should create a .githooks directory and uptade package.json', async t => {
  // Create hook file to scripts/pre-commit/pre-commit-test.sample
  const preCommitHookScript = '# TODO: implement this precommit hook'
  fs.outputFileSync(TEST_HOOK_PATH, preCommitHookScript)
  const testProjectPath = await initializeTestProject()
  await addHooks(['pre-commit/pre-commit-test'], testProjectPath)

  const hasRequiredDependencies = projectHasDependencies(testProjectPath, [
    { name: 'husky', env: 'dev' }
  ])
  t.true(
    hasRequiredDependencies,
    `Project has not the required dependencies ${JSON.stringify([
      { name: 'husky', env: 'dev' }
    ])}`
  )
  // Check if repository contains .githooks with a pre-commit file
  const preCommitHookFileContent = fs.readFileSync(
    `${testProjectPath}/.githooks/pre-commit`,
    { encoding: 'utf8' }
  )
  t.is(preCommitHookFileContent, preCommitHookScript)

  fs.removeSync(TEST_HOOK_PATH)
  fs.removeSync(testProjectPath)
})
