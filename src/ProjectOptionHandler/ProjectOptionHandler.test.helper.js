
export const TEST_DESCRIPTOR_CONTENT = {
  ruleName: 'angular----test',
  execute: 'validate-commit-msg',
  dependencies: ['husky', 'validate-commit'],
  hookType: 'commitmsg'
}

export const TEST_DESCRIPTOR_FILE_CONTENT = `module.exports = ${JSON.stringify(
  TEST_DESCRIPTOR_CONTENT
)}`
