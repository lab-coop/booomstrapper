module.exports = {
  ruleName: 'netlify-deployment',
  execute: 'netlify deploy dist',
  dependencies: ['netlify-cli'],
  hookType: 'deploy',
  category: 'Deployment'
}
