import octokit from '@octokit/rest'
import inquirer from 'inquirer'

import Config from './Config'
import Logger from './Logger'

const octo = octokit()

var authInfo = Config.get('github.auth')
if (!authInfo) {
  octo.authenticate(authInfo)
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

function protectBranch(org, repository, branch) {
  return octo.repos.updateBranchProtection({
    owner: org,
    repository,
    branch,
    required_status_checks: null,
    required_pull_request_reviews: { include_admins: false },
    restrictions: null,
    enforce_admins: false
  })
}

async function createRepository(
  org,
  name,
  privateRepository = false,
  description = ''
) {
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

async function listRepositories(org, type = 'public') {
  return (await octokit.repos.getForOrg({ org, type })).data.map(repo => {
    return { name: repo.full_name, url: repo.html_url }
  })
}

async function checkAuthInfo() {
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
  octo.authenticate(Config.get('github.auth'))
}

module.exports = {
  createRepository,
  listRepositories,
  protectBranch,
  checkAuthInfo
}
