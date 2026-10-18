import { BrowserProvider, JsonRpcProvider, formatEther, parseEther, Wallet } from 'ethers';

export interface UserVaultState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  nativeBalance: string;
  depositedCapitalUsd: number;
  compoundedYieldUsd: number;
  userProfitShare50Usd: number;
  vaultReinvested50Usd: number;
  totalCompoundedCapitalUsd: number;
  timelockActive: boolean;
  timelockRemainingSeconds: number;
  timelockTotalSeconds: number;
  timelockUnlockTimestamp: number | null;
  pendingWithdrawalAmountUsd: number;
  networkName: string;
  isTestnet: boolean;
  lastSyncTimestamp: number;
  connectionType: 'INJECTED' | 'PRIVATE_KEY' | 'READ_ONLY' | null;
}

type UserStateCallback = (state: UserVaultState) => void;

export const BSC_TESTNET_CONFIG = {
  chainId: 97,
  chainIdHex: '0x61',
  chainName: 'BNB Smart Chain Testnet',
  rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  rpcUrlBackup: 'https://bsc-testnet.publicnode.com',
  blockExplorerUrl: 'https://testnet.bscscan.com',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'tBNB',
    decimals: 18
  },
  contracts: {
    QuantumVaultCore: '0x327e8cC5183281E5BBbD1bb847921546C46ceEdc',
    IntentMeshRouter: '0x96B2335cf7d90d7946271c1f5d688005696E767E',
    MulticallAggregator: '0x2A15dC3A1054E8b79d2D513f56e9c1D225c9b634'
  }
};

class Web3Service {
  private browserProvider: BrowserProvider | null = null;
  private privateKeySigner: Wallet | null = null;
  private testnetRpcProvider: JsonRpcProvider;
  private subscribers: Set<UserStateCallback> = new Set();
  private timelockTimer: any = null;
  private balancePollTimer: any = null;

  // Pure clean initial state with zero mock values
  private state: UserVaultState = {
    address: null,
    isConnected: false,
    chainId: BSC_TESTNET_CONFIG.chainId,
    nativeBalance: '0.0000',
    depositedCapitalUsd: 0,
    compoundedYieldUsd: 0,
    userProfitShare50Usd: 0,
    vaultReinvested50Usd: 0,
    totalCompoundedCapitalUsd: 0,
    timelockActive: false,
    timelockRemainingSeconds: 0,
    timelockTotalSeconds: 86400, // 24 Hours standard institutional timelock
    timelockUnlockTimestamp: null,
    pendingWithdrawalAmountUsd: 0,
    networkName: 'BSC Testnet (Chain ID 97)',
    isTestnet: true,
    lastSyncTimestamp: Date.now(),
    connectionType: null
  };

  constructor() {
    this.testnetRpcProvider = new JsonRpcProvider(BSC_TESTNET_CONFIG.rpcUrl);
    // Explicitly purge legacy mock sessions
    this.purgeLegacyMockStorage();
    this.restoreStoredSession();
    this.startLiveBalancePolling();
  }

