module.exports = {
  ruleName: 'eslint-linter',
  execute: 'eslint src',
  dependencies: ['eslint'],
  hookType: 'code:lint',
  category: 'Code Tools',
  checked: true,
  config: 'eslintrc'
}
