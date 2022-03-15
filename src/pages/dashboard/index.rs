use jelly::prelude::*;
use jelly::Result;

/// Returns an overview of everything in the system.
pub async fn dashboard(request: HttpRequest) -> Result<HttpResponse> {
    //let user = request.user()?;

    request.render(200, "dashboard/index.html", {
        let context = Context::new();
        context
    })
}

//! Admin dashboard.

use jelly::actix_web::web::{resource, scope, ServiceConfig};
use jelly::guards::Auth;

pub fn configure(config: &mut ServiceConfig) {
    let guard = Auth {
        redirect_to: "/accounts/login/",
    };

    config.service(
        scope("/dashboard/")
            .wrap(guard)
            // Index
            .service(resource("").to(views::dashboard)),
    );
}
