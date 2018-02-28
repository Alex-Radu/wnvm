const fs = require('fs');
const chalk = require('chalk');
const util = require('util');
const constants = require('./constants');

const readFile = util.promisify(fs.readFile);


exports = module.exports = list;

/**
 * Lists all installed versions of Node and highlights the one that is in use
 */
async function list() {
  console.log(chalk.cyan('\nAvailable Node versions:\n'));

  try {
    let history = JSON.parse(await readFile(constants.REPO_CONFIG_LOCATION, 'utf8'));
    history.nodes.forEach((node) => console.log(node.inUse ? chalk.green('-> ' + node.name + ' <-') : chalk.yellow('   ' + node.name)));
  } catch (e) {
    console.log(chalk.red('✖') + chalk.yellow(' No .wnvmrc file; run `wnvm init` to begin'));
  }
}
