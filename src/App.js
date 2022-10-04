import { useState, useEffect } from "react";
import { ethers, utils } from "ethers";
import abi from "./contracts/SharedWallet.json";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [inputValue, setInputValue] = useState({
    withdraw: "",
    deposit: "",
    walletName: "",
  });
  const [sharedWalletAddress, setsharedWalletAddress] = useState(null);
  const [memberTotalBalance, setmemberTotalBalance] = useState(null);
  const [walletTotalBalance, setwalletTotalBalance] = useState(null);
  const [memberAddress, setmemberAddress] = useState(null);
  const [error, setError] = useState(null);

  const contractAddress = "0xF4B23c63D7144452590Cb0de4Ba2a091555C11CF";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        setIsWalletConnected(true);
        setmemberAddress(account);
        console.log("Account Connected: ", account);
      } else {
        setError("Please install a MetaMask wallet to use our wallet.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const memberBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let owner = await walletContract.walletAddress();
        setsharedWalletAddress(owner);
        let balance = await walletContract.getMemberBalance();
        setmemberTotalBalance(utils.formatEther(balance));
        let walletbalance = await walletContract.getWalletBalance();
        setwalletTotalBalance(utils.formatEther(balance));
        console.log("Retrieved balance...", balance);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our wallet.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (event) => {
    setInputValue((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  };

  const takeMembershipHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        //write data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const txn = await walletContract.takeMembership({
          value: ethers.utils.parseEther("0.001"),
        });
        console.log("Deposting 0.001 eth...");
        await txn.wait();
        console.log("You are now a member of the Shared Wallet", txn.hash);

        memberBalanceHandler();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our wallet.");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const deleteMembershipHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let myAddress = await signer.getAddress();
        console.log("provider signer...", myAddress);

        const txn = await walletContract.deleteMembership(myAddress);
        console.log("deleting account...");
        await txn.wait();
        console.log(
          "account deleted, all the money is send back...done",
          txn.hash
        );

        memberBalanceHandler();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our wallet.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deposityMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        //write data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const txn = await walletContract.putMoney({
          value: ethers.utils.parseEther(inputValue.deposit),
        });
        console.log("Deposting money...");
        await txn.wait();
        console.log("Deposited money...done", txn.hash);

        memberBalanceHandler();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our wallet.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const withDrawMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let myAddress = await signer.getAddress();
        console.log("provider signer...", myAddress);

        const txn = await walletContract.takeMoney(
          myAddress,
          ethers.utils.parseEther(inputValue.withdraw)
        );
        console.log("Withdrawing money...");
        await txn.wait();
        console.log("Money with drew...done", txn.hash);

        memberBalanceHandler();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our wallet.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    memberBalanceHandler();
  }, [isWalletConnected]);

  return (
    <main>
      <h1>
        <span>SharedWallet</span> 💳
      </h1>
      <section>
        {error && <p>{error}</p>}
        {isWalletConnected ? (
          <form>
            {memberTotalBalance >= 0.001 ? (
              <>
                <input
                  type="text"
                  onChange={handleInputChange}
                  name="deposit"
                  placeholder="0.0000 ETH"
                  value={inputValue.deposit}
                />
                <button onClick={deposityMoneyHandler}>
                  Put Money In Wallet
                </button>
                <br />
                <br />
                <input
                  type="text"
                  onChange={handleInputChange}
                  name="withdraw"
                  placeholder="0.0000 ETH"
                  value={inputValue.withdraw}
                />
                <button onClick={withDrawMoneyHandler}>
                  Take Money from Wallet
                </button>
                <br />
                <p>
                  <span>Your Money in Shared Wallet: </span>
                  {memberTotalBalance - 0.001} (+ initial deposit 0.001)
                  <br />
                  <br />
                  <span>Total Money in Shared Wallet: </span>
                  {walletTotalBalance}
                  <br />
                  <br />
                  <span>Shared Wallet Address: </span>
                  {sharedWalletAddress}
                  <br />
                  <br />
                  <span>Your Wallet Address: </span>
                  {memberAddress}
                </p>
                <button onClick={checkIfWalletIsConnected}>
                  Wallet Connected 🔒
                </button>
                <br />
                <br />
                <button onClick={deleteMembershipHandler}>
                  Delete Account
                </button>
                <p>
                  All the money in your account including the initialy deposited
                  0.001 eth will be returned on account deletion
                </p>
              </>
            ) : (
              <>
                <p>You are not a member of the Shared Wallet</p>
                <p>To become a member You have to deposit 0.001 eth</p>
                <p>
                  This money will only be returned when you delete your account
                </p>
                <button onClick={takeMembershipHandler}>
                  Deposit 0.001 eth and become a member
                </button>
                <br />
                <br />
                <p>
                  <span>Your Wallet Address: </span>
                  {memberAddress}
                </p>
                <button onClick={checkIfWalletIsConnected}>
                  Wallet Connected 🔒
                </button>
              </>
            )}
          </form>
        ) : (
          <button onClick={checkIfWalletIsConnected}>
            Connect Your Wallet 🔑
          </button>
        )}
      </section>
    </main>
  );
}
export default App;
