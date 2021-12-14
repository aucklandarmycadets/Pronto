/**
 * Read the current semantic version string from a file's contents
 * @ignore
 * @param {string} contents The contents of the file to bump
 * @returns {string} The current semantic version string
 */
module.exports.readVersion = contents => /(?:version: '|# Pronto v)(\d+\.\d+\.\d+)/.exec(contents)[1];

/**
 * Write the bumped semantic version string to a file's contents
 * @ignore
 * @param {string} contents The contents of the file to bump
 * @param {string} version The bumped semantic version string
 * @returns {string} The file contents with the bumped version
 */
module.exports.writeVersion = (contents, version) => contents.replace(/(version: '|# Pronto v)\d+.\d+.\d+/, `$1${version}`);