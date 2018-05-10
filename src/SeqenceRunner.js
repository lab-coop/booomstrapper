import ora from 'ora'

const spinner = ora()
const sequenceItems = []

function addSequenceItem(command, text) {
  sequenceItems.push({ command, text })
}

function clearSequence() {
  sequenceItems.splice(0, sequenceItems.length)
}

async function runSequence() {
  for (let sequenceItem of sequenceItems) {
    if (!(await run(sequenceItem.command, sequenceItem.text))) {
      clearSequence()
      return
    } 
  }
  clearSequence()
}

async function run(delegate, text) {
  spinner.start(text)
  try {
    await delegate()
  } catch (error) {
    spinner.fail(`${text} - ${error.message}`)
    return false
  }
  spinner.succeed()
  return true
}

module.exports = {
  addSequenceItem,
  runSequence
}
