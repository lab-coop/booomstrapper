import { runCommand } from './utils/SystemUtils'

async function initializeCreateReactApp(repositoryPath) {
  // todo: check npm version
  await runCommand(`npx create-react-app ${repositoryPath}`, false)
}

module.exports = {
  initializeCreateReactApp
}
