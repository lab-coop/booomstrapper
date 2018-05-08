'use strict'

import simpleGit from 'simple-git/promise'
import osTmpdir from 'os-tmpdir'
import fs from 'fs'
import path from 'path'
import rimraf from 'rimraf'
import Logger from './Logger'

import Logger from './Logger'

var repoLocation
const tempFolder = path.join(osTmpdir(), 'booomstrapper_temp_dir')
setRepositoryPath(tempFolder)

function setRepositoryPath(newPath) {
  repoLocation = newPath
  if (fs.existsSync(repoLocation)) {
    rimraf.sync(repoLocation)
  }
  fs.mkdirSync(repoLocation)
  Logger.debug('Git repository path:', repoLocation)
}

function getRepositoryPath() {
  return repoLocation
}

async function getCurrentBranch() {
  return simpleGit(repoLocation).branch()
}
async function pushToRemote(elementToPush, remoteName = 'origin') {
  return simpleGit(repoLocation).push([remoteName, elementToPush])
}
async function pushBranch(branch) {
  return pushToRemote(branch)
}
async function pushTag(tag) {
  await pushToRemote(tag)
}
async function createTag(tagName) {
  return simpleGit(repoLocation).addTag(tagName)
}
async function createCommit(message = '') {
  await simpleGit(repoLocation).add('./*')
  return simpleGit(repoLocation).commit(message)
}

async function revertRepository(hard = true) {
  let mode = hard ? '--hard' : '--soft'
  return simpleGit(repoLocation).reset([mode])
}

async function initRepository() {
  return simpleGit(repoLocation).init()
}

async function createBranch(branchName) {
  return simpleGit(repoLocation).checkoutLocalBranch(branchName)
}

async function addRemote(remoteName, remotePath) {
  return simpleGit(repoLocation).addRemote(remoteName, remotePath)
}

function addDefaultHooks() {
  const hooks = fs.readdirSync('./scripts/hooks/')
  hooks.forEach(hook => {
    fs.copyFileSync(
      path.join('.', 'scripts', 'hooks', hook),
      path.join(repoLocation, '.git', 'hooks', hook.replace('.sample', ''))
    )
  })
}

function addDefaultGitIgnore() {
  fs.copyFileSync(
    path.join('.', 'scripts', 'misc', '.gitignore'),
    path.join(repoLocation, '.gitignore')
  )
}

module.exports = {
  addRemote,
  createBranch,
  initRepository,
  revertRepository,
  createCommit,
  createTag,
  pushTag,
  pushBranch,
  pushToRemote,
  getCurrentBranch,
  repoLocation,
  addDefaultHooks,
  addDefaultGitIgnore,
  setRepositoryPath,
  getRepositoryPath
}
