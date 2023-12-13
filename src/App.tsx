import {useEffect, useRef, useState} from 'react'
import reactLogo from './assets/gsn-green-vector.svg'
import viteLogo from './assets/gsn-green-vector.svg'
import './App.css'

import { BrowserProvider, Contract } from 'ethers'
import { RelayProvider } from '@opengsn/provider'

const targetFunctionAbiEntry = {
    "inputs": [],
    "name": "captureTheFlag",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}

const acceptEverythingPaymasterGoerli = '0x7e4123407707516bD7a3aFa4E3ebCeacfcbBb107'
const Erc2771RecipientAddress = '0xF4B948b1aE5635ce9020515e3B77A8634CC87C88'

async function connect() {
  const injected = (window as any).ethereum
  if (injected) {
    await injected.request({ method: "eth_requestAccounts" });
  } else {
    console.log("No MetaMask wallet to connect to");
  }
}

function App() {
  const [ready, setReady] = useState(false)

  const contract = useRef<Contract | null>(null)

  connect()
  useEffect(() => {
    // @ts-ignore
    const ethereum = window.ethereum;
    const ethersProvider = new BrowserProvider(ethereum)
      RelayProvider.newEthersV6Provider({
      provider: ethersProvider,
      config: {
        paymasterAddress: acceptEverythingPaymasterGoerli
      }
    }).then(
      ({gsnSigner}) => {
        console.log('RelayProvider init success')
        contract.current = new Contract(Erc2771RecipientAddress, [targetFunctionAbiEntry], gsnSigner)
        setReady(true)
      })
  }, [])

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
        </a>
      </div>
      <h1>Transfer Tokens with GSN (on Goerli)</h1>
      <div className="card">
          {
              ready ? (
                <div>
                  <input type="text" placeholder="Recipient Address" id="recipientAddress" />
                  <input type="number" placeholder="Token Amount" id="tokenAmount" />
                  <button

                    onClick={async () => {
                      const recipientAddress = document.getElementById("recipientAddress").value;
                      const tokenAmount = parseInt(document.getElementById("tokenAmount").value);

                      if (!recipientAddress) {
                        alert("Please enter a valid recipient address.");
                        return;
                      }
            
                      if (!tokenAmount) {
                        alert("Please enter a valid token amount.");
                        return;
                      }

                      await contract.current?.captureTheFlag()
                      ;
                    }}
                  >
                    Transfer Tokens
                  </button>
                </div>
              ) : <div> Initializing GSN Provider</div>
          }
        <p>
          Proof of concept frontend for GSN allowing a user to transfer USDC and pay gas with ERC20 token.
        </p>
      </div>
      
      <p className="read-the-docs">
        Open Developer Tools for logs, connect MetaMask account and select Goerli network to make a GSN transaction. Made with Vite, React, and GSN. Deployed on IPFS.
      </p>
    </>
  )
}

export default App
