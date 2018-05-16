/** @module ProjectOptionHandler */

import fs from 'fs-extra'
import path from 'path'

import _ from 'lodash'

import { addDefaultConfig } from '../ConfigHandler'
import { installPackages, addScript } from '../JsProjectHandler'

const DESCRIPTOR_DIRECTORY = './ProjectOptionDescriptors'

/**
 * Descriptor parsed from filesytem
 * @typedef {Object} ParsedDescriptor
 * @property {string} ruleName - name of the rule in the filesystem
 * @property {string} execute - script to execute if that rule is included
 * @property {string[]} dependencies - dev dependecies needed for the option
 * @property {string} scriptName - type of the option (eg. pre-commit)
 */

/**
 * reads the descriptors from DESCRIPTOR_DIRECTORY
 * @return {ParsedDescriptor[]}
 */
function getProjectOptions(descriptorFolderPath = path.join(__dirname, DESCRIPTOR_DIRECTORY)) {
  let optionToAdd = fs.readdirSync(descriptorFolderPath)
  return optionToAdd
    .filter(optionDescriptorPath => optionDescriptorPath.endsWith('.js'))
    .map(optionDescriptorPath => require(`${descriptorFolderPath}/${optionDescriptorPath}`))
}

/**
 * @param {ParsedDescriptor[]} scriptsToInclude
 * @param {string} repositoryPath
 */
async function addHuskyHooks(scriptsToInclude, repositoryPath) {
  const packagesToInstall = scriptsToInclude.reduce(
    (acc, scriptInfo) => [...acc, ...scriptInfo.dependencies], []
  )
  await installPackages(
    repositoryPath,
    _.uniq(packagesToInstall).map(packageName => ({ name: packageName, env: 'dev' }))
  )
  for (let i = 0; i < scriptsToInclude.length; i++) {
    await addScript(repositoryPath, {
      name: scriptsToInclude[i].scriptName,
      command: scriptsToInclude[i].execute
    })

    if (scriptsToInclude[i].config) {
      addDefaultConfig(repositoryPath, scriptsToInclude[i].config)
    }
  }
}

/**
 * @param {ParsedDescriptor[]} options
 * @param {string} repositoryPath
 */
async function enableProjectOptions(options, repositoryPath) {
  await addHuskyHooks(options, repositoryPath)
}

module.exports = {
  enableProjectOptions,
  getProjectOptions
}
