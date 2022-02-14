use actix_session::UserSession;
use actix_web::HttpRequest;
use crate::utility::error::Error;
use serde::{Deserialize, Serialize};

/// A `FlashMessage` is a generic message that can be shoved into the Session
/// between requests. This isn't particularly useful for JSON-based workflows, but
/// for the traditional webapp side it works well.
#[derive(Debug, Deserialize, Serialize)]
pub struct FlashMessage {
    pub title: String,
    pub message: String,
}

/// `FlashMessages` implements a one-time-message (hence "Flash") that is useful
/// for old-school HTML flows that need to display messages in a standardized way
/// across pages.
///
/// This could potentially do less serialization, but it's fine for now.
/// TODO: Look at whether this can be done with just &str rather than String.
pub trait FlashMessages {
    /// Adds a flash message to the stack.
    fn flash(&self, title: &str, message: &str) -> Result<(), Error>;

    /// Internally used; loads flash messages for template use and removes the existing
    /// stack.
    fn get_flash_messages(&self) -> Result<Vec<FlashMessage>, Error>;
}

impl FlashMessages for HttpRequest {
    fn flash(&self, title: &str, message: &str) -> Result<(), Error> {
        let session = self.get_session();

        let mut messages: Vec<FlashMessage> = match session.get("flsh")? {
            Some(messages) => messages,
            None => Vec::new(),
        };

        messages.push(FlashMessage {
            title: title.to_string(),
            message: message.to_string(),
        });
        session.set("flsh", messages)?;

        Ok(())
    }

    fn get_flash_messages(&self) -> Result<Vec<FlashMessage>, Error> {
        let session = self.get_session();

        let messages = match session.get("flsh")? {
            Some(messages) => messages,
            None => Vec::new(),
        };

        session.remove("flsh");
        Ok(messages)
    }
}
