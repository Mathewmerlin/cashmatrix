-- CashMatrix Quantum Compound Engine v5.0
-- Database Schema for cashmatrix.db

CREATE TABLE IF NOT EXISTS execution_logs (
    id TEXT PRIMARY KEY,
    tx_hash TEXT NOT NULL,
    log_type TEXT NOT NULL,
    route TEXT NOT NULL,
    gas_gwei REAL NOT NULL,
    profit_usd REAL NOT NULL,
    latency_ms INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_states (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL,
    confidence INTEGER NOT NULL,
    accuracy REAL NOT NULL,
    decisions_24h INTEGER NOT NULL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS s3_backup_audit (
    snapshot_id TEXT PRIMARY KEY,
    s3_key TEXT NOT NULL,
    bucket_name TEXT NOT NULL,
    sha256_hash TEXT NOT NULL,
    original_size_bytes INTEGER NOT NULL,
    compressed_size_bytes INTEGER NOT NULL,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_timelocks (
    user_address TEXT PRIMARY KEY,
    pending_amount_usd REAL NOT NULL,
    queued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unlock_timestamp INTEGER NOT NULL,
    executed BOOLEAN DEFAULT 0
);
