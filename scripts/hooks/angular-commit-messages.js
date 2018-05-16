module.exports = {
  ruleName: 'angular-commit-messages',
  execute: 'validate-commit-msg',
  dependencies: ['validate-commit'],
  hookType: 'commitmsg'
}
