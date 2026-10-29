// Prevents an additional console window on Windows in release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::time::Duration;

/// Upper bound for one SNTP exchange. Kept below the 1.5s window the frontend
/// gives all time providers, so an unreachable server never delays a sync.
const NTP_TIMEOUT: Duration = Duration::from_millis(1200);

/// One SNTP measurement. `offset_ms` uses the same sign as the frontend:
/// server timestamp minus local midpoint, i.e. positive means the local clock
/// is behind. `rtt_ms` is the round trip delay of the exchange.
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct NtpResult {
    offset_ms: f64,
    rtt_ms: f64,
}

#[tauri::command]
async fn ntp_query(server: String) -> Result<NtpResult, String> {
    tauri::async_runtime::spawn_blocking(move || measure(&server))
        .await
        .map_err(|e| format!("ntp task failed: {e}"))?
}

fn measure(server: &str) -> Result<NtpResult, String> {
    let config = rsntp::Config::default().timeout(NTP_TIMEOUT);
    let client = rsntp::SntpClient::with_config(config);
    let result = client
        .synchronize(server)
        .map_err(|e| format!("ntp {server}: {e}"))?;

    Ok(NtpResult {
        offset_ms: result.clock_offset().as_secs_f64() * 1000.0,
        rtt_ms: result.round_trip_delay().as_secs_f64() * 1000.0,
    })
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![ntp_query])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
