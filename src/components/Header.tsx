import React from 'react';
import { Logo } from './Logo';
import { UserVaultState } from '../services/web3';
import { NodeTelemetry } from '../services/marketStream';
import { Wallet, Lock, CheckCircle2, Shield, EyeOff, Radio, Layers, LogOut } from 'lucide-react';

export type AppTab =
  | 'user'
  | 'graph'
  | 'bundler'
  | 'stealth'
  | 'matrix'
  | 'orderbooks'
  | 'swarm'
  | 'contracts'
  | 'risk'
  | 'prometheus'
  | 's3'
  | 'audit';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: AppTab) => void;
  userState: UserVaultState;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  isAdminAuthenticated: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
  onExitToLogin: () => void;
  telemetry: NodeTelemetry;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  userState,
  onConnectWallet,
  onDisconnectWallet,
  isAdminAuthenticated,
  onOpenAdminLogin,
  onAdminLogout,
  onExitToLogin,
  telemetry
}) => {
  // Normalize alias tabs
  const activeKey = currentTab === 'trading' ? 'matrix' : currentTab === 'metrics' ? 'prometheus' : currentTab;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#050816]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-5 shrink-0">
          <button
            onClick={() => onSelectTab('user')}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
            title="CashMatrix Quantum Compound Engine v5.0"
          >
            <Logo size={32} />
          </button>

          {/* Clean unboxed telemetry metadata */}
          <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>BSC-97</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>#{telemetry.blockNumber}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-[#00FF88]">{telemetry.gasPriceGwei} Gwei</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-[#00F5FF]">{telemetry.latencyMs}ms</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Strict Public vs Admin Separation) */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
          {/* Public / User Dashboard Tabs - ALWAYS VISIBLE */}
          <button
            onClick={() => onSelectTab('user')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeKey === 'user'
                ? 'text-[#00F5FF] bg-[#00F5FF]/10 font-semibold border border-[#00F5FF]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            User Vault (Deposit/Withdraw)
          </button>

          <button
            onClick={() => onSelectTab('graph')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeKey === 'graph'
                ? 'text-[#00FF88] bg-[#00FF88]/10 font-semibold border border-[#00FF88]/20'
                : 'text-slate-300 hover:text-[#00FF88] hover:bg-white/5'
            }`}
          >
            Trading Graph (Buy/Sell)
          </button>

          {/* ADMIN ONLY TABS — STRICTLY HIDDEN FROM PUBLIC VIEW */}
          {isAdminAuthenticated && (
            <>
              <div className="h-5 w-px bg-white/10 mx-1 hidden sm:block" />

              <button
                onClick={() => onSelectTab('bundler')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  activeKey === 'bundler'
                    ? 'text-[#00FF88] bg-[#00FF88]/15 font-semibold border border-[#00FF88]/30 shadow-sm'
                    : 'text-slate-300 hover:text-[#00FF88] hover:bg-white/5'
                }`}
                title="Multi-Adapter Atomic Micro-Trade Bundler (Gas Optimization >= $0.20)"
              >
                <Layers className="w-3.5 h-3.5 text-[#00FF88]" />
                <span>Trade Bundler ($0.20+ Arb)</span>
              </button>

              <button
                onClick={() => onSelectTab('stealth')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  activeKey === 'stealth'
                    ? 'text-[#00FF88] bg-[#00FF88]/10 font-semibold border border-[#00FF88]/30'
                    : 'text-slate-300 hover:text-[#00FF88] hover:bg-white/5'
                }`}
                title="Global Stealth Arbitrage Bots & Cryptographic Signers"
              >
                <EyeOff className="w-3.5 h-3.5 text-[#00FF88]" />
                <span>Stealth Bots (8)</span>
              </button>

              <button
                onClick={() => onSelectTab('matrix')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  activeKey === 'matrix'
                    ? 'text-[#00F5FF] bg-[#00F5FF]/10 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Live Trading
              </button>

              <button
                onClick={() => onSelectTab('orderbooks')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  activeKey === 'orderbooks'
                    ? 'text-[#00F5FF] bg-[#00F5FF]/10 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Order Books
              </button>

              <button
                onClick={() => onSelectTab('swarm')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  activeKey === 'swarm'
                    ? 'text-[#00F5FF] bg-[#00F5FF]/10 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                AI Swarm
              </button>

              <button
                onClick={() => onSelectTab('contracts')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  activeKey === 'contracts'
                    ? 'text-[#00F5FF] bg-[#00F5FF]/10 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                28 Contracts
              </button>

              <button
                onClick={() => onSelectTab('risk')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  activeKey === 'risk'
                    ? 'text-[#00F5FF] bg-[#00F5FF]/10 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Risk OS
              </button>

              <button
                onClick={() => onSelectTab('prometheus')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  activeKey === 'prometheus'
                    ? 'text-[#00F5FF] bg-[#00F5FF]/10 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Prometheus
              </button>

              <button
                onClick={() => onSelectTab('s3')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  activeKey === 's3'
                    ? 'text-[#00F5FF] bg-[#00F5FF]/10 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                S3 Backups
              </button>

              <button
                onClick={() => onSelectTab('audit')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  activeKey === 'audit'
                    ? 'text-[#00F5FF] bg-[#00F5FF]/10 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Audit & Export
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Actions & Auth Gateways */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Admin Armed / Access */}
          {isAdminAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onSelectTab('bundler')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#00FF88] bg-[#00FF88]/10 border border-[#00FF88]/30 rounded-lg hover:bg-[#00FF88]/20 transition-colors whitespace-nowrap cursor-pointer"
                title="Admin authenticated. Click to open Operations Center."
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin: </span>
                <span>Operations Center</span>
              </button>
              <button
                onClick={onAdminLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-white/5 border border-white/10 rounded-lg transition-colors cursor-pointer"
                title="Lock Admin and return to Public View"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Lock</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#00F5FF] bg-[#00F5FF]/10 border border-[#00F5FF]/30 rounded-lg hover:bg-[#00F5FF]/20 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
              title="Admin login required to view internal contracts, bundler, and trading telemetry"
            >
              <Lock className="w-3.5 h-3.5 text-[#00F5FF]" />
              <span>Admin Access</span>
            </button>
          )}

          {/* Wallet Connect Badge */}
          {userState.isConnected && userState.address ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onConnectWallet}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-medium text-white bg-[#0B1021] border border-[#00FF88]/30 rounded-lg hover:border-[#00FF88] transition-all cursor-pointer whitespace-nowrap"
                title="Wallet connected to BSC Testnet (97). Click to view details or switch."
              >
                <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                <span>{userState.address.slice(0, 6)}...{userState.address.slice(-4)}</span>
                <span className="text-[#00FF88] font-semibold hidden md:inline">({userState.nativeBalance} tBNB)</span>
              </button>
              <button
                onClick={onDisconnectWallet}
                className="px-2 py-1.5 text-[11px] text-slate-400 hover:text-white bg-white/5 border border-white/10 rounded-lg cursor-pointer"
                title="Disconnect"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-[#050816] bg-[#00F5FF] rounded-lg hover:bg-[#00F5FF]/90 transition-colors cursor-pointer whitespace-nowrap shadow-sm shadow-[#00F5FF]/20"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}

          {/* Exit / Return to Login Page button */}
          <button
            onClick={onExitToLogin}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-[#FF496C] bg-white/5 hover:bg-[#FF496C]/10 border border-white/10 hover:border-[#FF496C]/30 rounded-lg transition-colors cursor-pointer"
            title="Log Out & Return to Login Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Exit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
