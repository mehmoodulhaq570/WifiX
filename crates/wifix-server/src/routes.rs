use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

use axum::{
    body::Body,
    extract::{Multipart, Path as RoutePath, Query, State},
    http::{header, HeaderMap, HeaderValue, Method, StatusCode},
    response::{IntoResponse, Response},
    routing::{delete, get, post},
    Json, Router,
};
use qrcode::{render::svg, QrCode};
use serde::{Deserialize, Serialize};
use tower_http::cors::{AllowHeaders, AllowOrigin, CorsLayer};

use crate::ip::detect_lan_ip;
use wifix_core::{
    allowed_file, list_files, resolve_upload_path, safe_filename, set_file_pin, verify_file_pin,
    remove_file_pin, ConnectionRequest, ConnectionStatus, EventSnapshot, FileInfo, RequestDecision,
    WifixState,
};

static REQUEST_COUNTER: AtomicU64 = AtomicU64::new(1);

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct HealthResponse {
    pub ok: bool,
    pub service: &'static str,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct InfoResponse {
    pub host_url: String,
    pub lan_url: String,
    pub lan_ip: String,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct UploadResponse {
    pub ok: bool,
    pub filename: String,
    pub url: String,
    pub has_pin: bool,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct ErrorResponse {
    pub ok: bool,
    pub error: String,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq)]
pub struct VerifyPinRequest {
    #[serde(default)]
    pub pin: String,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct VerifyPinResponse {
    pub ok: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq)]
pub struct AuthRequest {
    #[serde(default)]
    pub pin: String,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct AuthResponse {
    pub ok: bool,
    pub authed: bool,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct AuthStatusResponse {
    pub pin_required: bool,
    pub authed: bool,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq)]
pub struct CreateConnectionRequest {
    #[serde(default = "default_client_name")]
    pub name: String,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct CreateConnectionResponse {
    pub ok: bool,
    pub request_id: String,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq)]
pub struct RespondConnectionRequest {
    pub id: String,
    pub decision: RequestDecision,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct RespondConnectionResponse {
    pub ok: bool,
    pub status: ConnectionStatus,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct ConnectionStatusResponse {
    pub status: ConnectionStatus,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq)]
pub struct QrQuery {
    pub url: Option<String>,
}

pub fn app(state: WifixState) -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/info", get(info))
        .route("/qr", get(qr))
        .route("/files", get(files))
        .route("/auth/status", get(auth_status))
        .route("/auth", post(auth))
        .route("/auth/logout", post(auth_logout))
        .route("/events", get(events))
        .route("/connect/request", post(create_connection_request))
        .route("/connect/pending", get(list_pending_connection_requests))
        .route("/connect/respond", post(respond_connection_request))
        .route("/connect/status/:request_id", get(get_connection_request_status))
        .route("/upload", post(upload))
        .route("/download/:filename", get(download))
        .route("/download/:filename/verify-pin", post(verify_pin))
        .route("/delete/:filename", delete(delete_file))
        .layer(cors_layer())
        .with_state(state)
}

fn cors_layer() -> CorsLayer {
    CorsLayer::new()
        .allow_origin(AllowOrigin::mirror_request())
        .allow_methods([Method::GET, Method::POST, Method::DELETE, Method::OPTIONS])
        .allow_headers(AllowHeaders::mirror_request())
        .allow_credentials(true)
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        ok: true,
        service: "wifix-server",
    })
}

async fn info() -> Json<InfoResponse> {
    let lan_ip = detect_lan_ip()
        .map(|ip| ip.to_string())
        .unwrap_or_else(|| "127.0.0.1".to_string());
    let host_url = "http://127.0.0.1:5000/".to_string();
    let lan_url = format!("http://{lan_ip}:5000/");

    Json(InfoResponse {
        host_url,
        lan_url,
        lan_ip,
    })
}

async fn qr(Query(query): Query<QrQuery>) -> Response {
    let target = query.url.unwrap_or_else(|| "http://127.0.0.1:5000/".to_string());

    match QrCode::new(target.as_bytes()) {
        Ok(code) => {
            let image = code
                .render::<svg::Color<'_>>()
                .min_dimensions(256, 256)
                .dark_color(svg::Color("#111111"))
                .light_color(svg::Color("#ffffff"))
                .build();

            ([(header::CONTENT_TYPE, "image/svg+xml; charset=utf-8")], image).into_response()
        }
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                ok: false,
                error: "failed_to_generate_qr_code".to_string(),
            }),
        )
            .into_response(),
    }
}

