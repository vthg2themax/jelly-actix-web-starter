//use std::task::{Context, Poll};

// use actix_service::{Service, Transform};
// use actix_web::dev::{ServiceRequest, ServiceResponse};
// use actix_web::http::header::LOCATION;
use actix_web::{Error, 
    //HttpResponse
};
// use futures::future::{ok, Either, Ready};
// use mime;

//use crate::utility::request::Render;
use crate::utility::models::user::User;
use crate::utility::mime_types;
//use crate::utility::mime_types::{mime_type_json, mime_type_application_www_form_urlencoded};

//let s: String = "abcdefg".to_owned();
//let s_slice: &str = &s[..];  // take a full slice of the string

/// A guard that enables route and scope authentication gating.
#[derive(Debug)]
pub struct Auth {
    /// Where to redirect the user to if they fail an
    /// authentication check.
    pub redirect_to: &'static str,
}



// impl<S, B> Transform<S> for Auth
// where
//     S: Service<Request = ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
//     S::Future: 'static,
// {
//     type Request = ServiceRequest;
//     type Response = ServiceResponse<B>;
//     type Error = Error;
//     type InitError = ();
//     type Transform = AuthMiddleware<S>;
//     type Future = Ready<Result<Self::Transform, Self::InitError>>;

//     fn new_transform(&self, service: S) -> Self::Future {
//         ok(AuthMiddleware {
//             service,
//             redirect_to: self.redirect_to,
//         })
//     }
// }

/// Middleware for checking user authentication status and redirecting depending
/// on the result. You generally don't need this type, but it needs to be exported
/// for compiler reasons.
pub struct AuthMiddleware<S> {
    /// Where to redirect to.
    redirect_to: &'static str,

    /// The service provided.
    service: S,
}

// impl<S, B> Service for AuthMiddleware<S>
// where
//     S: Service<Request = ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
//     S::Future: 'static,
// {
//     type Request = ServiceRequest;
//     type Response = ServiceResponse<B>;
//     type Error = Error;
//     type Future = Either<S::Future, Ready<Result<Self::Response, Self::Error>>>;

//     fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
//         self.service.poll_ready(cx)
//     }

//     fn call(&mut self, req: ServiceRequest) -> Self::Future {
//         let (request, payload) = req.into_parts();

//         let status = request.is_authenticated();

//         match status {
//             Ok(v) if v == true => {
//                 let req = ServiceRequest::from_parts(request, payload).ok().unwrap();
//                 Either::Left(self.service.call(req))
//             }

//             Ok(_) => Either::Right(ok(ServiceResponse::new(
//                 request,
//                 HttpResponse::Found()
//                     .header(LOCATION, self.redirect_to)
//                     .finish()
//                     .into_body(),
//             ))),

//             Err(e) => Either::Right(ok(ServiceResponse::new(
//                 request,
//                 HttpResponse::InternalServerError()
//                     .body(&render(e))
//                     .into_body(),
//             ))),
//         }
//     }
// }

// Guards that can be (and commonly are) used for requests.

use actix_web::guard::{Guard, Header};

pub fn accepts_json() -> impl Guard {    
    Header("content-type", mime_types::APPLICATION_JSON)
}

pub fn accepts_form() -> impl Guard {
    Header("content-type", mime_types::APPLICATION_WWW_FORM_URLENCODED)
}

use actix_session::UserSession;
use actix_web::HttpRequest;

//use crate::accounts::User;


/// `Authentication` is kind of a request guard - it returns a Future which will resolve
/// with either the current authenticated user, or "error" out if the user has no session data
/// that'd tie them to a user profile, or if the session cache can't be read, or if the database
/// has issues, or... pick your poison I guess.
///
pub trait Authentication {
    /// Returns whether a user session exists and is valid.
    fn is_authenticated(&self) -> Result<bool, Error>;

    /// Sets a serializable user instance.
    fn set_user(&self, account: User) -> Result<(), Error>;

    /// Returns a User, if it can be extracted properly.
    fn user(&self) -> Result<User, Error>;
}

impl Authentication for HttpRequest {
    #[inline(always)]
    fn is_authenticated(&self) -> Result<bool, Error> {
        Ok(self
            .get_session()
            .get::<serde_json::Value>("sku")?
            .is_some())
    }

    fn set_user(&self, account: User) -> Result<(), Error> {
        self.get_session().set("sku", account)?;
        Ok(())
    }

    fn user(&self) -> Result<User, Error> {
        match self.get_session().get("sku")? {
            Some(user) => Ok(user),
            None => Ok(User::default()),
        }
    }
}


// pub async fn logout(request: HttpRequest) -> Result<HttpResponse> {
//     request.get_session().clear();
//     request.redirect("/")
// }