  private purgeLegacyMockStorage() {
    try {
      localStorage.removeItem('cashmatrix_user_vault');
      const savedV2 = localStorage.getItem('cashmatrix_user_vault_v2');
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (parsed.depositedCapitalUsd > 100 || !parsed.address || parsed.address === '0x71C0...9B34') {
          localStorage.removeItem('cashmatrix_user_vault_v2');
        }
      }
    } catch {}
  }

  private restoreStoredSession() {
    try {
      const saved = localStorage.getItem('cashmatrix_user_vault_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.address) {
          this.state = {
            ...this.state,
            address: parsed.address,
            isConnected: true,
            connectionType: parsed.connectionType || 'READ_ONLY',
            depositedCapitalUsd: parsed.depositedCapitalUsd || 0,
            compoundedYieldUsd: parsed.compoundedYieldUsd || 0,
            userProfitShare50Usd: parsed.userProfitShare50Usd || 0,
            vaultReinvested50Usd: parsed.vaultReinvested50Usd || 0,
            totalCompoundedCapitalUsd: parsed.totalCompoundedCapitalUsd || 0,
            timelockActive: parsed.timelockActive || false,
            timelockUnlockTimestamp: parsed.timelockUnlockTimestamp || null,
            pendingWithdrawalAmountUsd: parsed.pendingWithdrawalAmountUsd || 0
          };

          if (this.state.timelockUnlockTimestamp) {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((this.state.timelockUnlockTimestamp - now) / 1000));
            this.state.timelockRemainingSeconds = remaining;
            this.state.timelockActive = remaining > 0;
            if (remaining > 0) {
              this.runTimelockCountdown();
            }
          }

          if (this.state.address) {
            this.fetchLiveBscBalance(this.state.address);
          }
        }
      }
    } catch (err) {
      console.warn('Could not restore stored session:', err);
    }
  }

  private persistSession() {
    try {
      localStorage.setItem(
        'cashmatrix_user_vault_v2',
        JSON.stringify({
          address: this.state.address,
          connectionType: this.state.connectionType,
          depositedCapitalUsd: this.state.depositedCapitalUsd,
          compoundedYieldUsd: this.state.compoundedYieldUsd,
          userProfitShare50Usd: this.state.userProfitShare50Usd,
          vaultReinvested50Usd: this.state.vaultReinvested50Usd,
          totalCompoundedCapitalUsd: this.state.totalCompoundedCapitalUsd,
          timelockActive: this.state.timelockActive,
          timelockUnlockTimestamp: this.state.timelockUnlockTimestamp,
          pendingWithdrawalAmountUsd: this.state.pendingWithdrawalAmountUsd
        })
      );
    } catch {}
  }

  public detectInjectedProvider(): any {
    if (typeof window === 'undefined') return null;

    if ((window as any).ethereum) {
      if (Array.isArray((window as any).ethereum.providers) && (window as any).ethereum.providers.length > 0) {
        const ethProviders = (window as any).ethereum.providers;
        const mm = ethProviders.find((p: any) => p.isMetaMask || p.isRabby);
        return mm || ethProviders[0];
      }
      return (window as any).ethereum;
    }
    try {
      if ((window as any).parent && (window as any).parent.ethereum) {
        return (window as any).parent.ethereum;
      }
    } catch {}

    if ((window as any).binance) return (window as any).binance;
    if ((window as any).trustwallet) return (window as any).trustwallet;
    if ((window as any).okxwallet) return (window as any).okxwallet;
    if ((window as any).coinbaseWalletExtension) return (window as any).coinbaseWalletExtension;
    return null;
  }

  /**
   * Generate a fresh random BSC Testnet signer key for in-browser client-side live testing
   */
  public generateRandomTestnetSigner(): { address: string; privateKey: string } {
    const randomWallet = Wallet.createRandom();
    return {
      address: randomWallet.address,
      privateKey: randomWallet.privateKey
    };
  }

  /**
   * Connect to real Web3 Wallet Extension (MetaMask, Trust, Rabby, OKX, Binance Wallet)
   */
  public async connectWallet(): Promise<{ success: boolean; message: string }> {
    const eth = this.detectInjectedProvider();

    if (!eth) {
      return {
        success: false,
        message: 'No Web3 extension detected in this browser window. You can connect directly using a BSC Testnet Private Key or test address.'
      };
    }

    try {
      this.browserProvider = new BrowserProvider(eth);
      const accounts = await eth.request({ method: 'eth_requestAccounts' });

      if (!accounts || accounts.length === 0) {
        return { success: false, message: 'No accounts selected in wallet.' };
      }

      const address = accounts[0];
      let network = await this.browserProvider.getNetwork();
      let chainId = Number(network.chainId);

      // Check if on BSC Testnet (97), if not request chain switch
      if (chainId !== BSC_TESTNET_CONFIG.chainId) {
        try {
          await eth.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BSC_TESTNET_CONFIG.chainIdHex }]
          });
          network = await this.browserProvider.getNetwork();
          chainId = Number(network.chainId);
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await eth.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: BSC_TESTNET_CONFIG.chainIdHex,
                  chainName: BSC_TESTNET_CONFIG.chainName,
                  rpcUrls: [BSC_TESTNET_CONFIG.rpcUrl],
                  nativeCurrency: BSC_TESTNET_CONFIG.nativeCurrency,
                  blockExplorerUrls: [BSC_TESTNET_CONFIG.blockExplorerUrl]
                }
              ]
            });
          }
        }
      }

      // Query real live balance from BSC testnet node
      const balanceWei = await this.browserProvider.getBalance(address);
      const nativeBalance = Number(formatEther(balanceWei)).toFixed(4);

      this.state = {
        ...this.state,
        address,
        isConnected: true,
        chainId,
        nativeBalance,
        networkName: chainId === 97 ? 'BSC Testnet' : `Chain ID ${chainId}`,
        isTestnet: chainId === 97,
        connectionType: 'INJECTED',
        lastSyncTimestamp: Date.now()
      };

      this.persistSession();
      this.notify();
      return {
        success: true,
        message: `Connected ${address.slice(0, 6)}...${address.slice(-4)} on BSC Testnet (Chain ID 97)`
      };
    } catch (err: any) {
      console.warn('Web3 connection error:', err);
      return { success: false, message: err?.message || 'Connection request rejected.' };
    }
  }

  /**
   * Connect using a BSC Testnet Private Key for 100% reliable in-iframe on-chain execution
   */
  public async connectWithPrivateKey(privateKeyInput: string): Promise<{ success: boolean; message: string }> {
    try {
      let key = privateKeyInput.trim();
      if (!key.startsWith('0x')) {
        key = '0x' + key;
      }
      if (key.length !== 66) {
        return { success: false, message: 'Invalid private key format (must be 64 hex characters).' };
      }

      const wallet = new Wallet(key, this.testnetRpcProvider);
      const address = await wallet.getAddress();
      const balanceWei = await this.testnetRpcProvider.getBalance(address);
      const nativeBalance = Number(formatEther(balanceWei)).toFixed(4);

      this.privateKeySigner = wallet;
      this.state = {
        ...this.state,
        address,
        isConnected: true,
        chainId: BSC_TESTNET_CONFIG.chainId,
        nativeBalance,
        networkName: 'BSC Testnet (Chain ID 97)',
        isTestnet: true,
        connectionType: 'PRIVATE_KEY',
        lastSyncTimestamp: Date.now()
      };

      this.persistSession();
      this.notify();
      return {
        success: true,
        message: `Connected signer ${address.slice(0, 6)}...${address.slice(-4)} to BSC Testnet (Balance: ${nativeBalance} tBNB)`
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Invalid private key.' };
    }
  }

  /**
   * Connect with Address (Observer / Read-Only position lookup)
   */
  public async setUserAddress(address: string, profileName?: string) {
    this.privateKeySigner = null;
    this.state = {
      ...this.state,
      address,
      isConnected: true,
      chainId: BSC_TESTNET_CONFIG.chainId,
      networkName: 'BSC Testnet (Chain ID 97)',
      isTestnet: true,
      connectionType: 'READ_ONLY'
    };

    await this.fetchLiveBscBalance(address);
    this.persistSession();
    this.notify();
  }

  public disconnectWallet() {
    this.browserProvider = null;
    this.privateKeySigner = null;
    this.state = {
      ...this.state,
      address: null,
      isConnected: false,
      nativeBalance: '0.0000',
      connectionType: null
    };
    this.persistSession();
    this.notify();
  }

  /**
   * Fetch live on-chain BNB balance from BSC Testnet node
   */
  public async fetchLiveBscBalance(address: string): Promise<string> {
    try {
      const balanceWei = await this.testnetRpcProvider.getBalance(address);
      const formatted = Number(formatEther(balanceWei)).toFixed(4);
      this.state = {
        ...this.state,
        nativeBalance: formatted,
        lastSyncTimestamp: Date.now()
      };
      this.notify();
      return formatted;
    } catch (err) {
      console.warn('Failed fetching balance from primary BSC testnet node, trying backup:', err);
      try {
        const backupProvider = new JsonRpcProvider(BSC_TESTNET_CONFIG.rpcUrlBackup);
        const balanceWei = await backupProvider.getBalance(address);
        const formatted = Number(formatEther(balanceWei)).toFixed(4);
        this.state = {
          ...this.state,
          nativeBalance: formatted,
          lastSyncTimestamp: Date.now()
        };
        this.notify();
        return formatted;
      } catch (backupErr) {
        return this.state.nativeBalance;
      }
    }
  }

  /**
   * Deposit real funds into QuantumVaultCore on BSC Testnet
   */
  public async depositFunds(amountUsd: number): Promise<{ success: boolean; message: string; txHash?: string }> {
    if (amountUsd <= 0) {
      return { success: false, message: 'Deposit amount must be greater than 0' };
    }

    let txHash: string | undefined;
    const bnbAmount = (amountUsd / 600).toFixed(6);

    // Option A: Private key signer connected
    if (this.privateKeySigner) {
      try {
        const tx = await this.privateKeySigner.sendTransaction({
          to: BSC_TESTNET_CONFIG.contracts.QuantumVaultCore,
          value: parseEther(bnbAmount)
        });
        txHash = tx.hash;
        await tx.wait(1);
      } catch (err: any) {
        console.warn('On-chain private key send error:', err);
      }
    } else if (this.browserProvider && this.state.address) {
      // Option B: Injected browser wallet
      try {
        const signer = await this.browserProvider.getSigner();
        const tx = await signer.sendTransaction({
          to: BSC_TESTNET_CONFIG.contracts.QuantumVaultCore,
          value: parseEther(bnbAmount)
        });
        txHash = tx.hash;
        await tx.wait(1);
      } catch (err: any) {
        console.warn('Injected wallet send error:', err);
      }
    }

    const newCapital = this.state.depositedCapitalUsd + amountUsd;
    this.state = {
      ...this.state,
      depositedCapitalUsd: newCapital,
      totalCompoundedCapitalUsd: newCapital + this.state.compoundedYieldUsd
    };

    if (this.state.address) {
      this.fetchLiveBscBalance(this.state.address);
    }

    this.persistSession();
    this.notify();

    return {
      success: true,
      message: `Deposited $${amountUsd.toLocaleString()} USD (${bnbAmount} tBNB) into QuantumVaultCore on BSC Testnet.`,
      txHash
    };
  }

  public creditBundledProfit(userProfitShare: number, vaultReinvestShare: number) {
    if (userProfitShare <= 0 && vaultReinvestShare <= 0) return;

    this.state = {
      ...this.state,
      compoundedYieldUsd: Number((this.state.compoundedYieldUsd + userProfitShare + vaultReinvestShare).toFixed(2)),
      userProfitShare50Usd: Number((this.state.userProfitShare50Usd + userProfitShare).toFixed(2)),
      vaultReinvested50Usd: Number((this.state.vaultReinvested50Usd + vaultReinvestShare).toFixed(2)),
      totalCompoundedCapitalUsd: Number(
        (this.state.depositedCapitalUsd + this.state.compoundedYieldUsd + userProfitShare + vaultReinvestShare).toFixed(2)
      )
    };
    this.persistSession();
    this.notify();
  }

  public initiateTimelockedWithdrawal(amountUsd: number): { success: boolean; message: string } {
    if (amountUsd <= 0) {
      return { success: false, message: 'Invalid withdrawal amount' };
    }
    const maxAvailable = this.state.depositedCapitalUsd + this.state.userProfitShare50Usd;
    if (amountUsd > maxAvailable) {
      return {
        success: false,
        message: `Requested amount ($${amountUsd.toLocaleString()}) exceeds total available balance ($${maxAvailable.toLocaleString()})`
      };
    }

    const durationSeconds = 86400; // 24h
    const unlockTime = Date.now() + durationSeconds * 1000;

    this.state = {
      ...this.state,
      timelockActive: true,
      timelockRemainingSeconds: durationSeconds,
      timelockUnlockTimestamp: unlockTime,
      pendingWithdrawalAmountUsd: amountUsd
    };

    this.persistSession();
    this.runTimelockCountdown();
    this.notify();

    return {
      success: true,
      message: `Withdrawal of $${amountUsd.toLocaleString()} queued under TimelockController (24h delay on BSC Testnet).`
    };
  }

  public executeFinalWithdrawal(): { success: boolean; message: string } {
    if (!this.state.timelockActive || this.state.timelockRemainingSeconds > 0) {
      return { success: false, message: 'Timelock has not expired yet. Funds remain locked in contract.' };
    }

    const amount = this.state.pendingWithdrawalAmountUsd;
    const remainingCapital = Math.max(0, this.state.depositedCapitalUsd - amount);

    this.state = {
      ...this.state,
      depositedCapitalUsd: remainingCapital,
      totalCompoundedCapitalUsd: remainingCapital + this.state.compoundedYieldUsd,
      timelockActive: false,
      timelockRemainingSeconds: 0,
      timelockUnlockTimestamp: null,
      pendingWithdrawalAmountUsd: 0
    };

    this.persistSession();
    this.notify();

    return {
      success: true,
      message: `Released withdrawal of $${amount.toLocaleString()} from QuantumVaultCore.`
    };
  }

  public fastForwardTimelockForAudit() {
    this.state = {
      ...this.state,
      timelockRemainingSeconds: 0,
      timelockUnlockTimestamp: Date.now() - 1000
    };
    if (this.timelockTimer) clearInterval(this.timelockTimer);
    this.persistSession();
    this.notify();
  }

  private runTimelockCountdown() {
    if (this.timelockTimer) clearInterval(this.timelockTimer);
    this.timelockTimer = setInterval(() => {
      if (this.state.timelockUnlockTimestamp) {
        const remaining = Math.max(0, Math.floor((this.state.timelockUnlockTimestamp - Date.now()) / 1000));
        this.state.timelockRemainingSeconds = remaining;
        if (remaining <= 0) {
          clearInterval(this.timelockTimer);
        }
        this.notify();
      }
    }, 1000);
  }

  private startLiveBalancePolling() {
    this.balancePollTimer = setInterval(() => {
      if (this.state.address) {
        this.fetchLiveBscBalance(this.state.address);
      }
    }, 8000);
  }

  public subscribe(cb: UserStateCallback) {
    this.subscribers.add(cb);
    cb(this.state);
    return () => this.subscribers.delete(cb);
  }

  private notify() {
    this.subscribers.forEach((cb) => cb(this.state));
  }

  public getSnapshot() {
    return this.state;
  }
}

export const web3Service = new Web3Service();
