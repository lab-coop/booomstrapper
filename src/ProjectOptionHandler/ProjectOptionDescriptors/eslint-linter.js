module.exports = {
  ruleName: 'eslint-linter',
  execute: 'eslint src',
  dependencies: ['eslint'],
  scriptName: 'code:lint',
  category: 'Code Tools',
  checked: true,
  config: 'eslintrc'
}
