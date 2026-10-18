import React, { useState, useEffect } from 'react';
import { Header, AppTab } from './components/Header';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginPage } from './components/LoginPage';
import { MultiUserAdminLoginModal } from './components/MultiUserAdminLoginModal';
import { WalletConnectModal } from './components/WalletConnectModal';
import { marketStream, MarketTicker, NodeTelemetry, LiveTradeExecution } from './services/marketStream';
import { agentSwarm, MicroAgent, SwarmStats } from './services/agentSwarm';
import { web3Service, UserVaultState } from './services/web3';

export default function App() {
  // REQUIREMENT: After each modification / reload, the app lands in the login page
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');
  const [currentTab, setCurrentTab] = useState<AppTab>('user');

  // Wallet Connection Modal state
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);

  // Strict Public View separation
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [pendingTab, setPendingTab] = useState<AppTab | null>(null);

  // Live real-time streams
  const [tickers, setTickers] = useState<Record<string, MarketTicker>>(marketStream.getSnapshot().tickers);
  const [telemetry, setTelemetry] = useState<NodeTelemetry>(marketStream.getSnapshot().telemetry);
  const [agents, setAgents] = useState<MicroAgent[]>(agentSwarm.getSnapshot().agents);
  const [stats, setStats] = useState<SwarmStats>(agentSwarm.getSnapshot().stats);
  const [trades, setTrades] = useState<LiveTradeExecution[]>(agentSwarm.getSnapshot().tradeHistory);
  const [userState, setUserState] = useState<UserVaultState>(web3Service.getSnapshot());

  useEffect(() => {
    const unsubTickers = marketStream.subscribeTickers(setTickers);
    const unsubTelemetry = marketStream.subscribeTelemetry(setTelemetry);
    const unsubSwarm = agentSwarm.subscribe((newAgents, newStats, newTrades) => {
      setAgents([...newAgents]);
      setStats({ ...newStats });
      setTrades([...newTrades]);
    });
    const unsubUser = web3Service.subscribe(setUserState);

    return () => {
      unsubTickers();
      unsubTelemetry();
      unsubSwarm();
      unsubUser();
    };
  }, []);

  const handleSelectTab = (tab: AppTab) => {
    if (tab !== 'user' && tab !== 'graph' && !isAdminAuthenticated) {
      setPendingTab(tab);
      setShowAdminLoginModal(true);
      return;
    }
    setCurrentTab(tab);
  };

  const handleExitToLogin = () => {
    setIsAuthenticated(false);
    setIsAdminAuthenticated(false);
    setUserRole('user');
    setCurrentTab('user');
  };

  // 1. LANDING VIEW: If not authenticated, ALWAYS render the dedicated Multi-User / Admin Login Page
  if (!isAuthenticated) {
    return (
      <LoginPage
        telemetry={telemetry}
        onLoginUser={(address) => {
          web3Service.setUserAddress(address);
          setUserRole('user');
          setIsAdminAuthenticated(false);
          setCurrentTab('user');
          setIsAuthenticated(true);
        }}
        onLoginAdmin={() => {
          setUserRole('admin');
          setIsAdminAuthenticated(true);
          setCurrentTab('bundler');
          setIsAuthenticated(true);
        }}
      />
    );
  }

  // 2. AUTHENTICATED VIEW: Strict separation between User Dashboard (public) and Admin Operations Center
  return (
    <div className="min-h-screen flex flex-col bg-[#050816] text-[#F1F5F9]">
      {/* Top Bar Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        userState={userState}
        onConnectWallet={() => setShowWalletModal(true)}
        onDisconnectWallet={() => web3Service.disconnectWallet()}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenAdminLogin={() => setShowAdminLoginModal(true)}
        onAdminLogout={() => {
          setIsAdminAuthenticated(false);
          setUserRole('user');
          setCurrentTab('user');
        }}
        onExitToLogin={handleExitToLogin}
        telemetry={telemetry}
      />

      {/* Main Operations Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {currentTab === 'user' || currentTab === 'graph' ? (
          <UserDashboard
            userState={userState}
            onConnectWallet={() => setShowWalletModal(true)}
            tickers={tickers}
            initialSubTab={currentTab === 'graph' ? 'graph' : 'vault'}
          />
        ) : (
          <AdminDashboard
            activeTab={currentTab}
            onSelectTab={handleSelectTab}
            tickers={tickers}
            telemetry={telemetry}
            agents={agents}
            stats={stats}
            trades={trades}
          />
        )}
      </main>

      {/* Wallet Connection Modal (Works for Browser Extension, Signer Key & Addresses) */}
      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />

      {/* Multi-User / Admin Authentication Modal */}
      <MultiUserAdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onAdminSuccess={() => {
          setIsAdminAuthenticated(true);
          setUserRole('admin');
          if (pendingTab) {
            setCurrentTab(pendingTab);
            setPendingTab(null);
          } else {
            setCurrentTab('bundler');
          }
        }}
      />

      {/* Institutional Footer */}
      <footer className="w-full border-t border-white/10 bg-[#050816] py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">CashMatrix Quantum Compound Engine v5.0</span>
            <span aria-hidden="true">·</span>
            <span>BSC Testnet Verified</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleExitToLogin}
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              Switch Portal / Logout
            </button>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>BNB Chain (97)</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#00FF88]">9 DEX Adapters Active</span>
            <span aria-hidden="true">·</span>
            <span>28 Contracts Deployed</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#00F5FF]">50/50 Autonomic Splitter</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
