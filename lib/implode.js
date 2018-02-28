const fs = require('fs');
const chalk = require('chalk');
const ora = require('ora');
const util = require('util');
const child_process = require('child_process');
const constants = require('./constants');

const exec = util.promisify(child_process.exec);
const access = util.promisify(fs.access);
const readFile = util.promisify(fs.readFile);

exports = module.exports = implode

/**
 * Tries to revert all changes made by this module to the way there were before.
 */
async function implode() {
  let spinner;
  let history;

  console.log(chalk.cyan('\nReverting changes made by WNVM:\n'));

  spinner = ora({
    text: chalk.yellow('Reading .wnvmrc file'),
    color: 'yellow'
  }).start();
  try {
    history = JSON.parse(await readFile(constants.REPO_CONFIG_LOCATION, 'utf8'));
    spinner.succeed();
  } catch (e) {
    spinner.fail(chalk.yellow('Could not find .wnvmrc file.'));
  }

  spinner = ora({
    text: chalk.yellow('Putting back the value of NPM prefix'),
    color: 'yellow'
  }).start();
  if (history && history.oldPrefix) {
    await exec('npm config set prefix ' + history.oldPrefix);
    spinner.succeed();
  } else {
    spinner.fail(chalk.yellow('Could not find original value for NPM prefix'));
  }

  spinner = ora({
    text: chalk.yellow('Removing user variables'),
    color: 'yellow'
  }).start();
  await exec('setx NODE_HOME ""');
  await exec('setx WNVM_HOME ""');
  spinner.succeed();

  spinner = ora({
    text: chalk.yellow('Putting back the value of the Path variable'),
    color: 'yellow'
  }).start();
  if (history && history.oldPath) {
    let revertPathEnvCmd = 'setx Path "' + (history.oldPath && history.oldPath.join(';')) || '' + '"';
    await exec(revertPathEnvCmd);
    spinner.succeed();
  } else {
    spinner.fail(chalk.yellow('Could not find original value for Path'));
  }

  spinner = ora({
    text: chalk.yellow('Deleting the directory junction'),
    color: 'yellow'
  }).start();
  try {
    await access(constants.REPO_ACTIVE_LOCATION, fs.constants.F_OK);
    await exec('rd /S /Q ' + constants.REPO_ACTIVE_LOCATION);
    spinner.succeed();
  } catch (e) {
    spinner.fail(chalk.yellow('Could not find the directory junction'));
  }

  console.log(chalk.green('\nFinished imploding. After a `terminal` restart everything should be back to normal ... maybe :)'));
}
