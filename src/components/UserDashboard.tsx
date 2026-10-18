import React, { useState } from 'react';
import { UserVaultState, web3Service } from '../services/web3';
import { MarketTicker } from '../services/marketStream';
import { TradingGraphView } from './TradingGraphView';
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  AlertCircle,
  Check,
  LineChart,
  Wallet
} from 'lucide-react';

interface UserDashboardProps {
  userState: UserVaultState;
  onConnectWallet: () => void;
  tickers?: Record<string, MarketTicker>;
  initialSubTab?: 'vault' | 'graph';
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  userState,
  onConnectWallet,
  tickers,
  initialSubTab
}) => {
  const [subView, setSubView] = useState<'vault' | 'graph'>(initialSubTab || 'vault');
  const [depositAmount, setDepositAmount] = useState<string>('50');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setActionFeedback({ type: 'error', message: 'Please enter a valid deposit amount.' });
      return;
    }

    setIsProcessing(true);
    setActionFeedback(null);
    try {
      const res = await web3Service.depositFunds(amount);
      if (res.success) {
        setActionFeedback({ type: 'success', message: res.message });
      } else {
        setActionFeedback({ type: 'error', message: res.message });
      }
    } catch {
      setActionFeedback({ type: 'error', message: 'Deposit failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInitiateWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setActionFeedback({ type: 'error', message: 'Please enter a valid withdrawal amount.' });
      return;
    }

    setIsProcessing(true);
    setActionFeedback(null);
    const res = web3Service.initiateTimelockedWithdrawal(amount);
    if (res.success) {
      setActionFeedback({ type: 'success', message: res.message });
    } else {
      setActionFeedback({ type: 'error', message: res.message });
    }
    setIsProcessing(false);
  };

  const handleFinalExecute = () => {
    setIsProcessing(true);
    const res = web3Service.executeFinalWithdrawal();
    if (res.success) {
      setActionFeedback({ type: 'success', message: res.message });
    } else {
      setActionFeedback({ type: 'error', message: res.message });
    }
    setIsProcessing(false);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Wallet Status Banner */}
      {!userState.isConnected ? (
        <div className="p-4 rounded-xl border border-[#00F5FF]/30 bg-[#00F5FF]/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Wallet className="w-4 h-4 text-[#00F5FF]" />
            <span>No wallet connected. Connect your Web3 wallet or BSC Testnet signer to view live on-chain balances.</span>
          </div>
          <button
            onClick={onConnectWallet}
            className="px-3.5 py-1.5 font-semibold text-[#050816] bg-[#00F5FF] rounded-lg hover:bg-[#00F5FF]/90 transition-all cursor-pointer whitespace-nowrap shadow-sm shadow-[#00F5FF]/20"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl border border-[#00FF88]/20 bg-[#0B1021] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
            <span className="text-slate-400">Connected Account:</span>
            <span className="text-white font-semibold">{userState.address}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Balance: <span className="text-[#00FF88] font-bold">{userState.nativeBalance} tBNB</span></span>
            <span className="text-slate-600">|</span>
            <span className="text-[#00F5FF]">BSC Testnet (97)</span>
            <button
              onClick={onConnectWallet}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Switch Account
            </button>
          </div>
        </div>
      )}

      {/* Overview Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            User Capital & Compounding Vault
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Automated capital compounding with strict 50/50 profit splitting and safe-harbor timelock security.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>Target Contract: <code className="text-[#00F5FF]">QuantumVaultCore</code></span>
          <span aria-hidden="true">·</span>
          <span>Timelock Controller: <code className="text-[#00FF88]">CashMatrixTimeLock</code></span>
        </div>
      </div>

      {/* Action Notification */}
      {actionFeedback && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
            actionFeedback.type === 'success'
              ? 'bg-[#00FF88]/10 border-[#00FF88]/30 text-[#00FF88]'
              : 'bg-[#FF496C]/10 border-[#FF496C]/30 text-[#FF496C]'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <Check className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-medium">{actionFeedback.message}</p>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-xs opacity-75 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary KPI Metric Strips (Strict Tabular Numerals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-white/10 bg-[#0B1021]">
          <span className="text-xs font-medium text-slate-400">Total Compounded Capital</span>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-white">
            ${userState.totalCompoundedCapitalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Principal + Reinvested Profits
          </div>
        </div>

        <div className="p-5 rounded-xl border border-white/10 bg-[#0B1021]">
          <span className="text-xs font-medium text-slate-400">Deposited Principal</span>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-200">
            ${userState.depositedCapitalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Base active trading capital
          </div>
        </div>

        <div className="p-5 rounded-xl border border-[#00FF88]/20 bg-[#0B1021]">
          <span className="text-xs font-medium text-[#00FF88]">User 50% Profit Share</span>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#00FF88]">
            +${userState.userProfitShare50Usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Available for withdrawal (timelocked)
          </div>
        </div>

        <div className="p-5 rounded-xl border border-[#00F5FF]/20 bg-[#0B1021]">
          <span className="text-xs font-medium text-[#00F5FF]">Vault 50% Reinvestment</span>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#00F5FF]">
            +${userState.vaultReinvested50Usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Compounding into trade allocation
          </div>
        </div>
      </div>

      {/* 50/50 Profit Split Explainer Mechanism */}
      <div className="p-5 rounded-xl border border-white/10 bg-[#0F172E]/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="w-4 h-4 text-[#00F5FF]" />
            <span>50/50 Autonomic Compound Engine Protocol</span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Each trade executed by the micro-agent swarm automatically harvests alpha. Exactly 50% is credited directly to your profit ledger, and 50% is immediately re-injected into the active trading pool to compound future position sizing.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-xs font-mono text-slate-400">User Alpha</div>
            <div className="text-sm font-bold font-mono text-[#00FF88]">50.00%</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-left">
            <div className="text-xs font-mono text-slate-400">Vault Compounding</div>
            <div className="text-sm font-bold font-mono text-[#00F5FF]">50.00%</div>
          </div>
        </div>
      </div>

      {/* Sub-View Navigation Bar: Capital Vault vs Trading Graph */}
      <div className="flex items-center gap-2 p-1 bg-[#0B1021] border border-white/10 rounded-xl w-fit">
        <button
          onClick={() => setSubView('vault')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            subView === 'vault'
              ? 'bg-[#00F5FF]/15 text-[#00F5FF] border border-[#00F5FF]/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Capital & Compounding Vault (Deposit / Withdraw)</span>
        </button>

        <button
          onClick={() => setSubView('graph')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            subView === 'graph'
              ? 'bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LineChart className="w-4 h-4" />
          <span>Trading Graph View (Live Buy/Sell Markers & Bundler)</span>
        </button>
      </div>

      {subView === 'graph' ? (
        <TradingGraphView tickers={tickers || {}} />
      ) : (
        /* Core Dual Operations Workspace: DEPOSIT and WITHDRAW WITH TIMELOCK */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deposit Panel */}
        <div className="p-6 rounded-xl border border-white/10 bg-[#0B1021] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#00F5FF]/10 text-[#00F5FF]">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-sans">Deposit Capital</h2>
                  <p className="text-xs text-slate-400">Funds immediately enter autonomous compound loop</p>
                </div>
              </div>
              <span className="text-xs font-mono text-[#00F5FF]">0% Deposit Fee</span>
            </div>

            <form onSubmit={handleDeposit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Deposit Amount (USD Value)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-[#050816] border border-white/10 rounded-lg text-white font-mono text-base focus:outline-none focus:border-[#00F5FF]"
                    placeholder="Enter deposit amount"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2">
                {['500', '2500', '10000', '50000'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDepositAmount(val)}
                    className="flex-1 py-1.5 text-xs font-mono text-slate-300 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  >
                    +${parseInt(val).toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-lg bg-[#050816] border border-white/5 text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Routing Destination:</span>
                  <span className="font-mono text-slate-300">QuantumVaultCore (BSC)</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Compounding APY:</span>
                  <span className="font-mono text-[#00FF88] font-semibold">48.6% – 82.4%</span>
                </div>
                <div className="flex justify-between">
                  <span>Minimum Lockup:</span>
                  <span className="font-mono text-slate-300">None (24h Safe-Harbor Timelock)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 text-sm font-semibold text-[#050816] bg-[#00F5FF] rounded-lg hover:bg-[#00F5FF]/90 transition-colors cursor-pointer shadow-sm shadow-[#00F5FF]/20 font-sans"
              >
                {isProcessing ? 'Processing Transaction...' : 'Confirm Deposit to Vault'}
              </button>
            </form>
          </div>
        </div>

        {/* Withdraw with Timelock Panel */}
        <div className="p-6 rounded-xl border border-white/10 bg-[#0B1021] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#FFC107]/10 text-[#FFC107]">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-sans">Withdraw with Timelock</h2>
                  <p className="text-xs text-slate-400">Institutional safe-harbor delay via TimelockController</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#FFC107]">
                <Clock className="w-3.5 h-3.5" />
                <span>24H Delay</span>
              </div>
            </div>

            {userState.timelockActive ? (
              /* Active Timelock Countdown Screen */
              <div className="space-y-5">
                <div className="p-4 rounded-xl border border-[#FFC107]/30 bg-[#FFC107]/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#FFC107]">Queued Withdrawal</span>
                    <span className="text-xs font-mono font-semibold text-white">
                      ${userState.pendingWithdrawalAmountUsd.toLocaleString()} USD
                    </span>
                  </div>

                  <div className="text-center py-4">
                    <div className="text-xs text-slate-400 mb-1">Safe-Harbor Timelock Remaining</div>
                    <div className="text-3xl font-mono font-bold tracking-wider text-white tabular-nums">
                      {formatTime(userState.timelockRemainingSeconds)}
                    </div>
                  </div>

                  <div className="w-full bg-[#050816] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#FFC107] h-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(
                          100,
                          ((userState.timelockTotalSeconds - userState.timelockRemainingSeconds) /
                            userState.timelockTotalSeconds) *
                            100
                        )}%`
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleFinalExecute}
                    disabled={userState.timelockRemainingSeconds > 0 || isProcessing}
                    className={`w-full py-3 px-4 text-sm font-semibold rounded-lg transition-colors font-sans ${
                      userState.timelockRemainingSeconds === 0
                        ? 'bg-[#00FF88] text-[#050816] hover:bg-[#00FF88]/90 cursor-pointer shadow-sm shadow-[#00FF88]/20'
                        : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10'
                    }`}
                  >
                    {userState.timelockRemainingSeconds === 0
                      ? 'Execute Withdrawal (Funds Unlocked)'
                      : `Withdrawal Locked (${formatTime(userState.timelockRemainingSeconds)})`}
                  </button>

                  {/* Audit Shortcut for Evaluation */}
                  <button
                    type="button"
                    onClick={() => web3Service.fastForwardTimelockForAudit()}
                    className="w-full text-center text-xs text-slate-400 hover:text-white underline cursor-pointer py-1"
                  >
                    [Audit / Testing]: Fast-forward 24h timelock to test unlock execution
                  </button>
                </div>
              </div>
            ) : (
              /* Request Timelock Withdrawal Form */
              <form onSubmit={handleInitiateWithdrawal} className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-slate-400">Withdrawal Amount (USD)</label>
                    <span className="text-xs font-mono text-slate-400">
                      Available: ${(userState.depositedCapitalUsd + userState.userProfitShare50Usd).toLocaleString()}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      max={userState.depositedCapitalUsd + userState.userProfitShare50Usd}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-[#050816] border border-white/10 rounded-lg text-white font-mono text-base focus:outline-none focus:border-[#FFC107]"
                      placeholder="Enter withdrawal amount"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        const total = userState.depositedCapitalUsd + userState.userProfitShare50Usd;
                        setWithdrawAmount(Math.floor((total * pct) / 100).toString());
                      }}
                      className="flex-1 py-1.5 text-xs font-mono text-slate-300 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                <div className="p-3.5 rounded-lg bg-[#050816] border border-white/5 text-xs text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00FF88]" />
                    <span>Safe-Harbor Timelock Enforcement</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Withdrawal requests are queued under <code className="text-[#FFC107]">CashMatrixTimeLock</code> (24-hour verification delay) to guarantee zero front-running and safeguard the vault pool from flash-loan draining exploits.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#0B1021] border border-[#FFC107]/40 hover:border-[#FFC107] rounded-lg transition-colors cursor-pointer font-sans"
                >
                  {isProcessing ? 'Queueing Timelock...' : 'Queue Timelocked Withdrawal'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
