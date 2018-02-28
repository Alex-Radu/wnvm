const fs = require('fs');
const chalk = require('chalk');
const ora = require('ora');
const util = require('util');
const child_process = require('child_process');
const constants = require('./constants');

const exec = util.promisify(child_process.exec);
const readdir = util.promisify(fs.readdir);
const mkdir = util.promisify(fs.mkdir);

exports = module.exports = init

/**
 * Initialises the WNVM tool. By default, the configuration file and installed Node versions are located in
 * %HOME%\.wnvm e.g. C:\Users\PC-User\.wnvm. If the folder doesn't exist, it will be created; if it does,
 * its contents will be scanned for folders matching a SemVer pattern e.g. 5.3.1. Lastly, a list of globally
 * installed npm packages will be fetched and saved for later use.
 */
async function init() {
  let repoContents;
  let existingNodeVersions = [];
  let spinner;

  console.log(chalk.cyan('\nInitialising WNVM:\n'));

  spinner = ora({
    text: chalk.yellow('Looking for previously installed versions of Node'),
    color: 'yellow'
  }).start();
  try {
    repoContents = await readdir(constants.REPO_LOCATION);
    existingNodeVersions = repoContents.filter((entry) => {
      return /^\d+\.\d+\.\d+$/g.test(entry);
    }).map((nodeVersion) => {
      return {
        name: nodeVersion,
        inUse: false
      }
    });

    if (existingNodeVersions.length) {
      spinner.succeed(chalk.yellow('Found and imported ' + existingNodeVersions.length + ' previously installed versions of Node'));
    } else {
      spinner.warn(chalk.yellow('I found the `.wnvm` folder but no versions of Node'));
    }
  } catch(error) {
    await mkdir(constants.REPO_LOCATION);
    spinner.succeed(chalk.yellow('Starting fresh - created `.wnvm` folder.'));
  }

  spinner = ora({
    text: chalk.yellow('Importing global NPM packages'),
    color: 'yellow'
  }).start();
  let { stdout, stderr } = await exec('npm ls --global --json --depth=0');
  let existingPackages = JSON.parse(stdout).dependencies;
  let defaultPackages = Object.keys(existingPackages).reduce((accumulator, key) => {
    if (existingPackages[key].from) {
      accumulator.push(key);
    }

    return accumulator;
  }, []);
  spinner.succeed(chalk.yellow('Imported ' + defaultPackages.length + ' global NPM packages'));

  spinner = ora({
    text: chalk.yellow('Saving current value for NPM prefix'),
    color: 'yellow'
  }).start();
  let nodePrefixCmd = await exec('npm config get prefix');
  let nodePrefix = nodePrefixCmd.stdout.replace('\n', '');
  spinner.succeed();

  spinner = ora({
    text: chalk.yellow('Taking a note of the Path value'),
    color: 'yellow'
  }).start();
  let nodeLocationCmd = await exec('where node');
  let nodeLocationPath = nodeLocationCmd.stdout.slice(0, nodeLocationCmd.stdout.lastIndexOf('\\'));
  let pathArray = process.env.path.split(';').filter((path) => path && !/(windows|program files|programdata)/gi.test(path));
  let sanitisedPathArray = pathArray.filter((path) => path !== nodeLocationPath);
  spinner.succeed();

  spinner = ora({
    text: chalk.yellow('Creating the directory junction'),
    color: 'yellow'
  }).start();
  try {
    await exec('mklink /J ' + constants.REPO_ACTIVE_LOCATION + ' ' + nodePrefix);
    spinner.succeed();
  } catch (e) {
    spinner.fail(chalk.yellow('Could not create directory junction; maybe it already exists -> ' + constants.REPO_ACTIVE_LOCATION));
  }

  spinner = ora({
    text: chalk.yellow('Setting up user variables'),
    color: 'yellow'
  }).start();
  await exec('setx NODE_HOME ' + constants.REPO_ACTIVE_LOCATION);
  await exec('setx WNVM_HOME ' + nodePrefix);
  let updatePathCommand = 'setx Path "' + sanitisedPathArray.join(';') + ';%NODE_HOME%;%WNVM_HOME%"';
  await exec(updatePathCommand);
  spinner.succeed();

  spinner = ora({
    text: chalk.yellow('Updating the NPM prefix'),
    color: 'yellow'
  }).start();
  await exec('npm config set prefix ' + constants.REPO_ACTIVE_LOCATION);
  spinner.succeed();

  spinner = ora({
    text: chalk.yellow('Writting the .wnvmrc file'),
    color: 'yellow'
  }).start();
  let historyString = JSON.stringify({
    nodes: existingNodeVersions.length ? existingNodeVersions : [],
    defaultPackages: defaultPackages,
    oldPrefix: nodePrefix,
    oldPath: pathArray
  }, null, '\t');
  fs.writeFile(constants.REPO_CONFIG_LOCATION, historyString, () => {
    spinner.succeed();
    console.log(chalk.green('\nFinished initialising. Restart the `terminal` for the changes to take effect :)'));
  });
}
