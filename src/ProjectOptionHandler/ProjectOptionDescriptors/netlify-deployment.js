module.exports = {
  ruleName: 'netlify-deployment',
  execute: 'netlify deploy dist',
  dependencies: ['netlify-cli'],
  scriptName: 'deploy',
  category: 'Deployment'
}
