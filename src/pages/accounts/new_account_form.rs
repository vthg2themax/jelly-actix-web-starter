use serde::{Deserialize, Serialize};

use crate::utility::validators::forms::Validation;
use crate::utility::validators::text::TextField;
use crate::utility::validators::email::EmailField;
use crate::utility::password::PasswordField;

#[derive(Debug, Default, Deserialize, Serialize)]
pub struct NewAccountForm {
    pub name: TextField,
    pub email: EmailField,
    pub password: PasswordField,
}

impl Validation for NewAccountForm {
    fn is_valid(&mut self) -> bool {
        self.name.is_valid()
            && self.email.is_valid()
            && self.password.validate_with(&[&self.name, &self.email])
    }
}