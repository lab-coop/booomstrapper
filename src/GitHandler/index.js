'use strict'

import simpleGit from 'simple-git/promise'
import osTmpdir from 'os-tmpdir'
import path from 'path'

import Logger from '../Logger'
import { createEmptyFolder } from '../utils/SystemUtils'
import { addHooks } from './Hooks'

var repoLocation
const tempFolder = path.join(osTmpdir(), 'booomstrapper_temp_dir')
setRepositoryPath(tempFolder)

function setRepositoryPath(newPath) {
  repoLocation = newPath
  createEmptyFolder(repoLocation)
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
  return simpleGit(repoLocation).commit(message, undefined, {
    '--no-verify': undefined
  })
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
  addHooks,
  setRepositoryPath,
  getRepositoryPath
}
