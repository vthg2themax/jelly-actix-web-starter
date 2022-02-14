use actix_web::web::{ServiceConfig};

/// Enables serving static assets files, on by default
#[cfg(not(feature = "disable_serving_assets"))]
pub fn assets_handler(config: &mut ServiceConfig) {
    let static_path =
        std::env::var("ASSETS_ROOT").expect("Running without ASSETS_ROOT set!");

    let fs = actix_files::Files::new("/assets", &static_path);
    config.service(fs);
}

/// Disables serving static assets files.
#[cfg(feature = "disable_serving_assets")]
pub fn assets_handler(_config: &mut ServiceConfig) {}