import test from 'ava'
import { exec } from 'child_process'

import {runCommand} from './SystemUtils'

test('runCommand should execute shell commands', async t => {
  const command = 'pwd'
  const runCommandOutput = await runCommand(command, false, true)
  const shellOutput = await new Promise(resolve => {
    exec(command, (error, stdout) => {
      resolve(stdout)
    })
  })
  t.is(runCommandOutput, shellOutput)
})
