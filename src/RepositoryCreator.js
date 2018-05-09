import inquirer from 'inquirer'

import GitHandler from './GitHandler'
import GithubHandler from './GithubHandler'
import ReadmeHandler from './ReadmeHandler'
import { initializeCreateReactApp, installPackages } from './JsProjectHandler'

import { addSequenceItem, runSequence } from './SequenceRunner'

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
    type: 'confirm',
    name: 'isCreateReactApp',
    message: 'Should create-react-app be used?',
    default: function() {
      return true
    }
  },
  {
    type: 'checkbox',
    message: 'Which packages should be installed?',
    name: 'packagesToInstall',
    choices: [
      { name: 'prettier', checked: true },
      { name: 'eslint', checked: true }
    ]
  }
]

async function createRepository() {
  const repositoryDetails = await inquirer.prompt(
    projectCreationParametersQuestions
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
  if (repositoryDetails.isDefaultBranchProtected) {
    addSequenceItem(
      () =>
        GithubHandler.protectBranch(
          repositoryDetails.githubOrganizationName,
          repositoryDetails.repositoryName,
          'master'
        ),
      'Protecting branch'
    )
  }
  addSequenceItem(
    () => GitHandler.initRepository(),
    'Creating temporary local repository'
  )
  addSequenceItem(
    () => GitHandler.createBranch(repositoryDetails.defaultBranchName),
    'Creating master branch'
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
  if (repositoryDetails.isCreateReactApp) {
    addSequenceItem(
      () => initializeCreateReactApp(GitHandler.repoLocation),
      'Initializing create-react-app in the repository'
    )
  }
  if (repositoryDetails.packagesToInstall) {
    addSequenceItem(
      () =>
        installPackages(
          GitHandler.repoLocation,
          repositoryDetails.packagesToInstall
        ),
      'Installing given packages and setting configurations'
    )
  }
  addSequenceItem(
    () =>
      ReadmeHandler.addDefault(
        GitHandler.repoLocation,
        repositoryDetails.repositoryName
      ),
    'Adding default readme'
  )
  addSequenceItem(
    () =>
      GitHandler.addDefaultGitIgnore(
        GitHandler.repoLocation
      ),
    'Adding default gitignore'
  )
  // todo: should be optional, selectable via a list
  addSequenceItem(
    () => GitHandler.addDefaultHooks(),
    'Adding default git hooks'
  )
  addSequenceItem(
    () => GitHandler.createCommit('Initial commit'),
    'Creating initial commit'
  )
  addSequenceItem(
    () => GitHandler.pushBranch(repositoryDetails.defaultBranchName),
    'Pushing branch to remote'
  )
  runSequence()
}

module.exports = {
  createRepository
}
