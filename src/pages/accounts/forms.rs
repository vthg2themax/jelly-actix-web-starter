use jelly::forms::{EmailField, PasswordField, TextField, Validation};
use serde::{Deserialize, Serialize};






#[derive(Default, Debug, Deserialize, Serialize)]
pub struct EmailForm {
    pub email: EmailField,
}

impl Validation for EmailForm {
    fn is_valid(&mut self) -> bool {
        self.email.is_valid()
    }
}

#[derive(Default, Debug, Deserialize, Serialize)]
pub struct ChangePasswordForm {
    // Unused in rendering, but stored here to enable password
    // checking with relative values.
    pub name: Option<String>,
    pub email: Option<String>,

    pub password: PasswordField,
    pub password_confirm: PasswordField,
}

impl Validation for ChangePasswordForm {
    fn is_valid(&mut self) -> bool {
        if !self.password.is_valid() || !self.password_confirm.is_valid() {
            return false;
        }

        if self.password.value != self.password_confirm.value {
            self.password
                .errors
                .push("Passwords must match.".to_string());
            return false;
        }

        self.password
            .validate_with(&[&self.name.as_ref().unwrap(), &self.email.as_ref().unwrap()])
    }
}
