import { CONTRACT_REGISTRY } from '../data/contracts';
import { agentSwarm } from './agentSwarm';

export function exportContractsCSV() {
  const headers = ['ID', 'Contract Name', 'BSC Address', 'Layer', 'Criticality', 'Security Score (out of 10)', 'Purpose', 'Key Vulnerability Risk', 'BSCScan URL'];
  const rows = CONTRACT_REGISTRY.map(c => [
    c.id,
    `"${c.name}"`,
    c.address,
    c.layer,
    c.criticality,
    c.securityScore,
    `"${c.purpose.replace(/"/g, '""')}"`,
    `"${c.keyRisk.replace(/"/g, '""')}"`,
    c.bscScanUrl
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadBlob(csvContent, 'CashMatrix_Quantum_Contracts_Audit_Registry.csv', 'text/csv;charset=utf-8;');
}

export function exportTradesCSV() {
  const swarm = agentSwarm.getSnapshot();
  const headers = ['Transaction Hash', 'Timestamp', 'Route / Micro-Agent', 'Target DEX / Contract', 'Token Pair', 'Amount In', 'Amount Out', 'Total Profit USD', 'User 50% Share USD', 'Vault 50% Share USD', 'Gas (Gwei)', 'Execution Latency (ms)', 'Audit Status'];
  
  const rows = swarm.tradeHistory.map(t => [
    t.txHash,
    `"${t.timestamp}"`,
    `"${t.route}"`,
    `"${t.dex}"`,
    `"${t.tokenPair}"`,
    `"${t.amountIn}"`,
    `"${t.amountOut}"`,
    t.profitUsd.toFixed(2),
    t.userProfit50.toFixed(2),
    t.vaultProfit50.toFixed(2),
    t.gasGwei,
    t.latencyMs,
    t.status
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadBlob(csvContent, 'CashMatrix_Quantum_Compounded_Trades_Ledger.csv', 'text/csv;charset=utf-8;');
}

export function exportFullProtocolJSON() {
  const swarm = agentSwarm.getSnapshot();
  const fullReport = {
    protocol: 'CashMatrix Quantum Compound Engine v5.0',
    exportTimestamp: new Date().toISOString(),
    architecture: 'Observer-Only Autonomous Operations Center',
    philosophy: 'Human observes, AI operates',
    network: 'BNB Smart Chain Testnet (Chain ID 97) & Mainnet Cross-Compatibility',
    profitSplitFormula: '50% User Yield, 50% Vault Reinvestment, 100% Capital Compounding',
    swarmStatistics: swarm.stats,
    microAgents: swarm.agents,
    recentExecutionLogs: swarm.tradeHistory,
    deployedContractsRegistry: CONTRACT_REGISTRY
  };

  const jsonStr = JSON.stringify(fullReport, null, 2);
  downloadBlob(jsonStr, 'CashMatrix_Quantum_Full_Protocol_Audit_Dump.json', 'application/json');
}

export function exportExcelCompatibleHTML() {
  const swarm = agentSwarm.getSnapshot();
  
  let html = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Contract Intelligence</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
    <style>
      body { font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #ffffff; color: #1e293b; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 24px; }
      th { background-color: #0B1021; color: #00F5FF; border: 1px solid #334155; padding: 8px 12px; text-align: left; }
      td { border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 12px; }
      .header-title { font-size: 18px; font-weight: bold; margin-bottom: 8px; color: #0f172a; }
      .badge-critical { color: #dc2626; font-weight: bold; }
      .badge-high { color: #d97706; font-weight: bold; }
    </style>
  </head>
  <body>
    <div class="header-title">CASHMATRIX QUANTUM COMPOUND ENGINE v5.0 — INSTITUTIONAL AUDIT DOSSIER</div>
    <p>Export Date: ${new Date().toUTCString()} | Network: BSC Testnet / Mainnet | Target: All 28 Deployed Contracts</p>
    
    <h3>1. DEPLOYED CONTRACTS REGISTRY (ALL 28 SYSTEM CONTRACTS)</h3>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Contract Name</th>
          <th>BSC Contract Address</th>
          <th>Layer</th>
          <th>Criticality</th>
          <th>Security Score</th>
          <th>Protocol Functionality</th>
          <th>Risk Vector Assessment</th>
        </tr>
      </thead>
      <tbody>
        ${CONTRACT_REGISTRY.map(c => `
          <tr>
            <td>${c.id}</td>
            <td><b>${c.name}</b></td>
            <td><code>${c.address}</code></td>
            <td>${c.layer}</td>
            <td class="${c.criticality === 'Critical' ? 'badge-critical' : 'badge-high'}">${c.criticality}</td>
            <td><b>${c.securityScore} / 10</b></td>
            <td>${c.purpose}</td>
            <td>${c.keyRisk}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h3>2. LIVE 50/50 PROFIT SPLIT & COMPOUNDING LEDGER</h3>
    <table>
      <thead>
        <tr>
          <th>TX Hash</th>
          <th>Timestamp</th>
          <th>Routing Micro-Agent</th>
          <th>Target Protocol</th>
          <th>Pair</th>
          <th>Total Trade Alpha (USD)</th>
          <th>User 50% Profit</th>
          <th>Vault 50% Reinvestment</th>
          <th>Gas (Gwei)</th>
          <th>Latency (ms)</th>
        </tr>
      </thead>
      <tbody>
        ${swarm.tradeHistory.map(t => `
          <tr>
            <td><code>${t.txHash.slice(0, 16)}...</code></td>
            <td>${t.timestamp}</td>
            <td>${t.route}</td>
            <td>${t.dex}</td>
            <td>${t.tokenPair}</td>
            <td>$${t.profitUsd.toFixed(2)}</td>
            <td><b>$${t.userProfit50.toFixed(2)}</b></td>
            <td><b>$${t.vaultProfit50.toFixed(2)}</b></td>
            <td>${t.gasGwei} Gwei</td>
            <td>${t.latencyMs} ms</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </body>
  </html>
  `;

  downloadBlob(html, 'CashMatrix_Quantum_Audit_Workbook.xls', 'application/vnd.ms-excel');
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
