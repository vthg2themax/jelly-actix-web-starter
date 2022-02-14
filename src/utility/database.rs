use actix_web::HttpRequest;
use dotenv::dotenv;
use futures::executor::block_on;
use sqlx::sqlite::{SqlitePool};
use std::env;
use lazy_static::lazy_static;

use crate::utility::error::Error;

/// A basic trait to extract a Database Pool instance for use in views and the like.
/// The impetus for this is that Extractors are visually hard to scan, and this does
/// the same thing - and avoids us having to double-Arc our internal PgPool instances.
pub trait DatabasePool {
    /// Returns a SqlitePool reference that can be used for database operations.
    /// Will return an error if, for some reason, it's unable to unwrap and get
    /// the reference.
    fn db_pool(&self) -> Result<&SqlitePool, Error>;
}

impl DatabasePool for HttpRequest {
    /// Returns a database pool object.
    fn db_pool(&self) -> Result<&SqlitePool, Error> {
        if let Some(pool) = self.app_data::<SqlitePool>() {
            return Ok(&pool);
        }

        Err(Error::Generic(
            "Unable to retrieve Database Pool.".to_string(),
        ))
    }
}

// lazy_static! {
//     static ref DBPOOL: SqlitePool = {
//         dotenv().ok();
//         block_on(
//             SqlitePool::builder()
//                 .max_size(5)
//                 .build(&env::var("DATABASE_URL").unwrap()),
//         )
//         .unwrap()
//     };
// }

// let database_file = "db.sqlite";
//         let database_url = format!("sqlite://{}", database_file);
//         let pool_timeout = Duration::from_secs(30);
//         // with pool_max_connections = 1, the pool timeout. maybe related to https://github.com/launchbadge/sqlx/issues/1210
//         let pool_max_connections = 3;

//         let _ = fs::remove_file(database_file);

//         let connection_options = SqliteConnectOptions::from_str(&database_url)
//             .expect("Unable to setup connection_options")
//             .create_if_missing(true)
//             .journal_mode(SqliteJournalMode::Wal)
//             .synchronous(SqliteSynchronous::Normal)
//             .busy_timeout(pool_timeout);

//         let sqlite_pool = SqlitePoolOptions::new()
//             .max_connections(pool_max_connections)
//             .connect_timeout(pool_timeout)
//             .connect_with(connection_options)
//             .await
//             .expect("Unable to connect to database!");

//         sqlx::migrate!("./db")
//             .run(&sqlite_pool)
//             .await
//             .expect("unable to mirgate!");

//         sqlx::query("pragma temp_store = memory;")
//             .execute(&sqlite_pool)
//             .await
//             .expect("Unable to set pragma temp store to memory!");

//         sqlx::query("pragma mmap_size = 30000000000;")
//             .execute(&sqlite_pool)
//             .await
//             .expect("Unable to set mmap_size!");

//         sqlx::query("pragma page_size = 4096;")
//             .execute(&sqlite_pool)
//             .await
//             .expect("Unable to set page size to 4096!");