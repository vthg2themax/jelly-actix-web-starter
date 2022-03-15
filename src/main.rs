//! Your Service Description here, etc.
//use actix_web::actix_rt;
use actix_web;
//use utility::prelude;
//use std::io;
use std::env;

use actix_session::CookieSession;


use crate::utility::request;
use crate::utility::assets::disable_serving_assets;

#[macro_use]
extern crate log;

use actix_web::{get, middleware, post, web, App, HttpResponse, HttpServer};
use futures::executor;
use std::{sync::mpsc, thread};

//pub mod accounts;
//pub mod dashboard;
pub mod pages;
pub mod utility;

#[get("/hello")]
async fn hello() -> &'static str {
    "Hello world!"
}

#[get("/stop")]
async fn stop(stopper: web::Data<mpsc::Sender<()>>) -> HttpResponse {
    // make request that sends message through the Sender
    stopper.send(()).unwrap();

    HttpResponse::NoContent().finish()
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "actix_server=debug,actix_web=debug");

    let addr = "127.0.0.1:5000";    
    let path = std::env::current_dir().unwrap();

    println!("Listening for requests at http://{addr} from path: {path}", addr=addr, path=path.display());
    //env_logger::init();

    // create a channel
    let (tx, rx) = mpsc::channel::<()>();

    // start server as normal but don't .await after .run() yet
    // let server = utility::server::Server::new(tx)
    //     .register_service(pages::configure)
    //     //.register_service(accounts::configure)
    //     //.register_jobs(accounts::jobs::configure)
    //     //.register_service(dashboard::configure)
    //     .run();
    dotenv::dotenv().ok();
    pretty_env_logger::init();
        //Email::check_conf();

    let bind = env::var("BIND_TO").expect("BIND_TO not set!");
    let _root_domain = env::var("JELLY_DOMAIN").expect("JELLY_DOMAIN not set!");

    #[cfg(feature = "production")]
    let domain = env::var("SESSIONID_DOMAIN").expect("SESSIONID_DOMAIN not set!");

    
    let key = env::var("SECRET_KEY")
        .expect(
            &format!("SECRET_KEY not set! Here is an idea for a secret key you could use: {:?}",
                    utility::convert_guid_to_sqlite_string(&uuid::Uuid::new_v4())
            )
        );

    //let template_store = crate::templates::load();
    //let templates = template_store.templates.clone();

    //let db_uri = env::var("DATABASE_URL").expect("DATABASE_URL not set!");

    let server = HttpServer::new(move || {
        // !production needs no domain set, because browsers.
        #[cfg(not(feature = "production"))]
        let session_storage = CookieSession::signed(key.as_bytes())
        .name("sessionid")
        .secure(false)
        .path("/");
        
        #[cfg(feature = "production")]
        let session_storage = CookieSession::signed(key.as_bytes())
        .name("sessionid")
        .path("/")
        .same_site(actix_web::cookie::SameSite::Lax)
        .domain(&domain)
        .secure(true);
        
        let app = App::new()
            .data(tx.clone())
            //.app_data(pool.clone())
            //.app_data(templates.clone())
            .wrap(middleware::Logger::default())
            .wrap(session_storage)
            // Depending on your CORS needs, you may opt to change this
            // block. Up to you.
            // .default_service(
            //     web::resource("")
            //         .route(web::get().to(request::not_found))
            //         .route(web::head().to(HttpResponse::MethodNotAllowed))
            //         .route(web::delete().to(HttpResponse::MethodNotAllowed))
            //         .route(web::patch().to(HttpResponse::MethodNotAllowed))
            //         .route(web::put().to(HttpResponse::MethodNotAllowed))
            //         .route(web::post().to(HttpResponse::MethodNotAllowed)),
            // )
            .configure(pages::config)
            .configure(disable_serving_assets::assets_handler)
            .service(hello)
            .service(stop);


        //let storage = Storage::new();
        //let queue = create_server(storage);
        //let state = JobState::new("JobState", pool.clone(), templates.clone());
        //let mut worker_config = WorkerConfig::new(move || state.clone());

        // for handler in jobs.iter() {
        //     let x = handler.clone();
        //     worker_config = x(worker_config);
        // }

        // worker_config
        //     .set_worker_count(DEFAULT_QUEUE, 16)
        //     .start(queue.clone());

        //app.app_data(web::Data::new(queue.clone()))
        app
    })
    .backlog(8192)
    //default timer is 30 seconds
    .shutdown_timeout(30)
    //.workers(4) This can be customized to your liking, but by default is based on the server's cpu
    .bind(&bind)?
    .run();
        
    // clone the Server handle
    let srv = server.clone();
    thread::spawn(move || {
        // wait for shutdown signal
        rx.recv().unwrap();

        // stop server gracefully
        executor::block_on(srv.stop(true))
    });

    // run server
    server.await
}

// //#[actix_web::main]
// #[actix_rt::main]
// pub async fn main() -> io::Result<()> {
//     //let stdout = io::stdout();
//     //let _lock = stdout.lock();

//     utility::server::Server::new()
//         .register_service(pages::configure)
//         //.register_service(accounts::configure)
//         //.register_jobs(accounts::jobs::configure)
//         //.register_service(dashboard::configure)
//         .run()
//         .await?
//         .await
// }
