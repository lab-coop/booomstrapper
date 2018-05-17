/** @module ProjectOptionHandler */

import fs from 'fs-extra'
import path from 'path'
import _ from 'lodash'
import Ajv from 'ajv';

import Logger from '../Logger'
import { addDefaultConfig } from '../ConfigHandler'
import { installPackages, addScript } from '../JsProjectHandler'

const DESCRIPTOR_DIRECTORY = './ProjectOptionDescriptors'
const ajv = new Ajv({ allErrors: true })
const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['category', 'ruleName'],
  properties: {
    ruleName: { type: 'string' },
    execute: { type: 'string' },
    dependencies: { type: 'array', items: { type: 'string' } },
    scriptName: { type: 'string' },
    category: { type: 'string' },
    checked: { type: 'boolean' },
    config: { type: 'string' }
  }
};
const validator = ajv.compile(schema)


function _validateDescriptor(descriptor) {
  const validationResult = validator(descriptor)
  if (!validationResult) {
    Logger.error('Invalid option descriptor:', descriptor.ruleName)
    Logger.debug(JSON.stringify(validator.errors, null, 2))
  }
}

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
    .map(optionDescriptorPath => {
      const descriptor = require(`${descriptorFolderPath}/${optionDescriptorPath}`)
      _validateDescriptor(descriptor)
      return descriptor
    })
}

/**
 * @param {ParsedDescriptor[]} optionsToInclude
 * @param {string} repositoryPath
 */
async function enableProjectOptions(optionsToInclude, repositoryPath) {
  const packagesToInstall = optionsToInclude.reduce(
    (acc, optionDescriptor) => [...acc, ...optionDescriptor.dependencies], []
  )
  await installPackages(
    repositoryPath,
    _.uniq(packagesToInstall).map(packageName => ({ name: packageName, env: 'dev' }))
  )
  for (let i = 0; i < optionsToInclude.length; i++) {
    await addScript(repositoryPath, {
      name: optionsToInclude[i].scriptName,
      command: optionsToInclude[i].execute
    })

    if (optionsToInclude[i].config) {
      addDefaultConfig(repositoryPath, optionsToInclude[i].config)
    }
  }
}

module.exports = {
  enableProjectOptions,
  getProjectOptions
}
