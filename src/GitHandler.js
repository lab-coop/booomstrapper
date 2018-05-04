'use strict'

import simpleGit from 'simple-git/promise'
import osTmpdir from 'os-tmpdir'
import fs from 'fs'
import path from 'path'
import rimraf from 'rimraf'

const tempFolder = path.join(osTmpdir(), 'booomstrapper_temp_dir')

if (fs.existsSync(tempFolder)) {
  rimraf.sync(tempFolder)
}
fs.mkdirSync(tempFolder)

this.repoLocation = tempFolder

this.getCurrentBranch = async () => {
  return simpleGit(this.repoLocation).branch()
}

this.pushToRemote = async (elementToPush, remoteName = 'origin') => {
  return simpleGit(this.repoLocation).push([remoteName, elementToPush])
}

this.pushBranch = async branch => {
  return this.pushToRemote(branch)
}

this.pushTag = async tag => {
  await this.pushToRemote(tag)
}

this.createTag = async tagName => {
  return simpleGit(this.repoLocation).addTag(tagName)
}

this.createCommit = async (message = '') => {
  await simpleGit(this.repoLocation).add('./*')
  return simpleGit(this.repoLocation).commit(message)
}

this.revertRepository = async (hard = true) => {
  let mode = hard ? '--hard' : '--soft'
  return simpleGit(this.repoLocation).reset([mode])
}

this.initRepository = async () => {
  return simpleGit(this.repoLocation).init()
}

this.createBranch = async branchName => {
  return simpleGit(this.repoLocation).checkoutLocalBranch(branchName)
}

this.addRemote = async (remoteName, remotePath) => {
  return await simpleGit(this.repoLocation).addRemote(remoteName, remotePath)
}
