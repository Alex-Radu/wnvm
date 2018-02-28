#!/usr/bin/env node

const commander = require('commander');
const chalk = require('chalk');

const init = require('./lib/init');
const implode = require('./lib/implode');
const install = require('./lib/install');
const list = require('./lib/list');
const use = require('./lib/use');

commander.version('0.1.0');

commander
  .command('init')
  .description('- Initialises the tool by creating some helper files.')
  .action(init);

commander
  .command('implode')
  .description('- Reverts all changes made by this tool.')
  .action(implode);

commander
  .command('install <version> [architecture]')
  .description('- Install <version> of NodeJs. Specify x86 or x64 to override system architecture.')
  .action(install);

commander
  .command('use <version>')
  .description('- Use specified version of NodeJs.')
  .action(use);

commander
  .command('list')
  .description('- List installed versions.')
  .action(list);

commander.parse(process.argv)
