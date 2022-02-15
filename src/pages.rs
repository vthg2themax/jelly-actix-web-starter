use actix_web::{web, App, HttpResponse};
use actix_web::web::ServiceConfig;
use actix_web::web::{resource};
use std::prelude::*;
use Result;

//Add any new pages below
pub mod index;

//Add any new folders below
pub mod accounts;

//    self.service(resource("/").to(index::index));

// this function could be located in different module
pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(index::index);
    // cfg.service(
    //     web::resource("/").to()//pp::new().service(web::resource("/").route(web::route().to(index)));
    //         .route(web::get().to(|| HttpResponse::Ok()))
    //         .route(web::head().to(|| HttpResponse::MethodNotAllowed()))
    //         .route(web::route().to(index::index)
    // )
}