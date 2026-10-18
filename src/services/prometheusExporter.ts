import { tsdb, NodeTelemetry } from './marketStream';
import { SwarmStats } from './agentSwarm';

export function generatePrometheusMetrics(stats: SwarmStats, telemetry: NodeTelemetry): string {
  return tsdb.getPrometheusMetrics(stats, telemetry);
}

export function generateGrafanaDashboardJSON(): string {
  const dashboard = {
    annotations: { list: [] },
    editable: true,
    fiscalYearStartMonth: 0,
    graphTooltip: 1,
    id: null,
    links: [],
    liveNow: true,
    panels: [
      {
        id: 1,
        title: "CashMatrix Trade Alpha & PnL (USD)",
        type: "timeseries",
        gridPos: { h: 8, w: 12, x: 0, y: 0 },
        targets: [
          {
            datasource: { type: "prometheus", uid: "prometheus" },
            editorMode: "code",
            expr: "cashmatrix_pnl_usd_total",
            legendFormat: "Total Compounded PnL ($)",
            range: true,
            refId: "A"
          },
          {
            datasource: { type: "prometheus", uid: "prometheus" },
            editorMode: "code",
            expr: "cashmatrix_user_profit_share_usd",
            legendFormat: "User 50% Profit Share ($)",
            range: true,
            refId: "B"
          }
        ]
      },
      {
        id: 2,
        title: "Micro-Agent Execution Latency (ms)",
        type: "timeseries",
        gridPos: { h: 8, w: 12, x: 12, y: 0 },
        targets: [
          {
            datasource: { type: "prometheus", uid: "prometheus" },
            editorMode: "code",
            expr: "cashmatrix_rpc_latency_ms",
            legendFormat: "EVM RPC Round-Trip (ms)",
            range: true,
            refId: "A"
          }
        ]
      },
      {
        id: 3,
        title: "MEV Front-Running Attacks Neutralized",
        type: "stat",
        gridPos: { h: 6, w: 6, x: 0, y: 8 },
        targets: [
          {
            datasource: { type: "prometheus", uid: "prometheus" },
            editorMode: "code",
            expr: "cashmatrix_mev_blocked_total",
            legendFormat: "MEV Attacks Blocked",
            range: false,
            refId: "A"
          }
        ]
      },
      {
        id: 4,
        title: "Gas Base Fee vs Priority (Gwei)",
        type: "timeseries",
        gridPos: { h: 6, w: 18, x: 6, y: 8 },
        targets: [
          {
            datasource: { type: "prometheus", uid: "prometheus" },
            editorMode: "code",
            expr: "cashmatrix_gas_price_gwei",
            legendFormat: "{{type}} fee (Gwei)",
            range: true,
            refId: "A"
          }
        ]
      }
    ],
    refresh: "5s",
    schemaVersion: 39,
    tags: ["cashmatrix", "quantum-engine", "defi", "prometheus"],
    templating: { list: [] },
    time: { from: "now-1h", to: "now" },
    timepicker: {},
    timezone: "utc",
    title: "CashMatrix Quantum Compound Engine v5.0 — Operations Dashboard",
    uid: "cashmatrix-quantum-v5",
    version: 1
  };

  return JSON.stringify(dashboard, null, 2);
}

export function downloadGrafanaDashboard() {
  const json = generateGrafanaDashboardJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'CashMatrix_Quantum_Grafana_Dashboard.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
