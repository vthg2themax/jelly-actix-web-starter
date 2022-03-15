use actix_web::{web, HttpRequest};
use background_jobs::Job;
use background_jobs::QueueHandle;

use sqlx::sqlite::SqlitePool;
use std::sync::{Arc, RwLock};
use black_marlin::Template;

//use crate::error::Error;

// A trait for adding jobs to a background queue.
// pub trait JobQueue {
//     /// Grabs a QueueHandle and adds the job to the queue.
//     fn queue<J: Job + 'static>(&self, job: J) -> Result<(), Error>;
// }

// impl JobQueue for HttpRequest {
//     fn queue<J: Job + 'static>(&self, job: J) -> Result<(), Error> {
//         let handle: Option<&web::Data<QueueHandle>> = self.app_data();

//         if let Some(handle) = handle {
//             handle.queue(job)?;
//             return Ok(());
//         }

//         Err(Error::Generic("QueueHandle unavailable.".to_string()))
//     }
// }

// This module contains types used in Job registration and handling.


// pub use background_jobs::{Job, WorkerConfig};

// pub const DEFAULT_QUEUE: &'static str = "default";

// This type can be used to indicate what environment a job is running in,
// as well as gaining access to a database connection and to template engine.
// #[derive(Clone)]
// pub struct JobState {
//     pub name: String,
//     pub pool: SqlitePool,
//     pub templates: Arc<RwLock<Template>>,
// }

// impl JobState {
//     /// Creates a new `JobState` object.
//     pub fn new(name: &str, pool: SqlitePool, templates: Arc<RwLock<Template>>) -> Self {
//         JobState {
//             name: name.to_owned(),
//             pool,
//             templates,
//         }
//     }
// }