async fn files(State(state): State<WifixState>) -> Json<Vec<FileInfo>> {
    Json(list_files(&state).unwrap_or_default())
}

async fn auth_status(State(state): State<WifixState>, headers: HeaderMap) -> Json<AuthStatusResponse> {
    let pin_required = state.pin_required();
    Json(AuthStatusResponse {
        pin_required,
        authed: !pin_required || request_has_auth_cookie(&headers),
    })
}

async fn auth(State(state): State<WifixState>, Json(payload): Json<AuthRequest>) -> Response {
    if state.verify_access_pin(&payload.pin) {
        let mut response = Json(AuthResponse {
            ok: true,
            authed: true,
        })
        .into_response();
        response.headers_mut().insert(
            header::SET_COOKIE,
            HeaderValue::from_static("wifix_auth=1; Path=/; HttpOnly; SameSite=Lax"),
        );
        response
    } else {
        (
            StatusCode::UNAUTHORIZED,
            Json(AuthResponse {
                ok: false,
                authed: false,
            }),
        )
            .into_response()
    }
}

async fn auth_logout() -> Response {
    let mut response = Json(AuthResponse {
        ok: true,
        authed: false,
    })
    .into_response();
    response.headers_mut().insert(
        header::SET_COOKIE,
        HeaderValue::from_static("wifix_auth=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"),
    );
    response
}

fn request_has_auth_cookie(headers: &HeaderMap) -> bool {
    headers
        .get(header::COOKIE)
        .and_then(|value| value.to_str().ok())
        .map(|cookies| {
            cookies
                .split(';')
                .map(str::trim)
                .any(|cookie| cookie == "wifix_auth=1")
        })
        .unwrap_or(false)
}

async fn events(State(state): State<WifixState>) -> Json<EventSnapshot> {
    Json(EventSnapshot {
        revision: state.event_revision(),
    })
}

async fn create_connection_request(
    State(state): State<WifixState>,
    Json(payload): Json<CreateConnectionRequest>,
) -> Json<CreateConnectionResponse> {
    let request_id = next_request_id();
    let name = if payload.name.trim().is_empty() {
        default_client_name()
    } else {
        payload.name.trim().to_string()
    };
    let request = state.create_connection_request(request_id, name);

    Json(CreateConnectionResponse {
        ok: true,
        request_id: request.id,
    })
}

async fn list_pending_connection_requests(
    State(state): State<WifixState>,
) -> Json<Vec<ConnectionRequest>> {
    Json(state.pending_connections())
}

async fn respond_connection_request(
    State(state): State<WifixState>,
    Json(payload): Json<RespondConnectionRequest>,
) -> Response {
    let status = match payload.decision {
        RequestDecision::Approved => ConnectionStatus::Approved,
        RequestDecision::Denied => ConnectionStatus::Denied,
    };

    match state.respond_connection_request(&payload.id, status.clone()) {
        Some(_) => Json(RespondConnectionResponse { ok: true, status }).into_response(),
        None => (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                ok: false,
                error: "request_not_found".to_string(),
            }),
        )
            .into_response(),
    }
}

async fn get_connection_request_status(
    State(state): State<WifixState>,
    RoutePath(request_id): RoutePath<String>,
) -> Json<ConnectionStatusResponse> {
    Json(ConnectionStatusResponse {
        status: state.connection_status(&request_id),
    })
}

fn default_client_name() -> String {
    "Client".to_string()
}

fn next_request_id() -> String {
    let counter = REQUEST_COUNTER.fetch_add(1, Ordering::Relaxed);
    let millis = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or_default();
    format!("req-{millis}-{counter}")
}

