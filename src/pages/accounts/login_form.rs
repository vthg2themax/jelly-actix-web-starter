use serde::{Deserialize, Serialize};

use crate::utility::validators::forms::Validation;
use crate::utility::validators::email::EmailField;
use crate::utility::password::PasswordField;
use crate::utility::default_redirect_path;

#[derive(Default, Debug, Deserialize, Serialize)]
pub struct LoginForm {
    pub email: EmailField,
    pub password: PasswordField,

    #[serde(default = "default_redirect_path")]
    pub redirect: String,
}

impl Validation for LoginForm {
    fn is_valid(&mut self) -> bool {
        self.email.is_valid() && !self.password.value.is_empty()
    }
}