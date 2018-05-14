/** @module Hooks */

import fs from 'fs-extra'
import _ from 'lodash'
import path from 'path'

import Logger from '../Logger'
import { installPackages, addScript } from '../JsProjectHandler'

const HOOK_DIR = './scripts/hooks'
const supportedHooks = ['pre-commit']

/**
 * Hook parsed from filesytem
 * @typedef {Object} ParsedHook
 * @property {string} ruleName - name of the rule in the filesystem
 * @property {string} script - script to execute if that rule is included
 */

/**
 * Hooks parsed from filesytem
 * @typedef {Object.<string, Object.<string, ParsedHook>>} ParsedHooks
 *                  |- hook type    |- hook name
 */

function isDirectory(path) {
  return fs.lstatSync(path).isDirectory()
}

/**
 * reads the hooks from HOOK_DIR
 * @return {ParsedHooks}
 */
function readHooks() {
  const result = {}
  let hooksToAdd = fs.readdirSync(HOOK_DIR)
  const notUsedFilenames = _.difference(hooksToAdd, supportedHooks)
  const usedFilenames = _.difference(hooksToAdd, notUsedFilenames)
  Logger.debug(
    `Ignoring the following hooks, as they are not supported: ${notUsedFilenames}`
  )
  const usedDirectories = usedFilenames.filter(filename =>
    isDirectory(`${HOOK_DIR}/${filename}`)
  )
  usedDirectories.forEach(directoryName => {
    const directoryPath = `${HOOK_DIR}/${directoryName}`
    result[directoryName] = {}
    fs.readdirSync(directoryPath).forEach(hookFilename => {
      const name = hookFilename.replace(/\.sample$/, '')
      result[directoryName][name] = {
        ruleName: name,
        script: fs.readFileSync(`${directoryPath}/${hookFilename}`, {
          encoding: 'utf8'
        })
      }
    })
  })
  return result
}

/**
 * Returns the filtered available rules grouped by hook type
 * @param {ParsedHooks} hooks
 * @param {string[]} filters
 */
function filterHookScriptsToInclude(hooks, filters) {
  const scriptsToIncludeByHookType = {}
  filters.forEach(filter => {
    const [hookType, ruleName] = filter.split('/')
    scriptsToIncludeByHookType[hookType] =
      scriptsToIncludeByHookType[hookType] || []
    const scriptToInclude = _.get(hooks, `${hookType}.${ruleName}.script`)
    if (scriptToInclude) {
      scriptsToIncludeByHookType[hookType].push(scriptToInclude)
    }
  })
  return scriptsToIncludeByHookType
}

/**
 * Unifies hooks of the same type (eg. pre-commit) and writes them to files
 * @param {Object.<string, string[]>} scriptsToIncludeByHookType
 * @param {string} repoLocation
 */
function createHookFiles(scriptsToIncludeByHookType, repoLocation) {
  fs.ensureDirSync(path.join(repoLocation, '.githooks'))
  Object.keys(scriptsToIncludeByHookType).forEach(hookType => {
    fs.writeFileSync(
      path.join(repoLocation, '.githooks', hookType),
      scriptsToIncludeByHookType[hookType].join('\n\n')
    )
  })
}

async function addHuskyHooks(scriptsToIncludeByHookType, repositoryPath) {
  await installPackages(repositoryPath, [{ name: 'husky', env: 'dev' }])
  await addScript(repositoryPath, {
    name: 'precommit',
    command: 'bash .githooks/pre-commit'
  })
}

module.exports = {
  readHooks,
  filterHookScriptsToInclude,
  createHookFiles,
  addHuskyHooks
}
