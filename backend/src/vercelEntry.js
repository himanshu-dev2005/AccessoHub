const moduleAlias = require('module-alias');

moduleAlias.addAlias('@', __dirname);

module.exports = require('./app');
