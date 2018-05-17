module.exports = {
  ruleName: 'angular-commit-messages',
  execute: 'validate-commit-msg',
  dependencies: ['husky', 'validate-commit'],
  scriptName: 'commitmsg',
  category: 'Code Tools',
  checked: true
}
