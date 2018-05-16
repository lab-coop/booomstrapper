import path from 'path'

export const DESCRIPTOR_FOLDER_PATH = path.join(__dirname, './ProjectOptionDescriptors')
export const TEST_DESCRIPTOR_PATH = `${DESCRIPTOR_FOLDER_PATH}/pre-commit-test.js`
export const TEST_DESCRIPTOR_CONTENT = {
  ruleName: 'angular----test',
  execute: 'validate-commit-msg',
  dependencies: ['validate-commit'],
  scriptName: 'commitmsg'
}

export const TEST_DESCRIPTOR_FILE_CONTENT = `module.exports = ${JSON.stringify(
  TEST_DESCRIPTOR_CONTENT
)}`
