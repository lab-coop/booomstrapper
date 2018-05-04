const octokit = require('@octokit/rest')()
const inquirer = require('inquirer')
const path = require('path')

const Config = require('./Config')
const Logger = require('./Logger')

var authInfo = Config.get('github.auth')
if (!authInfo) {
  octokit.authenticate(authInfo)
}

let authMethodSelection = [
  {
    type: 'list',
    message: 'Select Github authentication method',
    name: 'authMethod',
    choices: [{ name: 'oauth' }],
    validate: function(answer) {
      if (answer.length < 1) {
        return 'You must choose at least one authentication method.'
      }
      return true
    }
  }
]

var tokenQuestion = [
  {
    type: 'password',
    name: 'oauthToken',
    message: 'Please provide your oAuth token',
    default: function() {
      return null
    }
  }
]

protectBranch = (org, repository, branch) => {
  return octokit.repos.updateBranchProtection({
    owner: org,
    repository,
    branch,
    required_status_checks: null,
    required_pull_request_reviews: { include_admins: false },
    restrictions: null,
    enforce_admins: false
  })
}

createRepository = async (
  org,
  name,
  privateRepository = false,
  description = ''
) => {
  try {
    var repository = await octokit.repos.createForOrg({
      org,
      name,
      description,
      private: privateRepository
    })
    return repository
  } catch (error) {
    const parsedError = JSON.parse(error.message)
    throw new Error(
      `${parsedError.message}${
        parsedError.errors ? ' - ' + parsedError.errors[0].message : ''
      }`
    )
  }
}

listRepositories = async (org, type = 'public') => {
  return (await octokit.repos.getForOrg({ org, type })).data.map(repo => {
    return { name: repo.full_name, url: repo.html_url }
  })
}

checkAuthInfo = async configFileName => {
  var authInfo = Config.get('github.auth')
  if (!authInfo) {
    Logger.info('Github authentication info is missing. Please provide them.\n')
    const type = (await inquirer.prompt(authMethodSelection)).authMethod
    const token = (await inquirer.prompt(tokenQuestion)).oauthToken
    authInfo = {
      type,
      token
    }
    Config.set('github.auth', authInfo)
  }
  octokit.authenticate(Config.get('github.auth'))
}

module.exports = {
  createRepository,
  listRepositories,
  protectBranch,
  checkAuthInfo
}
