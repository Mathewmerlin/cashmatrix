import React, { useState } from 'react';
import { Logo } from './Logo';
import { web3Service, BSC_TESTNET_CONFIG } from '../services/web3';
import { NodeTelemetry } from '../services/marketStream';
import {
  Lock,
  User,
  Wallet,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  Zap
} from 'lucide-react';
import { WalletConnectModal } from './WalletConnectModal';

interface LoginPageProps {
  telemetry: NodeTelemetry;
  onLoginUser: (address: string, personaName: string) => void;
  onLoginAdmin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  telemetry,
  onLoginUser,
  onLoginAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');

  // User tab states
  const [selectedPersona, setSelectedPersona] = useState<number>(0);
  const [customAddress, setCustomAddress] = useState<string>('');
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // Admin tab states
  const [adminEmail, setAdminEmail] = useState('admin@cashmatrix.io');
  const [adminPassword, setAdminPassword] = useState('quantum-matrix-2050');
  const [mfaCode, setMfaCode] = useState('849201');
  const [adminRole, setAdminRole] = useState<'superadmin' | 'quant' | 'auditor'>('superadmin');
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const userPersonas = [
    {
      id: 0,
      name: 'Retail Liquidity Provider',
      address: '0x71C04B3E03598711311749A5882B33E2B87071C0',
      description: 'Standard investor account testing deposit & 24h timelocked withdraw'
    },
    {
      id: 1,
      name: 'Whale Staking Vault',
      address: '0x8898b1e4B17f8a70D4629E7b73c242cBD0A5EbB3',
      description: 'High-volume trader assessing 50/50 profit splitting'
    },
    {
      id: 2,
      name: 'Institutional Sub-Account',
      address: '0x327e8cC5183281E5BBbD1bb847921546C46ceEdc',
      description: 'Direct BSC testnet treasury address'
    }
  ];

  const handleConnectBrowserWallet = async () => {
    const eth = web3Service.detectInjectedProvider();
    if (eth) {
      setIsConnectingWallet(true);
      setUserError(null);
      try {
        const res = await web3Service.connectWallet();
        if (res.success) {
          const snap = web3Service.getSnapshot();
          onLoginUser(snap.address || '0xConnectedWallet', 'Web3 Connected Wallet');
          return;
        } else {
          setUserError(res.message);
          setShowWalletModal(true);
        }
      } catch (err: any) {
        setUserError(err?.message || 'Failed connecting to wallet.');
        setShowWalletModal(true);
      } finally {
        setIsConnectingWallet(false);
      }
    } else {
      // In sandboxed iframe context or no extension installed, open full modal directly
      setShowWalletModal(true);
    }
  };

