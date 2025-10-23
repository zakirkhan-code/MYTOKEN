import { ethers } from 'ethers';

export const isWalletConnected = () => {
  return window.ethereum !== undefined;
};

export const getProvider = () => {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask or another Web3 wallet');
  }
  return new ethers.BrowserProvider(window.ethereum);
};

export const connectWallet = async () => {
  try {
    if (!isWalletConnected()) {
      throw new Error('Ethereum wallet not found');
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    return accounts[0];
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getConnectedAccount = async () => {
  try {
    const provider = getProvider();
    const signer = await provider.getSigner();
    return await signer.getAddress();
  } catch (error) {
    return null;
  }
};

export const getBalance = async (address) => {
  try {
    const provider = getProvider();
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    throw new Error('Failed to fetch balance');
  }
};

export const getNetworkInfo = async () => {
  try {
    const provider = getProvider();
    const network = await provider.getNetwork();
    return {
      chainId: network.chainId,
      name: network.name
    };
  } catch (error) {
    throw new Error('Failed to fetch network info');
  }
};

export const switchNetwork = async (chainId) => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainHexId: `0x${chainId.toString(16)}` }]
    });
  } catch (error) {
    if (error.code === 4902) {
      throw new Error('Network not found. Please add it manually.');
    }
    throw error;
  }
};

export const signMessage = async (message) => {
  try {
    const provider = getProvider();
    const signer = await provider.getSigner();
    return await signer.signMessage(message);
  } catch (error) {
    throw new Error('Failed to sign message');
  }
};

export const verifySignature = (address, message, signature) => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    return false;
  }
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const isValidAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

export const toWei = (amount) => {
  return ethers.parseEther(amount.toString());
};

export const fromWei = (amount) => {
  return ethers.formatEther(amount.toString());
};

export const SEPOLIA_CONFIG = {
  chainId: 11155111,
  name: 'Sepolia',
  rpcUrl: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
};