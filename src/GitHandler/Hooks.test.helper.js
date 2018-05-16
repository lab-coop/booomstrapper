export const TEST_HOOK_CONTENT = {
  ruleName: 'angular----test',
  execute: 'validate-commit-msg',
  dependencies: ['validate-commit'],
  hookType: 'commitmsg'
}

export const TEST_HOOK_FILE_CONTENT = `module.exports = ${JSON.stringify(
  TEST_HOOK_CONTENT
)}`
