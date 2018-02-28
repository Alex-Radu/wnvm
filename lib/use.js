const chalk = require('chalk');
const child_process = require('child_process');
const fs = require('fs');
const ora = require('ora');
const util = require('util');

const constants = require('./constants');
const exec = util.promisify(child_process.exec);
const readFile = util.promisify(fs.readFile);

exports = module.exports = use;

/**
 * [useNode description]
 * @param  {String} version [description]
 */
async function use(version) {
  let spinner;
  let history;

  console.log(chalk.cyan('\nSwitching to Node ' + version + ':\n'));

  spinner = ora({
    text: chalk.yellow('Cheking if version is installed'),
    color: 'yellow'
  }).start();
  try {
    history = JSON.parse(await readFile(constants.REPO_CONFIG_LOCATION, 'utf8'));
  } catch (e) {
    spinner.fail(chalk.yellow('No .wnvmrc file; run `wnvm init` to begin'));
    return;
  }

  let versionIndex = history.nodes.findIndex((element) => element.name === version);

  if (versionIndex === -1) {
    spinner.fail(chalk.yellow('Node ' + version + ' is not installed yet. Use `wnvm install ' + version + '` to install it'))
    return;
  }
  spinner.succeed();

  spinner = ora({
    text: chalk.yellow('Activating requested version'),
    color: 'yellow'
  }).start();
  try {
    await exec('rd /S /Q ' + constants.REPO_ACTIVE_LOCATION);
    await exec('mklink /J ' + constants.REPO_ACTIVE_LOCATION + ' ' + constants.REPO_LOCATION + '\\' + version);
    spinner.succeed();
  } catch (e) {
    spinner.fail(chalk.yellow('Something went wrong. Maybe `wnvm init` will help'));
    return;
  }

  spinner = ora({
    text: chalk.yellow('Updating the .wnvmrc file'),
    color: 'yellow'
  }).start();
  history.nodes[versionIndex].inUse = true;
  let historyString = JSON.stringify(history, null, '\t');
  fs.writeFile(constants.REPO_CONFIG_LOCATION, historyString, () => {
    spinner.succeed();
    console.log(chalk.green('\nDone! Your shiny version of Node is ready to serve :)'));
  });
}
