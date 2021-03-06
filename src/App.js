#! /usr/bin/env node
'use strict'

import program from 'commander'
import packageJson from '../package.json'

import GithubHandler from './GithubHandler'
import Config from './Config'
import Logger from './Logger'
import { createRepository } from './RepositoryCreator'

program.version(packageJson.version)

program.command('list-repositories <org>').action(async org => {
  const repositories = await GithubHandler.listRepositories(org)
  repositories.forEach(repository => {
    Logger.info(`${repository.name} - ${repository.url}`)
  })
})

program
  .command('init-repository')
  .option('-l, --local-repo-only', 'Does not create the remote repository')
  .action(async cmd => {
    await createRepository({ localRepoOnly: cmd.localRepoOnly })
  })

program.command('reset-authentication').action(async () => {
  await GithubHandler.resetAuthInfo()
})

async function prepareRun() {
  Config.initializeConfig()
  await GithubHandler.checkAuthInfo()
}

if (process.argv.length == 2) {
  program.outputHelp()
} else {
  prepareRun().then(() => {
    program.parse(process.argv)
  })
}
