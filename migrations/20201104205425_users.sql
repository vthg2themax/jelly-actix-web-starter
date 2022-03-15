-- Creates a accounts table, along with a helpful index.

CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    profile TEXT NOT NULL DEFAULT '{}',
    plan INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 0,
    is_admin INTEGER NOT NULL DEFAULT 0,
    has_verified_email INTEGER NOT NULL DEFAULT 0,
    last_login_datetime TEXT,
    created_datetime TEXT NOT NULL,
    updated_datetime TEXT NOT NULL
) STRICT;

CREATE UNIQUE INDEX IF NOT EXISTS accounts_unique_lower_email_idx ON accounts (lower(email));
