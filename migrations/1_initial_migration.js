var Migrations = require('../contracts/Migrations.sol')

module.exports = function (deployer) {
  deployer.deploy(Migrations)
}
