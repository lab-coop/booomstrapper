const fs = require('fs')
const path = require('path')

addDefault = (repoPath, repoName) => {
  fs.writeFileSync(
    path.join(repoPath, 'Readme.md'),
    `## ${repoName}\n\nRepository created via Boomstrapper`
  )
}

module.exports = {
  addDefault
}
