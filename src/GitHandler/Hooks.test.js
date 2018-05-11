import test from 'ava'
import mockFs from 'mock-fs'
import fs from 'fs'

import { readHooks, filterHookScriptsToInclude, createHookFiles } from './Hooks'

const preCommit = {
  'angular.sample': 'script to verify angular commit meaages pre commit'
}

test.before(() => {
  mockFs({
    'scripts/hooks/': {
      'pre-commit': preCommit,
      'non-hook-file': '',
      'random-non-hook-directory': {}
    }
  })
})

test.after(() => {
  mockFs.restore()
})

test('readHooks return list of valid hooks', t => {
  const hooks = readHooks()
  t.deepEqual(hooks, {
    'pre-commit': [
      {
        ruleName: 'angular',
        script: preCommit['angular.sample']
      }
    ]
  })
})

test('filterHookScriptsToInclude returns the correct hooks files based on hooks and settings', t => {
  const hooks = {
    'pre-commit': [
      {
        ruleName: 'angular',
        script: 'angular commit message script'
      },
      {
        ruleName: 'do-not-include'
      }
    ]
  }
  const filter = ['pre-commit/angular']
  t.deepEqual(filterHookScriptsToInclude(hooks, filter), {
    'pre-commit': ['angular commit message script']
  })
})
