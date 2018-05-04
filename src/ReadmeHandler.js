'use strict'

import fs from 'fs'
import path from 'path'

function addDefault(repoPath, repoName) {
  fs.writeFileSync(
    path.join(repoPath, 'Readme.md'),
    `## ${repoName}\n\nRepository created via Boomstrapper`
  )
}

module.exports = {
  addDefault
}
