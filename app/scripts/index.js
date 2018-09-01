// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'
import 'bootstrap/dist/css/bootstrap.css'
// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import mywalletArtifact from '../../build/contracts/MyWallet.json'

// wallet  is our usable abstraction, which we'll use through the code below.
const MyWallet = contract(mywalletArtifact)

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
let accounts
let account

const App = {
  start: function () {
    // Bootstrap the MetaCoin abstraction for Use.
    MyWallet.setProvider(web3.currentProvider)

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return
      }

      accounts = accs
      account = accounts[0]

      document.getElementById('addresses').innerHTML = accounts.join('<br />')

      App.basicInfoupdate()
      App.listenToEvents()
    })
  },
  basicInfoupdate: function () {
    MyWallet.deployed().then(function (instance) {
      document.getElementById('walletAddress').innerHTML = instance.address
      return web3.eth.getBalance(instance.address, function (e, result) {
        document.getElementById('walletEther').innerHTML = result.toNumber()
      })
    })
  },

  submitEtherToWallet: function () {
    MyWallet.deployed().then(function (instance) {
      return instance.sendTransaction({ from: account, to: instance.address, value: web3.toWei(5, 'ether') })
    }).then(function (txhash) {
      App.basicInfoupdate()
    })
  },

  listenToEvents: function () {
    MyWallet.deployed().then(function (instance) {
      instance.recievedFunds({}, { fromBlock: 0, toBlock: 'latest' }).watch(function (error, event) {
        if (error) {
          console.error(error)
        } else {
          document.getElementById('fundEvents').innerHTML += JSON.stringify(event)
        }
      })
      instance.proposalRecieved({}, { fromBlock: 0, toBlock: 'latest' }).watch(function (error, event) {
        if (error) {
          console.error(error)
        } else {
          document.getElementById('proposalEvents').innerHTML += JSON.stringify(event)
        }
      })
    })
  },

  confirmedProposal: function (propID) {
    MyWallet.deployed().then(function (instance) {
      return instance.confirmProposal(propID, { from: accounts[0] })
    }).then(function (results) {
      console.log(results)
      App.basicInfoupdate()
    })
  },
  submitTransaction: function () {
    var _to = document.getElementById('to').value
    var _amount = parseInt(document.getElementById('amount').value)
    var _reason = document.getElementById('reason').value

    MyWallet.deployed().then(function (instance) {
      return instance.spendMoneyOn(_to, web3.toWei(_amount, 'ether'), _reason, { from: accounts[1], gas: 3000000 })
    }).then(function (result) {
      console.log(result)
      App.basicInfoupdate()
      if (result.logs[0].args.proposal_id.toNumber() !== 0) {
        App.confirmedProposal(result.logs[0].args.proposal_id.toNumber())
      }
    }).catch(function (err) {
      console.log(err)
    })
  }
}

window.App = App
window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn(
      'Using web3 detected from external source.' +
      ' If you find that your accounts don\'t appear or you have 0 MetaCoin,' +
      ' ensure you\'ve configured that source properly.' +
      ' If using MetaMask, see the following link.' +
      ' Feel free to delete this warning. :)' +
      ' http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn(
      'No web3 detected. Falling back to http://127.0.0.1:9545.' +
      ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
      ' Consider switching to Metamask for development.' +
      ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
  }

  App.start()
})
