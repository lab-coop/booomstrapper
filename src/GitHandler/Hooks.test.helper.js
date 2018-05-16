import path from 'path'

export const HOOK_FOLDER_PATH = path.join(__dirname, '../../scripts/hooks/')
export const TEST_HOOK_PATH = `${HOOK_FOLDER_PATH}/pre-commit-test.js`
export const TEST_HOOK_CONTENT = {
  ruleName: 'angular----test',
  execute: 'validate-commit-msg',
  dependencies: ['validate-commit'],
  hookType: 'commitmsg'
}

export const TEST_HOOK_FILE_CONTENT = `module.exports = ${JSON.stringify(
  TEST_HOOK_CONTENT
)}`
