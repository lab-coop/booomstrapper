/** @module Hooks */

import fs from 'fs-extra'
import path from 'path'

import { addDefaultConfig } from '../ConfigHandler'
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
function getHooks() {
  let hooksToAdd = fs.readdirSync(path.join(__dirname, HOOK_DIR))
  return hooksToAdd
    .filter(hookPath => hookPath.endsWith('.js'))
    .map(hookPath => require(`${HOOK_DIR}/${hookPath}`))
}

/**
 * @param {ParsedHook[]} scriptsToInclude
 * @param {string} repositoryPath
 */
async function addHuskyHooks(scriptsToInclude, repositoryPath) {
  const packagesToInstall = scriptsToInclude.reduce(
    (acc, scriptInfo) => (acc = [...acc, ...scriptInfo.dependencies]),
    ['husky']
  )
  await installPackages(
    repositoryPath,
    packagesToInstall.map(packageName => ({ name: packageName, env: 'dev' }))
  )
  for (let i = 0; i < scriptsToInclude.length; i++) {
    await addScript(repositoryPath, {
      name: scriptsToInclude[i].hookType,
      command: scriptsToInclude[i].execute
    })

    if (scriptsToInclude[i].config) {
      console.log(scriptsToInclude[i].config)
      addDefaultConfig(repositoryPath, scriptsToInclude[i].config)
    }
  }
}

/**
 * @param {ParsedHook[]} hooks
 * @param {string} repositoryPath
 */
async function addHooks(hooks, repositoryPath) {
  await addHuskyHooks(hooks, repositoryPath)
}

module.exports = {
  addHooks,
  getHooks
}
