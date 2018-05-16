import inquirer from 'inquirer'
import path from 'path'

import GitHandler from './GitHandler'
import GithubHandler from './GithubHandler'
import ConfigHandler from './ConfigHandler'
import { initializeProject, installPackages } from './JsProjectHandler'

import { addSequenceItem, runSequence } from './SequenceRunner'
import { getHooks } from './GitHandler/Hooks'

const HOOKS = getHooks()

var projectCreationParametersQuestions = [
  {
    type: 'input',
    name: 'githubOrganizationName',
    message: "What's the target Github Organization?",
    default: function() {
      return 'booom-studio'
    },
    validate: function(answer) {
      if (answer.length < 1) {
        return 'The organization name should not be empty.'
      }
      return true
    }
  },
  {
    type: 'input',
    name: 'repositoryName',
    message: 'What should be the name of the repository?',
    validate: function(answer) {
      if (answer.length < 1) {
        return 'The repository name should not be empty.'
      }
      return true
    }
  },
  {
    type: 'list',
    message: 'Public or private repository',
    name: 'publicity',
    choices: [{ name: 'public' }, { name: 'private' }],
    validate: function(answer) {
      if (answer.length < 1) {
        return 'You must specify if the repository should be private or public.'
      }
      return true
    }
  },
  {
    type: 'input',
    name: 'defaultBranchName',
    message: 'What should be the name of the default branch?',
    default: function() {
      return 'master'
    },
    validate: function(answer) {
      if (answer.length < 1) {
        return 'The repository name should not be empty.'
      }
      return true
    }
  },
  {
    type: 'confirm',
    name: 'isDefaultBranchProtected',
    message: 'Should be the default branch protected?',
    default: function() {
      return true
    }
  },
  {
    type: 'list',
    message: 'What type of project should be created?',
    name: 'projectType',
    choices: [{ name: 'create-react-app' }, { name: 'plain-node' }],
    validate: function(answer) {
      if (answer.length < 1) {
        return 'You must specify if the project type.'
      }
      return true
    }
  },
  {
    type: 'checkbox',
    name: 'hooks',
    message: 'Which hooks do you want to be installed?',
    choices: HOOKS.map(hook => ({
      name: hook.ruleName,
      value: hook
    }))
  },
  {
    type: 'checkbox',
    message: 'Which packages should be installed?',
    name: 'packagesToInstall',
    choices: [
      {
        name: 'prettier',
        value: { name: 'prettier', env: 'dev' },
        checked: true
      },
      { name: 'eslint', value: { name: 'eslint', env: 'dev' }, checked: true }
    ]
  },
  {
    type: 'checkbox',
    message: 'Which default config file should be added?',
    name: 'configsToAdd',
    choices: [
      { name: 'dockerignore', checked: true },
      { name: 'npmignore', checked: true },
      { name: 'gitignore', checked: true }
    ]
  }
]

async function createRepository() {
  const repositoryDetails = await inquirer.prompt(
    projectCreationParametersQuestions
  )
  GitHandler.setRepositoryPath(
    path.join(GitHandler.getRepositoryPath(), repositoryDetails.repositoryName)
  )
  addSequenceItem(
    () =>
      GithubHandler.createRepository(
        repositoryDetails.githubOrganizationName,
        repositoryDetails.repositoryName,
        repositoryDetails.publicity === 'private'
      ),
    'Creating Github repository'
  )
  addSequenceItem(
    () => GitHandler.initRepository(),
    'Creating temporary local repository'
  )
  addSequenceItem(
    () => GitHandler.createBranch(repositoryDetails.defaultBranchName),
    `Creating default branch: ${repositoryDetails.defaultBranchName}`
  )
  addSequenceItem(
    () =>
      GitHandler.addRemote(
        'origin',
        `git@github.com:${repositoryDetails.githubOrganizationName}/${
          repositoryDetails.repositoryName
        }.git`
      ),
    'Adding remote to local repository'
  )
  addSequenceItem(
    () =>
      initializeProject(
        GitHandler.getRepositoryPath(),
        repositoryDetails.projectType
      ),
    `Initializing ${repositoryDetails.projectType} project in the repository`
  )
  if (repositoryDetails.packagesToInstall) {
    addSequenceItem(
      () =>
        installPackages(
          GitHandler.getRepositoryPath(),
          repositoryDetails.packagesToInstall
        ),
      'Installing given packages and setting configurations'
    )
  }
  addSequenceItem(
    () =>
      ConfigHandler.addDefaultReadme(
        GitHandler.getRepositoryPath(),
        repositoryDetails.repositoryName
      ),
    'Adding default readme'
  )
  if (repositoryDetails.configsToAdd) {
    addSequenceItem(
      () =>
        ConfigHandler.addDefaultConfigs(
          GitHandler.getRepositoryPath(),
          repositoryDetails.configsToAdd
        ),
      `Adding default configuration files: ${repositoryDetails.configsToAdd.join(
        ', '
      )}`
    )
  }
  // todo: should be optional, selectable via a list
  addSequenceItem(
    () =>
      GitHandler.addHooks(
        repositoryDetails.hooks,
        GitHandler.getRepositoryPath()
      ),
    'Adding git hooks'
  )
  addSequenceItem(
    () => GitHandler.createCommit('Initial commit'),
    'Creating initial commit'
  )
  addSequenceItem(
    () => GitHandler.pushBranch(repositoryDetails.defaultBranchName),
    'Pushing branch to remote'
  )
  if (repositoryDetails.isDefaultBranchProtected) {
    addSequenceItem(
      () =>
        GithubHandler.protectBranch(
          repositoryDetails.githubOrganizationName,
          repositoryDetails.repositoryName,
          repositoryDetails.defaultBranchName
        ),
      `Protecting default branch: ${repositoryDetails.defaultBranchName}`
    )
  }
  runSequence()
}

module.exports = {
  createRepository
}
