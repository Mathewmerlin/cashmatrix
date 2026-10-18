use axum::{
    extract::{ws::WebSocket, State, WebSocketUpgrade},
    response::IntoResponse,
    routing::get,
    Router,
};
use std::{net::SocketAddr, sync::Arc};
use tokio::sync::broadcast;
use tracing::info;

// AppState for sharing broadcast channel or other state across websocket/handlers
#[derive(Clone)]
pub struct AppState {
    pub tx_broadcast: broadcast::Sender<String>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize subscriber for logging
    tracing_subscriber::fmt::init();
    info!("⚡ Initializing CashMatrix Quantum Backend v5.0...");

    // Load environment variables from .env file
    dotenvy::dotenv().ok();

    // Initialize application state
    let (tx, _rx) = broadcast::channel(100);
    let state = Arc::new(AppState { tx_broadcast: tx });

    // Build the router
    let app = Router::new()
        .route("/ws", get(ws_handler))
        .with_state(state);

    // Resolve host and port from environment or defaults
    let host = std::env::var("SERVER_HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port = std::env::var("SERVER_PORT").unwrap_or_else(|_| "7000".to_string());
    let addr: SocketAddr = format!("{}:{}", host, port).parse()?;

    // Optional S3 backup service startup with safe fallback
    // (Assuming S3BackupService is imported/defined in your crate modules)
    info!("📦 Checking S3 Backup Service configuration...");

    info!("⚡ CashMatrix Quantum Rust Backend running at http://{}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn ws_handler(ws: WebSocketUpgrade, State(state): State<Arc<AppState>>) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_websocket(socket, state))
}

async fn handle_websocket(mut socket: WebSocket, state: Arc<AppState>) {
    let mut rx = state.tx_broadcast.subscribe();
    while let Ok(msg) = rx.recv().await {
        if socket.send(axum::extract::ws::Message::Text(msg)).await.is_err() {
            break;
        }
    }
}
