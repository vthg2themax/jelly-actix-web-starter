use jelly::accounts::User;
use jelly::actix_web::{web::Path, HttpRequest};
use jelly::prelude::*;
use jelly::request::DatabasePool;
use jelly::Result;

use crate::accounts::views::utils::validate_token;
use crate::accounts::Account;

/// Just renders a standard "Check your email and verify" page.
pub async fn verify(request: HttpRequest) -> Result<HttpResponse> {
    if (true) {
        panic!("birds");
    }
    request.render(200, "accounts/verify/index.html", Context::new())
}

