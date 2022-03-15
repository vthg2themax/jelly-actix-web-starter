/// A trait that Forms can implement for validation. Each field type implements this trait, so you
/// can simply write your validation method as `field.is_valid()`.
pub trait Validation {
    /// Checks if the data held is valid. Should return a bool value.
    fn is_valid(&mut self) -> bool {
        false
    }
}
