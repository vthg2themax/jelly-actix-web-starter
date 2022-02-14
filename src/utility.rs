use uuid::Uuid;

pub mod assets;
pub mod auth;
pub mod error;
pub mod database;
pub mod flash;
pub mod mime_types;
pub mod models;
pub mod password;
pub mod prelude;
pub mod request;
pub mod server;
pub mod tokens;
pub mod validators;


use actix_web::web::ServiceConfig;
use actix_web::Result;
use actix_web::{HttpRequest, HttpResponse};


pub fn default_redirect_path() -> String {
    "/".into()
}

///convert_guid_to_sqlite_string converts a guid to an sqlite string if possible, 
/// like so: f737a4904dac6736c7d8fe7b765ee354
pub fn convert_guid_to_sqlite_string(incoming_guid : &Uuid) -> String {    
    let mut incoming_guid = incoming_guid.to_string().to_lowercase();
    //If it's 36 characters, we chop off the dashes
    if incoming_guid.chars().count() == 36 {
        incoming_guid = incoming_guid.replace("-","");        
    }

    return incoming_guid;

}