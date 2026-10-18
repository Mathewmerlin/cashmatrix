import React, { useState } from 'react';
import {
  X,
  Wallet,
  KeyRound,
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { web3Service, BSC_TESTNET_CONFIG } from '../services/web3';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'extension' | 'private_key' | 'address'>('extension');
  const [privateKeyInput, setPrivateKeyInput] = useState('');
  const [customAddressInput, setCustomAddressInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [generatedAccount, setGeneratedAccount] = useState<{ address: string; privateKey: string } | null>(null);

  if (!isOpen) return null;

  const detectedProvider = web3Service.detectInjectedProvider();

  const handleConnectExtension = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const res = await web3Service.connectWallet();
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 800);
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Connection failed.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateKey = () => {
    const fresh = web3Service.generateRandomTestnetSigner();
    setGeneratedAccount(fresh);
    setPrivateKeyInput(fresh.privateKey);
    setStatusMessage({
      type: 'success',
      text: `Generated fresh BSC Testnet Signer: ${fresh.address.slice(0, 6)}...${fresh.address.slice(-4)}`
    });
  };

  const handleConnectPrivateKey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!privateKeyInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter or generate a valid private key.' });
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const res = await web3Service.connectWithPrivateKey(privateKeyInput);
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 800);
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Invalid key.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectAccountAddress = async (address: string, label: string) => {
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      await web3Service.setUserAddress(address, label);
      setStatusMessage({ type: 'success', text: `Connected ${label} (${address.slice(0, 6)}...${address.slice(-4)})` });
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 500);
    } catch {
      setStatusMessage({ type: 'error', text: 'Could not fetch address balance.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const addr = customAddressInput.trim();
    if (!addr.startsWith('0x') || addr.length !== 42) {
      setStatusMessage({ type: 'error', text: 'Address must be a valid 42-character 0x EVM hex address.' });
      return;
    }
    handleSelectAccountAddress(addr, 'Custom Address');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0B1021] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-[#00F5FF]/10 text-[#00F5FF]">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-sans">Connect to BSC Testnet (97)</h2>
            <p className="text-xs text-slate-400">
              Live on-chain connection to BNB Smart Chain Testnet
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-[#050816] rounded-xl border border-white/5 mb-5 text-xs">
          <button
            onClick={() => { setActiveTab('extension'); setStatusMessage(null); }}
            className={`py-2 px-2 font-semibold rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'extension'
                ? 'bg-[#00F5FF]/15 text-[#00F5FF] border border-[#00F5FF]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Browser Wallet
          </button>
          <button
            onClick={() => { setActiveTab('private_key'); setStatusMessage(null); }}
            className={`py-2 px-2 font-semibold rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'private_key'
                ? 'bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Signer Key
          </button>
          <button
            onClick={() => { setActiveTab('address'); setStatusMessage(null); }}
            className={`py-2 px-2 font-semibold rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'address'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Test Accounts
          </button>
        </div>

        {statusMessage && (
          <div
            className={`mb-4 p-3 rounded-lg border text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-[#00FF88]/10 border-[#00FF88]/30 text-[#00FF88]'
                : 'bg-[#FF496C]/10 border-[#FF496C]/30 text-[#FF496C]'
            }`}
          >
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: BROWSER EXTENSION */}
        {/* ========================================================================= */}
        {activeTab === 'extension' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#050816] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Extension Provider:</span>
                {detectedProvider ? (
                  <span className="text-[#00FF88] font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                    Web3 Injected Extension Detected
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Not Injected in iFrame Sandbox
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {detectedProvider
                  ? 'MetaMask, Rabby, Trust Wallet, OKX, or Binance Web3 Wallet detected. Connecting will request accounts and automatically switch your network to BSC Testnet (Chain ID 97).'
                  : 'Notice: Web browsers block wallet extensions from injecting into sandboxed preview iframes. If your extension popup does not appear, click the "Signer Key" tab to connect directly with 100% on-chain testnet execution.'}
              </p>
            </div>

            <button
              onClick={handleConnectExtension}
              disabled={isProcessing}
              className="w-full py-3 px-4 text-xs font-bold text-[#050816] bg-[#00F5FF] hover:bg-[#00F5FF]/90 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-[#00F5FF]/20"
            >
              <Wallet className="w-4 h-4" />
              <span>{isProcessing ? 'Connecting...' : 'Connect Injected Browser Wallet'}</span>
            </button>

            {!detectedProvider && (
              <button
                type="button"
                onClick={() => setActiveTab('private_key')}
                className="w-full py-2.5 px-3 text-xs text-[#00FF88] bg-[#00FF88]/10 hover:bg-[#00FF88]/20 border border-[#00FF88]/30 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Switch to Signer Key (Works 100% in iFrame)</span>
              </button>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LIVE PRIVATE KEY SIGNER (FOR DIRECT TESTNET ON-CHAIN SENDING) */}
        {/* ========================================================================= */}
        {activeTab === 'private_key' && (
          <form onSubmit={handleConnectPrivateKey} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#050816] border border-white/5 space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-[#00FF88] font-semibold">
                <Shield className="w-4 h-4" />
                <span>100% Client-Side Signer (BSC Testnet)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Connects directly to BSC Testnet RPC (<code className="text-[#00F5FF]">data-seed-prebsc-1-s1.binance.org:8545</code>). You can generate a fresh testnet key with 1-click or paste an existing one.
              </p>
            </div>

            {/* Quick Generator Button */}
            <div className="flex items-center justify-between gap-2 p-3 bg-white/5 border border-white/10 rounded-xl">
              <div>
                <span className="text-xs font-semibold text-white">Need a fresh BSC Testnet account?</span>
                <p className="text-[10px] text-slate-400">Generates a new valid EVM address and key</p>
              </div>
              <button
                type="button"
                onClick={handleGenerateKey}
                className="px-3 py-1.5 bg-[#00FF88]/20 hover:bg-[#00FF88]/30 text-[#00FF88] border border-[#00FF88]/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Key</span>
              </button>
            </div>

            {generatedAccount && (
              <div className="p-3 bg-[#00FF88]/10 border border-[#00FF88]/30 rounded-xl space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">GENERATED BSC TESTNET ADDRESS:</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generatedAccount.address)}
                    className="text-[#00FF88] hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {copiedKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-white break-all text-[11px]">{generatedAccount.address}</div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-sans">Get free tBNB for testing:</span>
                  <a
                    href="https://testnet.bnbchain.org/faucet-smart"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00F5FF] underline flex items-center gap-1 font-sans"
                  >
                    <span>BSC Testnet Faucet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                BSC Testnet Private Key (64 hex characters)
              </label>
              <input
                type="password"
                value={privateKeyInput}
                onChange={(e) => setPrivateKeyInput(e.target.value)}
                placeholder="0x... or 64-char hex key"
                className="w-full px-3.5 py-2.5 bg-[#050816] border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#00FF88]"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 px-4 text-xs font-bold text-[#050816] bg-[#00FF88] hover:bg-[#00FF88]/90 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-[#00FF88]/20"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isProcessing ? 'Verifying on BSC Testnet...' : 'Connect as Live Signer on BSC Testnet'}</span>
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: BSC TESTNET MULTI-USER PROFILES & CUSTOM ADDRESS */}
        {/* ========================================================================= */}
        {activeTab === 'address' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Select an account to query live on-chain balances from the BSC Testnet node:
            </p>

            <div className="space-y-2">
              {[
                {
                  label: 'QuantumVault Deployer (Live tBNB)',
                  address: '0x327e8cC5183281E5BBbD1bb847921546C46ceEdc',
                  desc: 'Verified Target Contract on BSC Testnet (Chain ID 97)'
                },
                {
                  label: 'Whale Staking Vault Account',
                  address: '0x8898b1e4B17f8a70D4629E7b73c242cBD0A5EbB3',
                  desc: 'High-volume trader testing 50/50 profit splitting'
                },
                {
                  label: 'Retail Liquidity Provider',
                  address: '0x71C04B3E03598711311749A5882B33E2B87071C0',
                  desc: 'Standard investor testing deposits & timelocked withdrawals'
                }
              ].map((acc) => (
                <button
                  key={acc.address}
                  type="button"
                  onClick={() => handleSelectAccountAddress(acc.address, acc.label)}
                  className="w-full p-3 rounded-xl border border-white/5 bg-[#050816] hover:border-[#00F5FF]/40 text-left transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold text-white">{acc.label}</span>
                    <div className="text-[11px] font-mono text-slate-400">{acc.address}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{acc.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </button>
              ))}
            </div>

            <form onSubmit={handleCustomAddressSubmit} className="pt-2 border-t border-white/5 space-y-2">
              <label className="block text-xs font-medium text-slate-400">
                Or Enter Custom BSC Testnet Address:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customAddressInput}
                  onChange={(e) => setCustomAddressInput(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 px-3 py-2 bg-[#050816] border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#00F5FF]"
                />
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 text-xs font-semibold text-[#050816] bg-[#00F5FF] rounded-lg hover:bg-[#00F5FF]/90 cursor-pointer"
                >
                  {isProcessing ? 'Checking...' : 'Load'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
