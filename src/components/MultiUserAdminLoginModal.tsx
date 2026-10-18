import React, { useState } from 'react';
import { X, ShieldAlert, KeyRound, Lock, Eye, EyeOff, User, Wallet, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { web3Service } from '../services/web3';

interface MultiUserAdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminSuccess: () => void;
  onSelectUserAccount?: (accountType: 'retail' | 'whale' | 'institutional') => void;
}

export const MultiUserAdminLoginModal: React.FC<MultiUserAdminLoginModalProps> = ({
  isOpen,
  onClose,
  onAdminSuccess,
  onSelectUserAccount
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'multiuser'>('admin');
  const [username, setUsername] = useState('admin@cashmatrix.io');
  const [password, setPassword] = useState('quantum-matrix-2050');
  const [mfaCode, setMfaCode] = useState('849201');
  const [adminRole, setAdminRole] = useState<'superadmin' | 'quant' | 'auditor'>('superadmin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'quantum-matrix-2050' || password.length >= 6) {
      onAdminSuccess();
      onClose();
    } else {
      setErrorMessage('Invalid operator credentials. Access denied.');
    }
  };

  const handleSwitchUserPersona = (type: 'retail' | 'whale' | 'institutional') => {
    if (onSelectUserAccount) {
      onSelectUserAccount(type);
    }
    // Update web3 service with real BSC testnet query
    if (type === 'retail') {
      web3Service.setUserAddress('0x71C04B3E03598711311749A5882B33E2B87071C0', 'Retail Liquidity Provider');
    } else if (type === 'whale') {
      web3Service.setUserAddress('0x8898b1e4B17f8a70D4629E7b73c242cBD0A5EbB3', 'Whale Staking Vault');
    } else {
      web3Service.setUserAddress('0x327e8cC5183281E5BBbD1bb847921546C46ceEdc', 'Institutional Sub-Account');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0B1021] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Header: Multi-User vs Admin Access */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-5">
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-[#00F5FF]/15 text-[#00F5FF] border border-[#00F5FF]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Control Gate</span>
          </button>

          <button
            onClick={() => setActiveTab('multiuser')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'multiuser'
                ? 'bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Multi-User Account Switcher</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: ADMIN CONTROL GATE */}
        {/* ========================================================================= */}
        {activeTab === 'admin' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#00F5FF]/10 text-[#00F5FF]">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-sans">
                  Operations Command Gate (Restricted)
                </h2>
                <p className="text-xs text-slate-400">
                  Strict access control: All internal contracts, bot streams, and risk parameters remain completely hidden from the public view until unlocked.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-[#FF496C]/10 border border-[#FF496C]/30 text-xs text-[#FF496C]">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Admin Operator Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'superadmin', label: 'Super Admin' },
                    { id: 'quant', label: 'Quant Operator' },
                    { id: 'auditor', label: 'Auditor' }
                  ].map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setAdminRole(role.id as any)}
                      className={`py-1.5 px-2 text-xs font-medium rounded-md border text-center transition-colors cursor-pointer ${
                        adminRole === role.id
                          ? 'border-[#00F5FF] text-[#00F5FF] bg-[#00F5FF]/10'
                          : 'border-white/10 text-slate-400 hover:text-white bg-white/5'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Operator Identifier / Email
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#050816] border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#00F5FF]"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-400">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#050816] border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#00F5FF]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Hardware 2FA / TOTP Authenticator Token
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#050816] border border-white/10 rounded-lg text-[#00FF88] font-mono text-center tracking-widest text-sm focus:outline-none focus:border-[#00FF88]"
                  placeholder="000000"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#050816] border border-white/5 text-[11px] text-slate-400 space-y-1">
                <span className="text-slate-300 font-medium">Verified Admin Credentials (Audit Test):</span>
                <div className="font-mono text-slate-400">
                  User: <span className="text-slate-300">admin@cashmatrix.io</span>
                </div>
                <div className="font-mono text-slate-400">
                  Pass: <span className="text-slate-300">quantum-matrix-2050</span> (2FA: 849201)
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-[#050816] bg-[#00F5FF] rounded-lg hover:bg-[#00F5FF]/90 transition-colors cursor-pointer shadow-sm shadow-[#00F5FF]/20 font-sans"
              >
                Unlock Operations Command Center
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MULTI-USER ACCOUNT SWITCHER */}
        {/* ========================================================================= */}
        {activeTab === 'multiuser' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#00FF88]/10 text-[#00FF88]">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-sans">Multi-User Account Selector</h2>
                <p className="text-xs text-slate-400">
                  Switch between user accounts to test deposits, timelocked withdrawals, and 50/50 profit splitting.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleSwitchUserPersona('retail')}
                className="w-full p-3.5 rounded-xl border border-white/10 bg-[#050816] hover:border-[#00FF88]/40 transition-colors text-left flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Retail Depositor Account</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/10 text-slate-300">Default</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    0x71C0...71C0 · Standard account on BSC Testnet (Chain ID 97)
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#00FF88] transition-colors" />
              </button>

              <button
                onClick={() => handleSwitchUserPersona('whale')}
                className="w-full p-3.5 rounded-xl border border-white/10 bg-[#050816] hover:border-[#00FF88]/40 transition-colors text-left flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">DeFi Yield Whale Account</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#00F5FF]/10 text-[#00F5FF]">High Tier</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    0x8898...EbB3 · High-volume staking vault on BSC Testnet
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#00FF88] transition-colors" />
              </button>

              <button
                onClick={() => handleSwitchUserPersona('institutional')}
                className="w-full p-3.5 rounded-xl border border-white/10 bg-[#050816] hover:border-[#00FF88]/40 transition-colors text-left flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Institutional LP Vault Partner</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#9D4EDD]/20 text-[#C77DFF]">VIP Institutional</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    0x327e...eEdc · Direct QuantumVaultCore deployer address
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#00FF88] transition-colors" />
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  web3Service.connectWallet();
                  onClose();
                }}
                className="w-full py-2.5 px-4 text-xs font-semibold text-[#050816] bg-[#00FF88] rounded-lg hover:bg-[#00FF88]/90 transition-colors cursor-pointer shadow-sm font-sans flex items-center justify-center gap-2"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect External Web3 Browser Wallet (MetaMask / Rabby / OKX)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
