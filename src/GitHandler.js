'use strict'

import simpleGit from 'simple-git/promise'
import osTmpdir from 'os-tmpdir'
import fs from 'fs'
import path from 'path'
import rimraf from 'rimraf'
import Logger from './Logger'

const tempFolder = path.join(osTmpdir(), 'booomstrapper_temp_dir')

if (fs.existsSync(tempFolder)) {
  rimraf.sync(tempFolder)
}
fs.mkdirSync(tempFolder)

const repoLocation = tempFolder
Logger.info(repoLocation)

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
  return await simpleGit(repoLocation).addRemote(remoteName, remotePath)
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
  addDefaultHooks
}
