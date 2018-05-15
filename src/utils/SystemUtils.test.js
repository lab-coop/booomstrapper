import test from 'ava'
import { exec } from 'child_process'

import { runCommand } from './SystemUtils'

test('runCommand should execute shell commands', async t => {
  const command = 'pwd'
  const runCommandOutput = await runCommand(command, false, process.cwd(), true)
  const shellOutput = await new Promise(resolve => {
    exec(command, (error, stdout) => {
      resolve(stdout)
    })
  })
  t.is(runCommandOutput, shellOutput)
})

test('runCommand returns proper exit code on failed run', async t => {
  const command = 'exit 1'
  const runCommandOutput = await runCommand(command, false)
  t.is(runCommandOutput, 1)
})

test('runCommand returns 0 exit code on successful run', async t => {
  const command = 'echo "ok"'
  const runCommandOutput = await runCommand(command, false)
  t.is(runCommandOutput, 0)
})
