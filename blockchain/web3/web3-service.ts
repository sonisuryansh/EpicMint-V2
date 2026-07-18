import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

// Contract ABI imports (these would be generated from the smart contracts)
import EpicMintNFTABI from '../abis/EpicMintNFT.json';
import EpicMintMarketplaceABI from '../abis/EpicMintMarketplace.json';

interface ContractAddresses {
  nft: string;
  marketplace: string;
}

interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  contracts: ContractAddresses;
}

// Network configurations
const NETWORKS: Record<number, NetworkConfig> = {
  1: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    blockExplorer: 'https://etherscan.io',
    contracts: {
      nft: '0x...', // Your deployed NFT contract address
      marketplace: '0x...', // Your deployed marketplace contract address
    }
  },
  5: {
    name: 'Goerli Testnet',
    chainId: 5,
    rpcUrl: 'https://goerli.infura.io/v3/YOUR_INFURA_KEY',
    blockExplorer: 'https://goerli.etherscan.io',
    contracts: {
      nft: '0x...', // Your deployed NFT contract address
      marketplace: '0x...', // Your deployed marketplace contract address
    }
  },
  11155111: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    blockExplorer: 'https://sepolia.etherscan.io',
    contracts: {
      nft: '0x...', // Your deployed NFT contract address
      marketplace: '0x...', // Your deployed marketplace contract address
    }
  },
  137: {
    name: 'Polygon Mainnet',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    contracts: {
      nft: '0x...', // Your deployed NFT contract address
      marketplace: '0x...', // Your deployed marketplace contract address
    }
  }
};

export class Web3Service {
  private web3: Web3 | null = null;
  private account: string | null = null;
  private chainId: number | null = null;
  private nftContract: Contract | null = null;
  private marketplaceContract: Contract | null = null;

  constructor() {
    this.initializeWeb3();
  }