async fn upload(State(state): State<WifixState>, mut multipart: Multipart) -> Response {
    let mut file_name: Option<String> = None;
    let mut file_bytes: Option<Vec<u8>> = None;
    let mut pin: Option<String> = None;

    while let Ok(Some(field)) = multipart.next_field().await {
        let field_name = field.name().unwrap_or_default().to_string();

        match field_name.as_str() {
            "file" => {
                let original_name = field.file_name().unwrap_or("upload.bin").to_string();
                if !allowed_file(&original_name) {
                    return (
                        StatusCode::BAD_REQUEST,
                        Json(ErrorResponse {
                            ok: false,
                            error: "invalid_filename".to_string(),
                        }),
                    )
                        .into_response();
                }

                let bytes = match field.bytes().await {
                    Ok(bytes) => bytes.to_vec(),
                    Err(_) => {
                        return (
                            StatusCode::BAD_REQUEST,
                            Json(ErrorResponse {
                                ok: false,
                                error: "invalid_upload".to_string(),
                            }),
                        )
                            .into_response();
                    }
                };

                file_name = Some(safe_filename(&original_name));
                file_bytes = Some(bytes);
            }
            "pin" => {
                pin = field.text().await.ok().map(|value| value.trim().to_string());
            }
            _ => {}
        }
    }

    let filename = match file_name {
        Some(filename) => filename,
        None => {
            return (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    ok: false,
                    error: "missing_file".to_string(),
                }),
            )
                .into_response();
        }
    };
    let bytes = file_bytes.unwrap_or_default();
    let upload_dir = state.upload_dir();

    if let Err(_) = std::fs::create_dir_all(&upload_dir) {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                ok: false,
                error: "upload_dir_failed".to_string(),
            }),
        )
            .into_response();
    }

    let path = match resolve_upload_path(&upload_dir, &filename) {
        Ok(path) => path,
        Err(_) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    ok: false,
                    error: "invalid_filename".to_string(),
                }),
            )
                .into_response();
        }
    };

    if let Err(_) = std::fs::write(&path, bytes) {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                ok: false,
                error: "save_failed".to_string(),
            }),
        )
            .into_response();
    }

    let pin = pin.unwrap_or_default();
    let has_pin = !pin.trim().is_empty();
    set_file_pin(&state, filename.clone(), pin);
    state.touch_event();

    Json(UploadResponse {
        ok: true,
        url: format!("/download/{filename}"),
        filename,
        has_pin,
    })
    .into_response()
}

async fn download(
    State(state): State<WifixState>,
    RoutePath(filename): RoutePath<String>,
) -> Response {
    let upload_dir = state.upload_dir();
    let path = match resolve_upload_path(&upload_dir, &filename) {
        Ok(path) => path,
        Err(_) => return StatusCode::NOT_FOUND.into_response(),
    };

    if !path.is_file() {
        return StatusCode::NOT_FOUND.into_response();
    }

    match std::fs::read(&path) {
        Ok(bytes) => {
            let content_disposition = format!("attachment; filename=\"{}\"", filename.replace('"', ""));
            (
                [
                    (header::CONTENT_TYPE, "application/octet-stream".to_string()),
                    (header::CONTENT_DISPOSITION, content_disposition),
                ],
                Body::from(bytes),
            )
                .into_response()
        }
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    }
}

async fn verify_pin(
    State(state): State<WifixState>,
    RoutePath(filename): RoutePath<String>,
    Json(payload): Json<VerifyPinRequest>,
) -> Response {
    let upload_dir = state.upload_dir();
    let path = match resolve_upload_path(&upload_dir, &filename) {
        Ok(path) => path,
        Err(_) => {
            return (
                StatusCode::NOT_FOUND,
                Json(VerifyPinResponse {
                    ok: false,
                    error: Some("file_not_found".to_string()),
                    message: None,
                }),
            )
                .into_response();
        }
    };

    if !path.is_file() {
        return (
            StatusCode::NOT_FOUND,
            Json(VerifyPinResponse {
                ok: false,
                error: Some("file_not_found".to_string()),
                message: None,
            }),
        )
            .into_response();
    }

    if verify_file_pin(&state, &filename, &payload.pin) {
        Json(VerifyPinResponse {
            ok: true,
            error: None,
            message: None,
        })
        .into_response()
    } else {
        (
            StatusCode::FORBIDDEN,
            Json(VerifyPinResponse {
                ok: false,
                error: Some("invalid_pin".to_string()),
                message: Some("Invalid PIN".to_string()),
            }),
        )
            .into_response()
    }
}

