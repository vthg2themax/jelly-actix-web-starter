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

    // Registers jobs.
    // pub fn register_jobs<F>(mut self, handler: F) -> Self
    // where
    //     F: Fn(WorkerConfig<JobState>) -> WorkerConfig<JobState> + Send + Sync + 'static,
    // {
    //     self.jobs.push(Box::new(handler));
    //     self
    // }

    // Consumes and then runs the server, with default settings that we
    // generally want.
    // pub async fn run(self) -> Result<dev::Server> {
        
    // }
}
