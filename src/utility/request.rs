//use std::env;
use std::sync::{Arc, RwLock};

use actix_web::http::header::LOCATION;
use actix_web::{HttpRequest, HttpResponse};
use serde::Serialize;
//use black_marlin::Template;
use crate::utility::flash::FlashMessages;
use crate::utility::error::Error;

use crate::utility::auth::auth::Authentication;

/// A trait for making certain types of response handling easier.
pub trait Render {
    /// Shorthand for rendering a template, with a specific HTTP response code.
    fn render(&self, code: usize, template: &str) -> Result<HttpResponse, Error>;

    /// Shorthand for returning a JSON payload.
    fn json<S: Serialize>(&self, code: usize, payload: S) -> Result<HttpResponse, Error>;

    /// Handy redirects helper.
    fn redirect(&self, location: &str) -> Result<HttpResponse, Error>;
}

impl Render for HttpRequest {
    fn render(
        &self,
        code: usize,
        template: &str,
    ) -> Result<HttpResponse, Error> {
        let data: Option<&Arc<RwLock<dyn black_marlin::Template>>> = self.app_data();

        // We pull the user and flash messages for all requests;
        // it's blank if a User is anonymous (not authenticated).
        let user = self.user()?;
        let messages = self.get_flash_messages()?;

        if let Some(eng) = data {
            let engine = eng.read().map_err(|e| {
                Error::Generic(format!("Error acquiring template read lock: {:?}", e))
            })?;

            let body = engine.render().map_err(Error::from)?;

            Ok(match code {
                200 => HttpResponse::Ok(),
                400 => HttpResponse::BadRequest(),
                404 => HttpResponse::NotFound(),
                _ => HttpResponse::Ok(),
            }
            .content_type("text/html; charset=utf-8")
            .body(body))
        } else {
            Err(Error::Generic(
                "Unable to locate Templates cache".to_string(),
            ))
        }
    }

    fn json<S: Serialize>(&self, code: usize, payload: S) -> Result<HttpResponse, Error> {
        let o = serde_json::to_string(&payload)?;

        Ok(match code {
            200 => HttpResponse::Ok(),
            400 => HttpResponse::BadRequest(),
            404 => HttpResponse::NotFound(),
            _ => HttpResponse::Ok(),
        }
        .content_type("application/json")
        .body(o))
    }

    fn redirect(&self, location: &str) -> Result<HttpResponse, Error> {
        Ok(HttpResponse::Found()
            .header(LOCATION, location)
            .finish()
            .into_body())
    }
}

/// Shorthand method for throwing a big ol' 404.
#[inline(always)]
pub async fn not_found(request: HttpRequest) -> Result<HttpResponse, Error> {
    request.render(404, "404.html")
}

