const versionSuffix86 = '-win-x86';
const versionSuffix64 = '-win-x64';
const defaultArchitecture = process.arch === 'ia32' ? versionSuffix86 : versionSuffix64;
const repoLocation = process.env['HOME'] + '\\.wnvm';

module.exports = Object.freeze({
  NODE_JS_REPO: 'https://nodejs.org/dist/',
  NODE_JS_REPO_INDEX: 'https://nodejs.org/dist/index.json',
  INDEX_JSON: 'index.json',
  DIST_PREFIX: 'v',
  VERSION_PREFIX: 'node-v',
  VERSION_SUFFIX_X86: versionSuffix86,
  VERSION_SUFFIX_X64: versionSuffix64,
  DEFAULT_ARCHITECTURE: defaultArchitecture,
  ZIP_SUFFIX: '.zip',
  DOWNLOAD_LOCATION: "./nodes",
  REPO_LOCATION: repoLocation,
  REPO_CONFIG_LOCATION: repoLocation + '\\.wnvmrc',
  REPO_ACTIVE_LOCATION: repoLocation + '\\active'
});
