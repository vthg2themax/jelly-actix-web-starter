use actix_web::web::{resource, ServiceConfig};
use std::prelude::*;
use Result;

//Add any new pages below
pub mod index;

//Add any new folders below
pub mod accounts;

pub fn configure(config: &mut ServiceConfig) {
    config.service(resource("/").to(index::index));

}

