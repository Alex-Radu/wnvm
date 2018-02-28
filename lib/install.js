const chalk = require('chalk');
const fs = require('fs');
const https = require('https');
const ora = require('ora');
const StreamZip = require('node-stream-zip');
const util = require('util');

const constants = require('./constants');
const readFile = util.promisify(fs.readFile);

exports = module.exports = install

/**
 * Installs the requested Node version. It downloads a .zip file, extracts it and updates the .wnmrc file.
 *
 * @param  {String} version      [the Node version to be installed]
 * @param  {String} architecture [the architecture version]
 */
async function install(version, architecture) {
  let spinner;
  let history;

  console.log(chalk.cyan('\nInstalling Node ' + version + ':\n'));

  spinner = ora({
    text: chalk.yellow('Cheking if version is already installed'),
    color: 'yellow'
  }).start();
  try {
    history = JSON.parse(await readFile(constants.REPO_CONFIG_LOCATION, 'utf8'));
  } catch (e) {
    spinner.fail(chalk.yellow('No .wnvmrc file; run `wnvm init` to begin'));
    return;
  }
  if (history.nodes.find((element) => element.name === version)) {
    spinner.warn(chalk.yellow('Node ' + version + ' is already installed. Use `wnvm use ' + version + '` to switch to it :)'));
    return;
  }
  spinner.succeed();

  let architectureSuffix = architecture === '86' ? constants.VERSION_SUFFIX_X86 :
    architecture === '64' ? constants.VERSION_SUFFIX_X64 : constants.DEFAULT_ARCHITECTURE;
  let URI = constants.NODE_JS_REPO + constants.DIST_PREFIX + version + '/' + constants.VERSION_PREFIX + version +
    architectureSuffix + constants.ZIP_SUFFIX;

  spinner = ora({
    text: chalk.yellow('Looking for the specified version'),
    color: 'yellow'
  }).start();
  https.get(URI, (response) => {
    const { statusCode } = response;

    if (statusCode === 404) {
      spinner.fail(chalk.yellow('Couldn\'t find specified version. Try one of these:\n'));
      recommendVersion(version);
      return;
    } else {
      spinner.succeed();
    }

    let total = parseInt(response.headers['content-length'], 10);
    let partial = 0;

    spinner = ora({
      text: chalk.yellow('Downloading a fresh copy just for you - 0%'),
      color: 'yellow'
    }).start();

    response.on('data', (chunk) => {
      partial += chunk.length;
      spinner.text = chalk.yellow('Downloading a fresh copy just for you - ' + (partial * 100 / total).toFixed(2) + '%')
    });

    response.on('end', () => spinner.succeed());

    response.pipe(fs.createWriteStream(version + '.zip')).on('finish', () => {
      const zipFile = new StreamZip({
        file: version + '.zip'
      });

      spinner = ora({
        text: chalk.yellow('Extracting the archive. This might take a few minutes'),
        color: 'yellow'
      }).start();

      zipFile.on('ready', () => {
        const versionLocation = constants.REPO_LOCATION + '\\' + version;
        fs.mkdirSync(versionLocation);
        zipFile.extract(constants.VERSION_PREFIX + version + architectureSuffix, versionLocation, (error, count) => {
          if (error) {
            spinner.fail(chalk.yellow(error));
          } else {
            spinner.succeed(chalk.yellow('Finished extracting - ' + count + ' entries if you want to know'));
            history.nodes.push({
              name: version,
              inUse: false
            })

            spinner = ora({
              text: chalk.yellow('Updating the .wnvmrc file'),
              color: 'yellow'
            }).start();
            let historyString = JSON.stringify(history, null, '\t');
            fs.writeFile(constants.REPO_CONFIG_LOCATION, historyString, () => {
              spinner.succeed();
              spinner = ora({
                text: chalk.yellow('Cleaning up'),
                color: 'yellow'
              }).start();
              fs.unlink('./' + version + '.zip', () => {
                spinner.succeed();
                console.log(chalk.green('\nFinished installing. Start using it TODAY! :)'));
              });
            });
          }
          zipFile.close();
        })
      })
    });
  });
}
/**
 * Retrieves available version of Node and recommends one that is close to the one that was requested initially.
 *
 * @param  {String} reqVersion [the requested version of node]
 */
function recommendVersion(reqVersion) {
  https.get(constants.NODE_JS_REPO_INDEX, (response) => {
    let rawData = '';

    response.on('data', (chunk) => { rawData += chunk; });
    response.on('end', () => {
      let availabeVersions = JSON.parse(rawData).map((element) => {
        let version = element.version.slice(1);
        let versionSplit = version.split('.');

        return {
          version: version,
          major: versionSplit[0],
          minor: versionSplit[1],
          patch: versionSplit[2]
        }
      });

      let reqVersionSplit = reqVersion.split('.');
      let recommendArray = availabeVersions.filter((element) => {
        return element.major === reqVersionSplit[0] && ( element.minor === reqVersionSplit[1] || element.patch === reqVersionSplit[2] )
      });

      recommendArray.forEach((element) => console.log(chalk.green('  * ', element.version)));
    });
  });
}
