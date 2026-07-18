export interface WalletConnection {
  account: string;
  chainId: number;
  balance: string;
  isConnected: boolean;
}

export interface WalletProvider {
  isMetaMask?: boolean;
  isWalletConnect?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
}

export class WalletManager {
  private provider: WalletProvider | null = null;
  private connection: WalletConnection | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.detectProvider();
    this.setupEventListeners();
  }

  /**
   * Detect available wallet providers
   */
  private detectProvider(): void {
    if (typeof window === 'undefined') return;

    // Check for MetaMask
    if (window.ethereum?.isMetaMask) {
      this.provider = window.ethereum;
      console.log('MetaMask detected');
      return;
    }

    // Check for other injected wallets
    if (window.ethereum) {
      this.provider = window.ethereum;
      console.log('Injected wallet detected');
      return;
    }

    console.warn('No wallet provider detected');
  }

  /**
   * Setup wallet event listeners
   */
  private setupEventListeners(): void {
    if (!this.provider) return;

    // Account changed
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else if (this.connection && accounts[0] !== this.connection.account) {
        this.updateConnection({ account: accounts[0] });
      }
      this.emit('accountsChanged', accounts);
    };

    // Chain changed
    const handleChainChanged = (chainId: string) => {
      const newChainId = parseInt(chainId, 16);
      if (this.connection) {
        this.updateConnection({ chainId: newChainId });
      }
      this.emit('chainChanged', newChainId);
    };

    // Connection events
    const handleConnect = (connectInfo: { chainId: string }) => {
      this.emit('connect', connectInfo);
    };

    const handleDisconnect = (error: { code: number; message: string }) => {
      this.disconnect();
      this.emit('disconnect', error);
    };

    // Add event listeners
    this.provider.on('accountsChanged', handleAccountsChanged);
    this.provider.on('chainChanged', handleChainChanged);
    this.provider.on('connect', handleConnect);
    this.provider.on('disconnect', handleDisconnect);
  }

  /**
   * Connect to wallet
   */
  async connect(): Promise<WalletConnection> {
    if (!this.provider) {
      throw new Error('No wallet provider available');
    }

    try {
      // Request account access
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from wallet');
      }

      // Get chain ID
      const chainId = await this.provider.request({
        method: 'eth_chainId',
      });

      // Get balance
      const balance = await this.provider.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest'],
      });

      // Convert balance from hex to decimal
      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);

      this.connection = {
        account: accounts[0],
        chainId: parseInt(chainId, 16),
        balance: balanceInEth.toString(),
        isConnected: true,
      };

      this.emit('connected', this.connection);
      console.log('Wallet connected:', this.connection);

      return this.connection;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    this.connection = null;
    this.emit('disconnected', null);
    console.log('Wallet disconnected');
  }

  /**
   * Switch to a specific network
   */
  async switchNetwork(chainId: number): Promise<void> {
    if (!this.provider) {
      throw new Error('No wallet provider available');
    }

    const chainIdHex = `0x${chainId.toString(16)}`;

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
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
   * Add a new network to wallet
   */
  async addNetwork(chainId: number): Promise<void> {
    if (!this.provider) {
      throw new Error('No wallet provider available');
    }

    const networkConfigs: Record<number, any> = {
      1: {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_KEY'],
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        blockExplorerUrls: ['https://etherscan.io'],
      },
      5: {
        chainId: '0x5',
        chainName: 'Goerli Testnet',
        rpcUrls: ['https://goerli.infura.io/v3/YOUR_INFURA_KEY'],
        nativeCurrency: {
          name: 'Goerli Ether',
          symbol: 'GoerliETH',
          decimals: 18,
        },
        blockExplorerUrls: ['https://goerli.etherscan.io'],
      },
      137: {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        rpcUrls: ['https://polygon-rpc.com'],
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18,
        },
        blockExplorerUrls: ['https://polygonscan.com'],
      },
    };

    const networkConfig = networkConfigs[chainId];
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${chainId}`);
    }

    await this.provider.request({
      method: 'wallet_addEthereumChain',
      params: [networkConfig],
    });
  }

  /**
   * Sign a message
   */
  async signMessage(message: string): Promise<string> {
    if (!this.provider || !this.connection) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await this.provider.request({
        method: 'personal_sign',
        params: [message, this.connection.account],
      });

      return signature;
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }

  /**
   * Sign typed data (EIP-712)
   */
  async signTypedData(domain: any, types: any, value: any): Promise<string> {
    if (!this.provider || !this.connection) {
      throw new Error('Wallet not connected');
    }

    const typedData = {
      domain,
      types,
      primaryType: Object.keys(types)[0],
      message: value,
    };

    try {
      const signature = await this.provider.request({
        method: 'eth_signTypedData_v4',
        params: [this.connection.account, JSON.stringify(typedData)],
      });

      return signature;
    } catch (error) {
      console.error('Failed to sign typed data:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(address?: string): Promise<string> {
    if (!this.provider) {
      throw new Error('No wallet provider available');
    }

    const account = address || this.connection?.account;
    if (!account) {
      throw new Error('No account available');
    }

    try {
      const balance = await this.provider.request({
        method: 'eth_getBalance',
        params: [account, 'latest'],
      });

      // Convert from wei to ether
      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
      return balanceInEth.toString();
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  /**
   * Update connection state
   */
  private updateConnection(updates: Partial<WalletConnection>): void {
    if (!this.connection) return;

    this.connection = { ...this.connection, ...updates };
    this.emit('connectionUpdated', this.connection);
  }

  /**
   * Event emitter methods
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * Check if wallet is installed
   */
  isWalletInstalled(): boolean {
    return !!this.provider;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return !!this.connection?.isConnected;
  }

  /**
   * Get current connection
   */
  getConnection(): WalletConnection | null {
    return this.connection;
  }

  /**
   * Get supported networks
   */
  getSupportedNetworks(): number[] {
    return [1, 5, 11155111, 137]; // Mainnet, Goerli, Sepolia, Polygon
  }

  /**
   * Check if current network is supported
   */
  isNetworkSupported(): boolean {
    if (!this.connection) return false;
    return this.getSupportedNetworks().includes(this.connection.chainId);
  }

  /**
   * Get network name
   */
  getNetworkName(chainId?: number): string {
    const id = chainId || this.connection?.chainId;
    if (!id) return 'Unknown';

    const networks: Record<number, string> = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon Mainnet',
    };

    return networks[id] || `Network ${id}`;
  }
}

// Export singleton instance
export const walletManager = new WalletManager();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    // ethereum?: WalletProvider;
  }
}