  /**
   * Initialize Web3 connection
   */
  private async initializeWeb3(): Promise<void> {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.web3 = new Web3(window.ethereum);
      await this.setupEventListeners();
    } else {
      console.warn('MetaMask not detected');
      // Fallback to read-only mode with Infura
      this.web3 = new Web3('https://mainnet.infura.io/v3/YOUR_INFURA_KEY');
    }
  }

  /**
   * Setup MetaMask event listeners
   */
  private async setupEventListeners(): Promise<void> {
    if (!window.ethereum) return;

    // Account change listener
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      this.account = accounts.length > 0 ? accounts[0] : null;
      this.initializeContracts();
    });

    // Chain change listener
    window.ethereum.on('chainChanged', (chainId: string) => {
      this.chainId = parseInt(chainId, 16);
      this.initializeContracts();
      window.location.reload(); // Reload page on network change
    });
  }

  /**
   * Connect to MetaMask wallet
   */
  async connectWallet(): Promise<{ account: string; chainId: number } | null> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this.account = accounts[0];
      
      // Get chain ID
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });
      this.chainId = parseInt(chainId, 16);

      await this.initializeContracts();

      return {
        account: this.account,
        chainId: this.chainId,
      };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet(): Promise<void> {
    this.account = null;
    this.chainId = null;
    this.nftContract = null;
    this.marketplaceContract = null;
  }

  /**
   * Initialize smart contracts
   */
  private async initializeContracts(): Promise<void> {
    if (!this.web3 || !this.chainId) return;

    const network = NETWORKS[this.chainId];
    if (!network) {
      console.warn(`Unsupported network: ${this.chainId}`);
      return;
    }

    try {
      // Initialize NFT contract
      this.nftContract = new this.web3.eth.Contract(
        EpicMintNFTABI.abi as any,
        network.contracts.nft
      );

      // Initialize Marketplace contract
      this.marketplaceContract = new this.web3.eth.Contract(
        EpicMintMarketplaceABI.abi as any,
        network.contracts.marketplace
      );
    } catch (error) {
      console.error('Error initializing contracts:', error);
    }
  }

  /**
   * Switch to a specific network
   */
  async switchNetwork(chainId: number): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    const network = NETWORKS[chainId];
    if (!network) {
      throw new Error(`Unsupported network: ${chainId}`);
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await this.addNetwork(chainId);
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Add a new network to MetaMask
   */
  private async addNetwork(chainId: number): Promise<void> {
    const network = NETWORKS[chainId];
    if (!network || !window.ethereum) return;

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${chainId.toString(16)}`,
          chainName: network.name,
          rpcUrls: [network.rpcUrl],
          blockExplorerUrls: [network.blockExplorer],
        },
      ],
    });
  }

  /**
   * Get current account balance
   */
  async getBalance(address?: string): Promise<string> {
    if (!this.web3) throw new Error('Web3 not initialized');
    
    const account = address || this.account;
    if (!account) throw new Error('No account available');

    const balance = await this.web3.eth.getBalance(account);
    return this.web3.utils.fromWei(balance, 'ether');
  }

  /**
   * Get gas price estimation
   */
  async getGasPrice(): Promise<string> {
    if (!this.web3) throw new Error('Web3 not initialized');
    
    const gasPrice = await this.web3.eth.getGasPrice();
    return this.web3.utils.fromWei(gasPrice, 'gwei');
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(transaction: any): Promise<number> {
    if (!this.web3) throw new Error('Web3 not initialized');
    
    return await this.web3.eth.estimateGas(transaction);
  }

  /**
   * Send transaction with proper gas estimation
   */
  async sendTransaction(
    contractMethod: any,
    value: string = '0'
  ): Promise<string> {
    if (!this.account) throw new Error('No account connected');

    try {
      // Estimate gas
      const gasEstimate = await contractMethod.estimateGas({
        from: this.account,
        value: this.web3!.utils.toWei(value, 'ether'),
      });

      // Add 20% buffer to gas estimate
      const gasLimit = Math.floor(gasEstimate * 1.2);

      // Send transaction
      const transaction = await contractMethod.send({
        from: this.account,
        gas: gasLimit,
        value: this.web3!.utils.toWei(value, 'ether'),
      });

      return transaction.transactionHash;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash: string): Promise<any> {
    if (!this.web3) throw new Error('Web3 not initialized');
    
    return await this.web3.eth.getTransactionReceipt(txHash);
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(txHash: string, confirmations: number = 1): Promise<any> {
    if (!this.web3) throw new Error('Web3 not initialized');

    return new Promise((resolve, reject) => {
      const checkTransaction = async () => {
        try {
          const receipt = await this.web3!.eth.getTransactionReceipt(txHash);
          
          if (receipt) {
            const currentBlock = await this.web3!.eth.getBlockNumber();
            const confirmationCount = currentBlock - receipt.blockNumber;
            
            if (confirmationCount >= confirmations) {
              resolve(receipt);
            } else {
              setTimeout(checkTransaction, 1000);
            }
          } else {
            setTimeout(checkTransaction, 1000);
          }
        } catch (error) {
          reject(error);
        }
      };

      checkTransaction();
    });
  }

  // Getters
  get isConnected(): boolean {
    return !!this.account && !!this.chainId;
  }

  get currentAccount(): string | null {
    return this.account;
  }

  get currentChainId(): number | null {
    return this.chainId;
  }

  get currentNetwork(): NetworkConfig | null {
    return this.chainId ? NETWORKS[this.chainId] : null;
  }

  get web3Instance(): Web3 | null {
    return this.web3;
  }

  get nftContractInstance(): Contract | null {
    return this.nftContract;
  }

  get marketplaceContractInstance(): Contract | null {
    return this.marketplaceContract;
  }
}

// Export singleton instance
export const web3Service = new Web3Service();

// Export types
export type { ContractAddresses, NetworkConfig };