// use actix_rt::Arbiter;
// use anyhow::Error;
// use background_jobs::{ActixJob as Job, MaxRetries, WorkerConfig};

use std::env;
use std::sync::Arc;

use actix_session::CookieSession;
use actix_web::web::ServiceConfig;
use actix_web::{dev, middleware, web, App, HttpResponse, HttpServer};
use sqlx::{
    sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions, SqliteSynchronous},
    //Pool, Sqlite,
};
use std::time::{Duration, 
    //Instant
};
use std::{fs, str::FromStr};

use crate::utility;
use crate::utility::request;
use crate::utility::assets::disable_serving_assets;
use std::{sync::mpsc::Sender, thread};
use std::io::Result;

//use email::{Configurable, Email};
//use jobs::{JobState, DEFAULT_QUEUE};

/// This struct provides a slightly simpler way to write `main.rs` in
/// the root project, and forces more coupling to app-specific modules.
// #[derive(Clone)]
pub struct Server {
    apps: Vec<Box<dyn Fn(&mut ServiceConfig) + Send + Sync + 'static>>,
    tx_channel: std::sync::mpsc::Sender<()>,
    //jobs:
    //    Vec<Box<dyn Fn(WorkerConfig<JobState>) -> WorkerConfig<JobState> + Send + Sync + 'static>>,
}

impl Server {
    /// Creates a new Server struct to configure.
    pub fn new(tx : std::sync::mpsc::Sender<()>) -> Self {
        Self {
            apps: vec![],
            tx_channel: tx.clone(),
            //jobs: vec![],
        }
    }

    /// Registers a service.
    pub fn register_service<F>(mut self, handler: F) -> Self
    where
        F: Fn(&mut ServiceConfig) + Send + Sync + 'static,
    {
        self.apps.push(Box::new(handler));
        self
    }

    /// Registers jobs.
    // pub fn register_jobs<F>(mut self, handler: F) -> Self
    // where
    //     F: Fn(WorkerConfig<JobState>) -> WorkerConfig<JobState> + Send + Sync + 'static,
    // {
    //     self.jobs.push(Box::new(handler));
    //     self
    // }

    /// Consumes and then runs the server, with default settings that we
    /// generally want.
    pub async fn run(self) -> Result<dev::Server> {
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
        

        let apps = Arc::new(self.apps);
        //let jobs = Arc::new(self.jobs);

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
            
            let mut app = App::new()
                .data(self.tx_channel.clone())
                //.app_data(pool.clone())
                //.app_data(templates.clone())
                .wrap(middleware::Logger::default())
                .wrap(session_storage)
                // Depending on your CORS needs, you may opt to change this
                // block. Up to you.
                .default_service(
                    web::resource("")
                        .route(web::get().to(request::not_found))
                        .route(web::head().to(HttpResponse::MethodNotAllowed))
                        .route(web::delete().to(HttpResponse::MethodNotAllowed))
                        .route(web::patch().to(HttpResponse::MethodNotAllowed))
                        .route(web::put().to(HttpResponse::MethodNotAllowed))
                        .route(web::post().to(HttpResponse::MethodNotAllowed)),
                )
                .configure(disable_serving_assets::assets_handler);

            for handler in apps.iter() {
                app = app.configure(|c| handler(c));
            }

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

        Ok(server)
    }
}