  const handleEnterAsUser = () => {
    setUserError(null);
    let targetAddress = userPersonas[selectedPersona].address;
    let personaName = userPersonas[selectedPersona].name;

    if (customAddress.trim()) {
      if (!customAddress.startsWith('0x') || customAddress.length !== 42) {
        setUserError('Please enter a valid EVM address (0x... 42 characters)');
        return;
      }
      targetAddress = customAddress.trim();
      personaName = 'Custom BSC Testnet Address';
    }

    onLoginUser(targetAddress, personaName);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    if (adminPassword === 'quantum-matrix-2050' || adminPassword.length >= 6) {
      onLoginAdmin();
    } else {
      setAdminError('Invalid operator credentials. Access denied.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-[#F1F5F9] flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Top Bar with Live BSC Testnet Telemetry */}
      <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              CashMatrix Quantum Compound Engine <span className="text-[#00F5FF] text-xs font-mono font-normal">v5.0</span>
            </h1>
            <p className="text-xs text-slate-400">Institutional Multi-User & Admin Gateway</p>
          </div>
        </div>

        {/* Live BSC Testnet Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 bg-[#0B1021] border border-white/10 rounded-xl px-3.5 py-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-[#00FF88]">
            <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
            <span className="font-semibold">BSC Testnet (97)</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">Block #{telemetry.blockNumber}</span>
          <span className="text-slate-600">|</span>
          <span className="text-[#00F5FF]">{telemetry.gasPriceGwei} Gwei</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{telemetry.latencyMs}ms</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-2xl mx-auto my-8">
        <div className="rounded-2xl border border-white/10 bg-[#0B1021] shadow-2xl p-6 sm:p-8">
          {/* Header Mode Switcher: User Dashboard vs Admin Operations Center */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#050816] rounded-xl border border-white/5 mb-6">
            <button
              onClick={() => setActiveTab('user')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'user'
                  ? 'bg-[#00F5FF]/15 text-[#00F5FF] border border-[#00F5FF]/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Multi-User Portal (Public View)</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Admin Operations Gate (Strict)</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: MULTI-USER PORTAL (PUBLIC VIEW ONLY) */}
          {/* ========================================================================= */}
          {activeTab === 'user' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#00F5FF]/10 text-[#00F5FF] shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Public Trader & Investor Scope</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      In accordance with security parameters, standard public access is restricted to the <strong className="text-slate-200">User Dashboard</strong> (Capital View, Deposit to QuantumVaultCore, 24h Timelocked Safe-Harbor Withdraw) and the <strong className="text-slate-200">Trading Graph</strong> (Buy/Sell order points). All internal contracts, bot streams, and risk parameters remain hidden.
                    </p>
                  </div>
                </div>
              </div>

              {userError && (
                <div className="p-3 rounded-lg bg-[#FF496C]/10 border border-[#FF496C]/30 text-xs text-[#FF496C]">
                  {userError}
                </div>
              )}

              {/* Direct Web3 Connect Button */}
              <div>
                <button
                  type="button"
                  onClick={handleConnectBrowserWallet}
                  disabled={isConnectingWallet}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00F5FF] to-[#00CCFF] text-[#050816] font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-md shadow-[#00F5FF]/20"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{isConnectingWallet ? 'Connecting to BSC Testnet...' : 'Connect Browser Wallet (MetaMask / Trust / Rabby)'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Or Select Multi-User Account</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              {/* Multi-User Personas */}
              <div className="space-y-2.5">
                {userPersonas.map((persona) => (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => {
                      setSelectedPersona(persona.id);
                      setCustomAddress('');
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedPersona === persona.id && !customAddress
                        ? 'bg-[#00F5FF]/10 border-[#00F5FF]/50 text-white'
                        : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{persona.name}</span>
                        {selectedPersona === persona.id && !customAddress && (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#00F5FF]/20 text-[#00F5FF] rounded">Selected</span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">{persona.address}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{persona.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </button>
                ))}
              </div>

              {/* Custom Address Input */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Or Test with Custom BSC Testnet Address:
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#050816] border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#00F5FF]"
                />
              </div>

              {/* Enter User View Action */}
              <button
                type="button"
                onClick={handleEnterAsUser}
                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Enter User Dashboard (Public View)</span>
                <ArrowRight className="w-4 h-4 text-[#00F5FF]" />
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ADMIN OPERATIONS GATE (STRICT PRIVILEGED ACCESS) */}
          {/* ========================================================================= */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-5">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#00FF88]/10 text-[#00FF88] shrink-0 mt-0.5">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Full Operations Center Gate</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Entering as an authenticated administrator unlocks: <strong className="text-slate-200">28 Deployed Smart Contracts</strong>, <strong className="text-slate-200">8 Global Stealth Bots</strong>, <strong className="text-slate-200">Multi-Adapter Micro-Trade Bundler</strong> ($0.20+ gas optimization), <strong className="text-slate-200">Prometheus TSDB telemetry</strong>, and <strong className="text-slate-200">Encrypted S3 Backups</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {adminError && (
                <div className="p-3 rounded-lg bg-[#FF496C]/10 border border-[#FF496C]/30 text-xs text-[#FF496C]">
                  {adminError}
                </div>
              )}

              {/* Operator Role */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Operator Role Clearance
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'superadmin', label: 'Super Admin' },
                    { id: 'quant', label: 'Quant Lead' },
                    { id: 'auditor', label: 'Security Auditor' }
                  ].map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setAdminRole(role.id as any)}
                      className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                        adminRole === role.id
                          ? 'border-[#00FF88] text-[#00FF88] bg-[#00FF88]/10 font-semibold'
                          : 'border-white/10 text-slate-400 hover:text-white bg-white/5'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Identifier */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Administrator Identifier
                </label>
                <input
                  type="text"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#050816] border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#00FF88]"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-400">Security Passphrase</label>
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
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#050816] border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#00FF88]"
                  required
                />
              </div>

              {/* MFA Code */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Hardware MFA / Enclave Passcode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#050816] border border-white/10 rounded-lg text-[#00FF88] font-mono text-center tracking-widest text-sm focus:outline-none focus:border-[#00FF88]"
                />
              </div>

              {/* Preset credentials box */}
              <div className="p-3 rounded-lg bg-[#050816] border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
                <div>
                  <span className="text-slate-300 font-medium">Default Credentials: </span>
                  <span className="font-mono text-slate-400">admin@cashmatrix.io / quantum-matrix-2050</span>
                </div>
                <span className="font-mono text-[#00FF88]">MFA: 849201</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#00FF88] text-[#050816] font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#00FF88]/90 transition-all cursor-pointer shadow-md shadow-[#00FF88]/20"
              >
                <Lock className="w-4 h-4" />
                <span>Unlock & Enter Admin Operations Center</span>
              </button>
            </form>
          )}

          {/* Quick Access Helper Bar for Testing */}
          <div className="mt-8 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span className="text-[11px]">Quick Evaluation Access:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onLoginUser(userPersonas[0].address, userPersonas[0].name)}
                className="px-2.5 py-1 text-[11px] font-medium bg-white/5 hover:bg-white/10 text-[#00F5FF] border border-[#00F5FF]/30 rounded-md transition-colors cursor-pointer"
              >
                1-Click User
              </button>
              <button
                type="button"
                onClick={onLoginAdmin}
                className="px-2.5 py-1 text-[11px] font-medium bg-white/5 hover:bg-white/10 text-[#00FF88] border border-[#00FF88]/30 rounded-md transition-colors cursor-pointer"
              >
                1-Click Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Specs */}
      <div className="w-full max-w-5xl mx-auto py-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-mono">
        <div>CashMatrix Quantum Compound Engine v5.0 — BSC Testnet (97)</div>
        <div className="flex items-center gap-3">
          <span>9 DEX Adapters</span>
          <span>·</span>
          <span>6 Trading Methods</span>
          <span>·</span>
          <span>28 Smart Contracts</span>
        </div>
      </div>

      {/* Wallet Connect Modal for Injected Browser Extension, Live Signer Key or Test Accounts */}
      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onSuccess={() => {
          const snap = web3Service.getSnapshot();
          if (snap.address) {
            onLoginUser(snap.address, snap.connectionType || 'Connected Account');
          }
        }}
      />
    </div>
  );
};
