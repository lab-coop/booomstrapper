import fs from 'fs'
import _ from 'lodash'
import path from 'path'
import fsPath from 'fs-path'

import Logger from '../Logger'

const HOOK_DIR = './scripts/hooks'
const supportedHooks = ['pre-commit']

function isDirectory(path) {
  return fs.lstatSync(path).isDirectory()
}

/**
 * reads the hooks from HOOK_DIR
 * @return ({'hook-type': [{
 *   ruleName,
 *   script
 * }, ...]})
 */
function readHooks() {
  const result = {}
  let hooksToAdd = fs.readdirSync(HOOK_DIR)
  const notUsedFilenames = _.difference(hooksToAdd, supportedHooks)
  const usedFilenames = _.difference(hooksToAdd, notUsedFilenames)
  Logger.warn(
    `Ignoring the following hooks, as they are not supported: ${notUsedFilenames}`
  )
  const usedDirectories = usedFilenames.filter(filename =>
    isDirectory(`${HOOK_DIR}/${filename}`)
  )
  usedDirectories.forEach(directoryName => {
    const directoryPath = `${HOOK_DIR}/${directoryName}`
    result[directoryName] = fs.readdirSync(directoryPath).map(hookFilename => ({
      ruleName: hookFilename.replace(/\.sample$/, ''),
      script: fs.readFileSync(`${directoryPath}/${hookFilename}`, {
        encoding: 'utf8'
      })
    }))
  })
  return result
}

/**
 *
 * @param {*} hooks
 * @param {string[]} filters
 */
function filterHookScriptsToInclude(hooks, filters) {
  const scriptsToIncludeByHookType = {}
  filters.forEach(filter => {
    const [hookType, ruleName] = filter.split('/')
    scriptsToIncludeByHookType[hookType] =
      scriptsToIncludeByHookType[hookType] || []
    const scriptToInclude = hooks[hookType].find(
      rule => rule.ruleName === ruleName
    ).script
    scriptsToIncludeByHookType[hookType].push(scriptToInclude)
  })
  return scriptsToIncludeByHookType
}

/**
 * Unifies hooks of the same type (eg. pre-commit) and writes them to files
 * @param {Object.<string, Object>} scriptsToIncludeByHookType
 * @param {string} repoLocation
 */
function createHookFiles(scriptsToIncludeByHookType, repoLocation) {
  Object.keys(scriptsToIncludeByHookType).forEach(hookType => {
    fsPath.writeFile(
      path.join(repoLocation, '.git', 'hooks', hookType),
      scriptsToIncludeByHookType[hookType].join('\n\n')
    )
  })
}

module.exports = {
  readHooks,
  filterHookScriptsToInclude,
  createHookFiles
}
