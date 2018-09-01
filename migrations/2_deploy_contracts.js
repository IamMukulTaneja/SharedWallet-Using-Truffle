var myWallet = require('./MyWallet.sol')

module.exports = function (deployer) {
  deployer.deploy(myWallet)
}
