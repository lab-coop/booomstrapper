import _ from 'lodash'

import inquirer from 'inquirer'
import path from 'path'

import GitHandler from './GitHandler'
import GithubHandler from './GithubHandler'
import Logger from './Logger'
import ConfigHandler from './ConfigHandler'
import { initializeProject } from './JsProjectHandler'

import { addSequenceItem, runSequence } from './SequenceRunner'
import { getProjectOptions, enableProjectOptions } from './ProjectOptionHandler'

const supportedDependencies = getProjectOptions()

function generateActionChoices() {
  var choicesList = []
  const groupedActions = _.groupBy(supportedDependencies, 'category')
  Object.keys(groupedActions).forEach(category => {
    choicesList.push(new inquirer.Separator(`==${category}==`))
    choicesList = [
      ...choicesList,
      ...groupedActions[category].map(action => {
        return {
          name: action.ruleName,
          value: action,
          checked: action.checked
        }
      })
    ]
  })
  return choicesList
}

var projectCreationParametersQuestions = [
  {
    type: 'input',
    name: 'githubOrganizationName',
    message: "What's the target Github Organization?",
    default: function () {
      return 'booom-studio'
    },
    validate: function (answer) {
      if (answer.length < 1) {
        return 'The organization name should not be empty.'
      }
      return true
    },
    scope: 'remote'
  },
  {
    type: 'input',
    name: 'repositoryName',
    message: 'What should be the name of the repository?',
    validate: function (answer) {
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
    choices: [{ name: 'private' }, { name: 'public' }],
    validate: function (answer) {
      if (answer.length < 1) {
        return 'You must specify if the repository should be private or public.'
      }
      return true
    },
    scope: 'remote'
  },
  {
    type: 'input',
    name: 'defaultBranchName',
    message: 'What should be the name of the default branch?',
    default: function () {
      return 'master'
    },
    validate: function (answer) {
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
    default: function () {
      return true
    },
    scope: 'remote'
  },
  {
    type: 'list',
    message: 'What type of project should be created?',
    name: 'projectType',
    choices: [{ name: 'create-react-app' }, { name: 'plain-node' }],
    validate: function (answer) {
      if (answer.length < 1) {
        return 'You must specify if the project type.'
      }
      return true
    }
  },
  {
    type: 'checkbox',
    name: 'selectedDependencies',
    message: 'Which dependencies do you want to be installed and configured?',
    choices: generateActionChoices()
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

async function createRepository(options) {
  if (options.localRepoOnly) {
    projectCreationParametersQuestions = projectCreationParametersQuestions.filter(
      question => question.scope !== 'remote'
    )
  }
  const repositoryDetails = await inquirer.prompt(
    projectCreationParametersQuestions
  )
  GitHandler.setRepositoryPath(
    path.join(GitHandler.getRepositoryPath(), repositoryDetails.repositoryName)
  )
  if (!options.localRepoOnly) {
    addSequenceItem(
      () =>
        GithubHandler.createRepository(
          repositoryDetails.githubOrganizationName,
          repositoryDetails.repositoryName,
          repositoryDetails.publicity === 'private'
        ),
      'Creating Github repository'
    )
  }
  addSequenceItem(
    () => GitHandler.initRepository(),
    'Creating temporary local repository'
  )
  addSequenceItem(
    () => GitHandler.createBranch(repositoryDetails.defaultBranchName),
    `Creating default branch: ${repositoryDetails.defaultBranchName}`
  )
  if (!options.localRepoOnly) {
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
  }
  addSequenceItem(
    () =>
      initializeProject(
        GitHandler.getRepositoryPath(),
        repositoryDetails.projectType
      ),
    `Initializing ${repositoryDetails.projectType} project in the repository`
  )
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
  addSequenceItem(
    () =>
      enableProjectOptions(
        repositoryDetails.selectedDependencies,
        GitHandler.getRepositoryPath()
      ),
    `Adding selected dependencies: ${repositoryDetails.selectedDependencies.map(d => d.ruleName).join(', ')}`
  )
  addSequenceItem(
    () => GitHandler.createCommit('Initial commit'),
    'Creating initial commit'
  )
  if (!options.localRepoOnly) {
    addSequenceItem(
      () => GitHandler.pushBranch(repositoryDetails.defaultBranchName),
      'Pushing branch to remote'
    )
  }
  if (!options.localRepoOnly && repositoryDetails.isDefaultBranchProtected) {
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

  try {
    await runSequence()
    let successMessage = ''
    if (options.localRepoOnly) {
      successMessage = `
  Local path:        ${GitHandler.getRepositoryPath()}
      `
    } else {
      const { data: repoInfo } = await GithubHandler.getRemoteRepositoryInfo(
        repositoryDetails.githubOrganizationName,
        repositoryDetails.repositoryName
      )
      successMessage = `
  Clone using SSH:        ${repoInfo.ssh_url}
  Clone using HTTP:       ${repoInfo.clone_url}
    `
    }

    Logger.info(`

💣 💣 💣 💣 💣 BOOOM 💣 💣 💣 💣 💣

Repository successfully created!

${successMessage}
  `)
  } catch {
    // do nothing
  }
}

module.exports = {
  createRepository
}
