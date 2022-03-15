// Implements a basic Account model, with support for creating/updating/deleting
// users, along with welcome email and verification.

use chrono::{DateTime, Utc};
use djangohashers::{check_password, make_password};
use serde::{Deserialize, Serialize};
use sqlx::{self, sqlite::SqlitePool, types::Json, FromRow};

use crate::utility::error::Error;
use crate::pages::accounts::login_form::LoginForm;
use crate::pages::accounts::new_account_form::NewAccountForm;
use crate::utility::models::user::User;
use crate::utility::tokens::token_generator::OneTimeUseTokenGenerator;

/// Personalized profile data that is a pain to make a needless JOIN
/// for; just shove it in a jsonb field.
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Profile {}

/// A user Account.
#[derive(Debug, Serialize, Deserialize)]
pub struct Account {
    pub id: i64,
    pub name: String,
    pub email: String,
    pub password: String,
    pub profile: Json<Profile>,
    pub plan: i64,
    pub is_active: bool,
    pub is_admin: bool,
    pub has_verified_email: bool,
    pub last_login_datetime: Option<DateTime<Utc>>,
    pub created_datetime: DateTime<Utc>,
    pub updated_datetime: DateTime<Utc>,
}

impl Account {
    pub async fn get(uid: i64, pool: &SqlitePool) -> Result<Self, Error> {
        Ok(sqlx::query_as_unchecked!(
            Account,
            "
            SELECT
                id, name, email, password, profile, plan,
                is_active, is_admin, has_verified_email,
                last_login_datetime, created_datetime, updated_datetime
            FROM accounts WHERE id = $1
        ",
            uid
        )
        .fetch_one(pool)
        .await?)
    }

    pub async fn get_by_email(email: &str, pool: &SqlitePool) -> Result<Self, Error> {
        Ok(sqlx::query_as_unchecked!(
            Account,
            "
            SELECT 
                id, name, email, password, profile, plan,
                is_active, is_admin, has_verified_email,
                last_login_datetime, created_datetime, updated_datetime
            FROM accounts WHERE email = $1
        ",
            email
        )
        .fetch_one(pool)
        .await?)
    }

    pub async fn authenticate(form: &LoginForm, pool: &SqlitePool) -> Result<User, Error> {
        let user = sqlx::query!(
            "
            SELECT
                id, name, password, is_admin
            FROM accounts WHERE email = $1
        ",
            form.email.value
        )
        .fetch_one(pool)
        .await?;

        if !check_password(&form.password, &user.password)? {
            return Err(Error::InvalidPassword);
        }

        Ok(User {
            id: user.id,
            name: user.name,
            is_admin: match user.is_admin {
                0 => false,
                1 => true,
                _ => panic!("The admin value is not valid!")
            },
            is_anonymous: false,
        })
    }

    pub async fn fetch_email(id: i32, pool: &SqlitePool) -> Result<(String, String), Error> {
        let data = sqlx::query!(
            "
            SELECT
                name, email
            FROM accounts WHERE id = $1
        ",
            id
        )
        .fetch_one(pool)
        .await?;

        Ok((data.name, data.email))
    }

    pub async fn fetch_name_from_email(email: &str, pool: &SqlitePool) -> Result<String, Error> {
        let data = sqlx::query!(
            "
            SELECT name FROM accounts WHERE email = $1
        ",
            email
        )
        .fetch_one(pool)
        .await?;

        Ok(data.name)
    }

    pub async fn register(form: &NewAccountForm, pool: &SqlitePool) -> Result<i64, Error> {
        let password = make_password(&form.password);

        Ok(sqlx::query!(
            "
            INSERT INTO accounts (name, email, password) 
            VALUES ($1, $2, $3)
            RETURNING id
        ",
            form.name.value,
            form.email.value,
            password
        )
        .fetch_one(pool)
        .await?
        .id)
    }

    pub async fn mark_verified(id: i64, pool: &SqlitePool) -> Result<(), Error> {
        sqlx::query!(
            "
            UPDATE accounts
            SET has_verified_email = true, last_login_datetime = datetime()
            WHERE id = $1
        ",
            id
        )
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn update_last_login(id: i64, pool: &SqlitePool) -> Result<(), Error> {
        sqlx::query!(
            "
            UPDATE accounts
            SET last_login_datetime = datetime()
            WHERE id = $1
        ",
            id
        )
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn update_password_and_last_login(
        id: i32,
        password: &str,
        pool: &SqlitePool,
    ) -> Result<(), Error> {
        let password = make_password(&password);

        sqlx::query!(
            "
            UPDATE accounts
            SET password = $2, last_login_datetime = datetime()
            WHERE id = $1
        ",
            id,
            password
        )
        .execute(pool)
        .await?;

        Ok(())
    }
}

impl OneTimeUseTokenGenerator for Account {
    fn hash_value(&self) -> String {
        format!(
            "{}{}{}{}",
            self.id,
            self.password,
            match self.last_login_datetime {
                Some(ts) => format!("{}", ts.timestamp()),
                None => "Unverified".to_string(),
            },
            self.email
        )
    }
}
