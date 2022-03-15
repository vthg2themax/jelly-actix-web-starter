use actix_web::web::{HttpRequest, HttpResponse, Path};
use Result;

use crate::utility::auth::auth::Authentication;
use crate::utility::database::DatabasePool;
use crate::utility::error::Error;
use crate::utility::models::account::Account;
use crate::utility::models::user::User;
use crate::utility::request::Render;
use crate::utility::tokens::token_generator::OneTimeUseTokenGenerator;

/// Decodes the pieces used in verify and reset-password URL structures,
/// and validates them. If they're valid, it will return the Account in
/// question - if not, it will raise a generic error.
///
/// Flows should silence this error and display a generic message to
/// the user to avoid leaking information.
pub async fn validate_token(
    request: &HttpRequest,
    uidb64: &str,
    ts: &str,
    token: &str,
) -> Result<Account, Error> {
    if let Ok(uid_bytes) = base64_url::decode(&uidb64) {
        if let Ok(uid_str) = std::str::from_utf8(&uid_bytes) {
            if let Ok(uid) = uid_str.parse::<i64>() {
                let db = request.db_pool()?;

                if let Ok(account) = Account::get(uid, db).await {
                    // Actix-web route params are iffy here, so...
                    // we rebuild the full token before passing in.
                    let token = format!("{}-{}", ts, token);

                    if account.is_token_valid(&token) {
                        return Ok(account);
                    }
                }
            }
        }
    }
    
    
    Err(Error::InvalidAccountToken)
}

/// Given a link (of form {uidb64}-{ts}-{token}), verifies the
/// token and user, signs them in, and redirects to the dashboard.
///
/// In general, we do not want to leak information, so any errors here
/// should simply report as "invalid or expired".
pub async fn with_token(
    request: HttpRequest,
    Path((uidb64, ts, token)): Path<(String, String, String)>,
) -> Result<HttpResponse, Error> {
    if let Ok(account) = validate_token(&request, &uidb64, &ts, &token).await {
        let db = request.db_pool()?;
        Account::mark_verified(account.id, db).await?;

        request.set_user(User {
            id: account.id,
            name: account.name,
            is_admin: account.is_admin,
            is_anonymous: false,
        })?;

        return request.redirect("/dashboard/");
    }

    return request.render(200, "accounts/invalid_token.html");
}