async fn delete_file(
    State(state): State<WifixState>,
    RoutePath(filename): RoutePath<String>,
) -> Response {
    let upload_dir = state.upload_dir();
    let path = match resolve_upload_path(&upload_dir, &filename) {
        Ok(path) => path,
        Err(_) => {
            return (
                StatusCode::NOT_FOUND,
                Json(ErrorResponse {
                    ok: false,
                    error: "file_not_found".to_string(),
                }),
            )
                .into_response();
        }
    };

    if !path.is_file() {
        return (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                ok: false,
                error: "file_not_found".to_string(),
            }),
        )
            .into_response();
    }

    match std::fs::remove_file(&path) {
        Ok(()) => {
            remove_file_pin(&state, &filename);
            state.touch_event();
            Json(UploadResponse {
                ok: true,
                filename,
                url: String::new(),
                has_pin: false,
            })
            .into_response()
        }
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                ok: false,
                error: "delete_failed".to_string(),
            }),
        )
            .into_response(),
    }
}

#[cfg(test)]
mod tests {
    use std::fs;

    use axum::body::Body;
    use axum::http::{header, Request, StatusCode};
    use http_body_util::BodyExt;
    use tower::ServiceExt;

    use super::*;

    #[tokio::test]
    async fn health_returns_ok() {
        let state = WifixState::new("uploads");
        let response = app(state)
            .oneshot(Request::builder().uri("/health").body(Body::empty()).unwrap())
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        let body = response.into_body().collect().await.unwrap().to_bytes();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["ok"], true);
        assert_eq!(json["service"], "wifix-server");
    }

    #[tokio::test]
    async fn cors_preflight_allows_browser_clients() {
        let state = WifixState::new("uploads");
        let response = app(state)
            .oneshot(
                Request::builder()
                    .method("OPTIONS")
                    .uri("/files")
                    .header(header::ORIGIN, "http://192.168.0.20:5173")
                    .header(header::ACCESS_CONTROL_REQUEST_METHOD, "GET")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response
                .headers()
                .get(header::ACCESS_CONTROL_ALLOW_ORIGIN)
                .unwrap()
                .to_str()
                .unwrap(),
            "http://192.168.0.20:5173"
        );
        assert_eq!(
            response
                .headers()
                .get(header::ACCESS_CONTROL_ALLOW_CREDENTIALS)
                .unwrap()
                .to_str()
                .unwrap(),
            "true"
        );
    }

    #[tokio::test]
    async fn qr_returns_svg_image() {
        let state = WifixState::new("uploads");
        let response = app(state)
            .oneshot(
                Request::builder()
                    .uri("/qr?url=http%3A%2F%2F192.168.0.20%3A5000%2F")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response
                .headers()
                .get(header::CONTENT_TYPE)
                .unwrap()
                .to_str()
                .unwrap(),
            "image/svg+xml; charset=utf-8"
        );

        let body = response.into_body().collect().await.unwrap().to_bytes();
        let image = String::from_utf8(body.to_vec()).unwrap();
        assert!(image.contains("<svg"));
        assert!(image.contains("path"));
    }

    #[tokio::test]
    async fn files_returns_uploaded_file_metadata() {
        let root = std::env::temp_dir().join(format!(
            "wifix-server-files-test-{}",
            std::process::id()
        ));
        let _ = fs::remove_dir_all(&root);
        fs::create_dir_all(&root).unwrap();
        fs::write(root.join("demo.txt"), b"hello").unwrap();

        let state = WifixState::new(&root);
        let response = app(state)
            .oneshot(Request::builder().uri("/files").body(Body::empty()).unwrap())
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        let body = response.into_body().collect().await.unwrap().to_bytes();
        let files: Vec<FileInfo> = serde_json::from_slice(&body).unwrap();
        assert_eq!(files.len(), 1);
        assert_eq!(files[0].filename, "demo.txt");
        assert_eq!(files[0].size, 5);
        assert_eq!(files[0].url, "/download/demo.txt");

        fs::remove_dir_all(root).unwrap();
    }

    #[tokio::test]
    async fn auth_status_is_authed_when_pin_is_disabled() {
        let state = WifixState::new("uploads");
        let response = app(state)
            .oneshot(
                Request::builder()
                    .uri("/auth/status")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["pin_required"], false);
        assert_eq!(json["authed"], true);
    }

    #[tokio::test]
    async fn auth_sets_cookie_for_matching_pin() {
        let state = WifixState::new("uploads").with_access_pin("1234");
        let response = app(state)
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/auth")
                    .header(header::CONTENT_TYPE, "application/json")
                    .body(Body::from(r#"{"pin":"1234"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        assert!(response
            .headers()
            .get(header::SET_COOKIE)
            .unwrap()
            .to_str()
            .unwrap()
            .contains("wifix_auth=1"));
    }

    #[tokio::test]
    async fn auth_rejects_wrong_pin() {
        let state = WifixState::new("uploads").with_access_pin("1234");
        let response = app(state)
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/auth")
                    .header(header::CONTENT_TYPE, "application/json")
                    .body(Body::from(r#"{"pin":"0000"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn auth_status_reads_auth_cookie() {
        let state = WifixState::new("uploads").with_access_pin("1234");
        let response = app(state)
            .oneshot(
                Request::builder()
                    .uri("/auth/status")
                    .header(header::COOKIE, "wifix_auth=1")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["pin_required"], true);
        assert_eq!(json["authed"], true);
    }

    #[tokio::test]
    async fn auth_logout_clears_cookie() {
        let state = WifixState::new("uploads").with_access_pin("1234");
        let response = app(state)
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/auth/logout")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        assert!(response
            .headers()
            .get(header::SET_COOKIE)
            .unwrap()
            .to_str()
            .unwrap()
            .contains("Max-Age=0"));
    }

    #[tokio::test]
    async fn events_returns_current_revision() {
        let state = WifixState::new("uploads");
        state.touch_event();
        state.touch_event();

        let response = app(state)
            .oneshot(
                Request::builder()
                    .uri("/events")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["revision"], 2);
    }

    #[tokio::test]
    async fn connection_request_can_be_created_and_listed() {
        let state = WifixState::new("uploads");
        let response = app(state.clone())
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/connect/request")
                    .header(header::CONTENT_TYPE, "application/json")
                    .body(Body::from(r#"{"name":"Phone"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        let request_id = json["request_id"].as_str().unwrap();

        let response = app(state)
            .oneshot(
                Request::builder()
                    .uri("/connect/pending")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let pending: Vec<ConnectionRequest> = serde_json::from_slice(&body).unwrap();
        assert_eq!(pending.len(), 1);
        assert_eq!(pending[0].id, request_id);
        assert_eq!(pending[0].name, "Phone");
    }

    #[tokio::test]
    async fn connection_request_can_be_approved_and_status_checked() {
        let state = WifixState::new("uploads");
        let request = state.create_connection_request("req-test", "Phone");

        let response = app(state.clone())
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/connect/respond")
                    .header(header::CONTENT_TYPE, "application/json")
                    .body(Body::from(format!(
                        r#"{{"id":"{}","decision":"approved"}}"#,
                        request.id
                    )))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        let response = app(state)
            .oneshot(
                Request::builder()
                    .uri("/connect/status/req-test")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["status"], "approved");
    }

    #[tokio::test]
    async fn connection_response_rejects_missing_request() {
        let state = WifixState::new("uploads");
        let response = app(state)
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/connect/respond")
                    .header(header::CONTENT_TYPE, "application/json")
                    .body(Body::from(r#"{"id":"missing","decision":"denied"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn download_returns_file_bytes() {
        let root = std::env::temp_dir().join(format!(
            "wifix-server-download-test-{}",
            std::process::id()
        ));
        let _ = fs::remove_dir_all(&root);
        fs::create_dir_all(&root).unwrap();
        fs::write(root.join("demo.txt"), b"hello").unwrap();

        let state = WifixState::new(&root);
        let response = app(state)
            .oneshot(
                Request::builder()
                    .uri("/download/demo.txt")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response
                .headers()
                .get(header::CONTENT_DISPOSITION)
                .unwrap()
                .to_str()
                .unwrap(),
            "attachment; filename=\"demo.txt\""
        );

        let body = response.into_body().collect().await.unwrap().to_bytes();
        assert_eq!(&body[..], b"hello");

        fs::remove_dir_all(root).unwrap();
    }

    #[tokio::test]
    async fn download_rejects_missing_file() {
        let state = WifixState::new("uploads");
        let response = app(state)
            .oneshot(
                Request::builder()
                    .uri("/download/missing.txt")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn upload_saves_file_and_returns_metadata() {
        let root = std::env::temp_dir().join(format!(
            "wifix-server-upload-test-{}",
            std::process::id()
        ));
        let _ = fs::remove_dir_all(&root);

        let boundary = "wifix-test-boundary";
        let body = format!(
            "--{boundary}\r\n\
Content-Disposition: form-data; name=\"pin\"\r\n\
\r\n\
1234\r\n\
--{boundary}\r\n\
Content-Disposition: form-data; name=\"file\"; filename=\"hello world.txt\"\r\n\
Content-Type: text/plain\r\n\
\r\n\
hello from upload\r\n\
--{boundary}--\r\n"
        );

        let state = WifixState::new(&root);
        let response = app(state.clone())
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/upload")
                    .header(
                        header::CONTENT_TYPE,
                        format!("multipart/form-data; boundary={boundary}"),
                    )
                    .body(Body::from(body))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        let body = response.into_body().collect().await.unwrap().to_bytes();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["ok"], true);
        assert_eq!(json["filename"], "hello_world.txt");
        assert_eq!(json["url"], "/download/hello_world.txt");
        assert_eq!(json["has_pin"], true);
        assert_eq!(
            fs::read_to_string(root.join("hello_world.txt")).unwrap(),
            "hello from upload"
        );

        fs::remove_dir_all(root).unwrap();
    }

    #[tokio::test]
    async fn upload_rejects_missing_file_field() {
        let root = std::env::temp_dir().join(format!(
            "wifix-server-upload-missing-test-{}",
            std::process::id()
        ));
        let boundary = "wifix-test-boundary";
        let body = format!(
            "--{boundary}\r\n\
Content-Disposition: form-data; name=\"pin\"\r\n\
\r\n\
1234\r\n\
--{boundary}--\r\n"
        );

        let state = WifixState::new(&root);
        let response = app(state)
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/upload")
                    .header(
                        header::CONTENT_TYPE,
                        format!("multipart/form-data; boundary={boundary}"),
                    )
                    .body(Body::from(body))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::BAD_REQUEST);
    }

    #[tokio::test]
    async fn verify_pin_accepts_matching_pin() {
        let root = std::env::temp_dir().join(format!(
            "wifix-server-verify-pin-test-{}",
            std::process::id()
        ));
        let _ = fs::remove_dir_all(&root);
        fs::create_dir_all(&root).unwrap();
        fs::write(root.join("demo.txt"), b"hello").unwrap();

        let state = WifixState::new(&root);
        set_file_pin(&state, "demo.txt", "1234");

        let response = app(state)
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/download/demo.txt/verify-pin")
                    .header(header::CONTENT_TYPE, "application/json")
                    .body(Body::from(r#"{"pin":"1234"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["ok"], true);

        fs::remove_dir_all(root).unwrap();
    }

    #[tokio::test]
    async fn verify_pin_rejects_wrong_pin() {
        let root = std::env::temp_dir().join(format!(
            "wifix-server-verify-wrong-pin-test-{}",
            std::process::id()
        ));
        let _ = fs::remove_dir_all(&root);
        fs::create_dir_all(&root).unwrap();
        fs::write(root.join("demo.txt"), b"hello").unwrap();

        let state = WifixState::new(&root);
        set_file_pin(&state, "demo.txt", "1234");

        let response = app(state)
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/download/demo.txt/verify-pin")
                    .header(header::CONTENT_TYPE, "application/json")
                    .body(Body::from(r#"{"pin":"0000"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::FORBIDDEN);
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["ok"], false);
        assert_eq!(json["error"], "invalid_pin");

        fs::remove_dir_all(root).unwrap();
    }

    #[tokio::test]
    async fn verify_pin_rejects_missing_file() {
        let state = WifixState::new("uploads");
        let response = app(state)
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/download/missing.txt/verify-pin")
                    .header(header::CONTENT_TYPE, "application/json")
                    .body(Body::from(r#"{"pin":"1234"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn delete_removes_file_and_pin() {
        let root = std::env::temp_dir().join(format!(
            "wifix-server-delete-test-{}",
            std::process::id()
        ));
        let _ = fs::remove_dir_all(&root);
        fs::create_dir_all(&root).unwrap();
        fs::write(root.join("demo.txt"), b"hello").unwrap();

        let state = WifixState::new(&root);
        set_file_pin(&state, "demo.txt", "1234");

        let response = app(state.clone())
            .oneshot(
                Request::builder()
                    .method("DELETE")
                    .uri("/delete/demo.txt")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        assert!(!root.join("demo.txt").exists());
        assert!(verify_file_pin(&state, "demo.txt", ""));

        fs::remove_dir_all(root).unwrap();
    }

    #[tokio::test]
    async fn delete_rejects_missing_file() {
        let state = WifixState::new("uploads");
        let response = app(state)
            .oneshot(
                Request::builder()
                    .method("DELETE")
                    .uri("/delete/missing.txt")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }
}
