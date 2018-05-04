import program from 'commander'
import packageJson from '../package.json'
import ora from 'ora'
import GithubHandler from './GithubHandler'
import GitHandler from './GitHandler'
import Config from './Config'
import ReadmeHandler from './ReadmeHandler'
import Logger from './Logger'

const spinner = ora()
const sequence = []

function addSequenceItem(command, text) {
  sequence.push({ command, text })
}

async function runSequence(sequenceItems) {
  for (let sequenceItem of sequenceItems) {
    await run(sequenceItem.command, sequenceItem.text)
  }
}

async function run(delegate, text) {
  spinner.start(text)
  try {
    await delegate()
  } catch (error) {
    spinner.fail(`${text} - ${error.message}`)
    // todo: remove
    // todo: create proper revert if needed
    process.exit(-1)
  }
  spinner.succeed()
}

program.version(packageJson.version)

program.command('list-repositories <org>').action(async org => {
  const repositories = await GithubHandler.listRepositories(org)
  repositories.forEach(repository => {
    Logger.info(`${repository.name} - ${repository.url}`)
  })
})

program.command('init-repository <org> <name>').action(async (org, name) => {
  addSequenceItem(
    () => GithubHandler.createRepository(org, name),
    'Creating Github repository'
  )
  addSequenceItem(
    () => GitHandler.initRepository(),
    'Creating temporary local repository'
  )
  addSequenceItem(
    () => GitHandler.createBranch('master'),
    'Creating master branch'
  )
  addSequenceItem(
    () => GitHandler.addRemote('origin', `git@github.com:${org}/${name}.git`),
    'Adding remote to local repository'
  )
  addSequenceItem(
    () => ReadmeHandler.addDefault(GitHandler.repoLocation, name),
    'Adding default readme'
  )
  addSequenceItem(
    () => GitHandler.createCommit('Initial commit'),
    'Creating initial commit'
  )
  addSequenceItem(
    () => GitHandler.pushBranch('master'),
    'Pushing branch to remote'
  )
  addSequenceItem(
    () => GithubHandler.protectBranch(org, name, 'master'),
    'Protecting branch'
  )
})

async function prepareRun() {
  Config.initializeConfig()
  await GithubHandler.checkAuthInfo()
  program.parse(process.argv)
}

if (process.argv.length == 2) {
  program.outputHelp()
} else {
  prepareRun().then(() => {
    runSequence(sequence)
  })
}
