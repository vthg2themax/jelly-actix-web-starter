use serde::{Deserialize, Serialize};

pub use crate::utility::password::make_random_password;
pub use crate::utility::tokens::token_generator::OneTimeUseTokenGenerator;

/// A smaller, serialize-able instance of an Account
/// that can be used to avoid a database hit.
#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: i64,
    pub name: String,
    pub is_admin: bool,
    pub is_anonymous: bool,
}

impl Default for User {
    /// A default user is anonymous.
    fn default() -> Self {
        User {
            id: 0,
            name: String::new(),
            is_admin: false,
            is_anonymous: true,
        }
    }
}