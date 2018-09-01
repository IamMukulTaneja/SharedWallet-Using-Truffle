
var wallet = artifacts.require('./MyWallet.sol')
contract('MyWallet', function (accounts) {
  it('should be possible to put money inside', function () {
    let contractInstance
    return wallet.deployed().then(function (instance) {
      contractInstance = instance
      return contractInstance.sendTransaction({ value: web3.toWei(10, 'ether'), address:contractInstance.address, from: accounts[0] })
    }).then(function (results) {
      assert.equal(web3.eth.getBalance(contractInstance.address).toNumber(), web3.toWei(10, 'ether'), 'The Balance is the same')
    })
  })

  it('should be possible to get money back as the owner', function () {
    let walletInstance
    let balanceBeforeSend
    let balanceAfterSend
    let amountToSend = web3.toWei(5, 'ether')
    return wallet.deployed().then(function (instance) {
      walletInstance = instance
      balanceBeforeSend = web3.eth.getBalance(instance.address).toNumber()
      return walletInstance.spendMoneyOn(accounts[0], amountToSend, "Because I'm the owner", { from: accounts[0] })
    }).then(function () {
      return web3.eth.getBalance(walletInstance.address).toNumber()
    }).then(function (balance) {
      balanceAfterSend = balance
      assert.equal(balanceBeforeSend - amountToSend, balanceAfterSend, 'Balance is now 5 ether less than before')
    })
  })

  it('should be possible to propose and confirm spending money', function () {
    let walletInstance
    return wallet.deployed().then(function (instance) {
      walletInstance = instance
      return walletInstance.spendMoneyOn(accounts[1], web3.toWei(5, 'ether'), 'Because I need money', { from: accounts[1] })
    }).then(function () {
      assert.equal(web3.eth.getBalance(walletInstance.address).toNumber(), web3.toWei(5, 'ether'), 'Balance is now 5 ether less than before')
    })
  })

  it('should be possible to confirm proposal', function () {
    let walletInstance
    let proposalID
    return wallet.deployed().then(function (instance) {
      walletInstance = instance
      return walletInstance.spendMoneyOn(accounts[0], web3.toWei(5, 'ether'), 'Because I need money', { from: accounts[1] })
    }).then(function (results) {
      console.log(results.logs[0].args)
      proposalID = results.logs[0].args.proposal_id.toNumber()

      return walletInstance.confirmProposal(proposalID, { from: accounts[0] })
    }).then(function (results) {
      console.log(results.logs[0].args)
      assert.equal(results.logs[0].args.value, true, 'value is true')
    })
  })
})
