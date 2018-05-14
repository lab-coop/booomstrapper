/** @module Hooks */

import fs from 'fs-extra'
import path from 'path'

import { installPackages, addScript } from '../JsProjectHandler'

const HOOK_DIR = '../../scripts/hooks'

/**
 * Hook parsed from filesytem
 * @typedef {Object} ParsedHook
 * @property {string} ruleName - name of the rule in the filesystem
 * @property {string} execute - script to execute if that rule is included
 * @property {string[]} dependencies - dev dependecies needed for the hook
 * @property {string} hookType - type of the hook (eg. pre-commit)
 */

/**
 * reads the hooks from HOOK_DIR
 * @return {ParsedHook[]}
 */
function readHooks() {
  let hooksToAdd = fs.readdirSync(path.join(__dirname, HOOK_DIR))
  return hooksToAdd
    .filter(hookPath => hookPath.endsWith('.js'))
    .map(hookPath => require(`${HOOK_DIR}/${hookPath}`))
}

/**
 * Returns the filtered available rules grouped by hook type
 * @param {ParsedHook[]} hooks
 * @param {string[]} filters
 */
function filterHookScriptsToInclude(hooks, filters) {
  return hooks.filter(hook => filters.indexOf(hook.ruleName) !== -1)
}

/**
 * @param {ParsedHook[]} scriptsToInclude
 * @param {string} repositoryPath
 */
async function addHuskyHooks(scriptsToInclude, repositoryPath) {
  await installPackages(repositoryPath, [{ name: 'husky', env: 'dev' }])
  for (let i = 0; i < scriptsToInclude.length; i++) {
    await addScript(repositoryPath, {
      name: scriptsToInclude[i].hookType,
      command: scriptsToInclude[i].execute
    })
  }
}

/**
 * @param {string[]} filters
 * @param {string} repositoryPath
 */
async function addHooks(filters, repositoryPath) {
  const hooks = readHooks()
  const scriptsToInclude = filterHookScriptsToInclude(hooks, filters)
  await addHuskyHooks(scriptsToInclude, repositoryPath)
}

module.exports = {
  addHooks
}
