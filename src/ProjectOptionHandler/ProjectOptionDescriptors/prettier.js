module.exports = {
  ruleName: 'prettier',
  execute: 'prettier src',
  dependencies: ['prettier'],
  hookType: 'code:prettier',
  category: 'Code Tools',
  checked: true,
  config: 'prettierrc'
}
