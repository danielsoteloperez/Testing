PRAGMA foreign_keys = ON;

-- Table definitions
CREATE TABLE IF NOT EXISTS families (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_id INTEGER,
    username TEXT UNIQUE,
    password TEXT,
    FOREIGN KEY(family_id) REFERENCES families(id)
);

CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_id INTEGER,
    name TEXT,
    FOREIGN KEY(family_id) REFERENCES families(id)
);

CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    account_id INTEGER,
    category_id INTEGER,
    description TEXT,
    amount REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(account_id) REFERENCES accounts(id),
    FOREIGN KEY(category_id) REFERENCES categories(id)
);

-- Seed data
INSERT INTO families (name) VALUES ('Familia root');
INSERT INTO users (family_id, username, password) VALUES (1, 'root', '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
INSERT INTO accounts (user_id, name) VALUES (1, 'Personal');
INSERT INTO categories (family_id, name) VALUES (1, 'Alquiler');
INSERT INTO categories (family_id, name) VALUES (1, 'Super');
INSERT INTO categories (family_id, name) VALUES (1, 'Bares');
INSERT INTO categories (family_id, name) VALUES (1, 'Farmacia');
INSERT INTO categories (family_id, name) VALUES (1, 'Gasolina');
