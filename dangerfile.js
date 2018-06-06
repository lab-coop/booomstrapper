import { danger, warn, fail } from "danger";
import _ from 'lodash';

if (danger.github.pr.body.length < 10) {
  warn("Please include a description of your PR changes.");
}

if (!danger.github.pr.assignee) {
  const method = danger.github.pr.title.includes("WIP") ? warn : fail
  method("This pull request needs an assignee, and optionally include any reviewers.")
}

const packageChanged = _.includes(danger.git.modified_files, 'package.json');
const lockfileChanged = _.includes(danger.git.modified_files, 'yarn.lock');
if (packageChanged && !lockfileChanged) {
  const message = 'Changes were made to package.json, but not to yarn.lock';
  const idea = 'Perhaps you need to run `yarn install`?';
  fail(`${message} - <i>${idea}</i>`);
}

var bigPRThreshold = 600;
if (danger.github.pr.additions + danger.github.pr.deletions > bigPRThreshold) {
  warn('This pr seems to be a bit too big.')
}