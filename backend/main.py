from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import sqlite3
from hashlib import sha256

app = FastAPI()

DB_PATH = "expenses.db"


def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        """CREATE TABLE IF NOT EXISTS families (
            id INTEGER PRIMARY KEY,
            name TEXT
        )"""
    )
    c.execute(
        """CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            family_id INTEGER,
            username TEXT UNIQUE,
            password TEXT,
            FOREIGN KEY(family_id) REFERENCES families(id)
        )"""
    )
    c.execute(
        "CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY, user_id INTEGER, name TEXT, FOREIGN KEY(user_id) REFERENCES users(id))"
    )
    c.execute(
        "CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, user_id INTEGER, name TEXT, FOREIGN KEY(user_id) REFERENCES users(id))"
    )
    c.execute(
        """CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            account_id INTEGER,
            category_id INTEGER,
            description TEXT,
            amount REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(account_id) REFERENCES accounts(id),
            FOREIGN KEY(category_id) REFERENCES categories(id)
        )"""
    )
    # create default family and root user if not exist
    c.execute("SELECT id FROM users WHERE username='root'")
    row = c.fetchone()
    if not row:
        c.execute("INSERT INTO families (name) VALUES ('Familia root')")
        family_id = c.lastrowid
        hashed = sha256('test'.encode()).hexdigest()
        c.execute(
            "INSERT INTO users (family_id, username, password) VALUES (?, ?, ?)",
            (family_id, 'root', hashed),
        )
        user_id = c.lastrowid
        c.execute("INSERT INTO accounts (user_id, name) VALUES (?, ?)", (user_id, 'Personal'))
        c.execute("INSERT INTO categories (user_id, name) VALUES (?, ?)", (user_id, 'Bares'))
        c.execute("INSERT INTO categories (user_id, name) VALUES (?, ?)", (user_id, 'Compra'))
    conn.commit()
    conn.close()


init_db()


class Family(BaseModel):
    id: int
    name: str


class FamilyCreate(BaseModel):
    name: str


class User(BaseModel):
    id: int
    family_id: int
    username: str


class UserCreate(BaseModel):
    family_id: int
    username: str
    password: str


@app.get("/families/", response_model=List[Family])
def list_families():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, name FROM families")
    rows = c.fetchall()
    conn.close()
    return [Family(id=r[0], name=r[1]) for r in rows]


@app.post("/families/", response_model=Family)
def create_family(family: FamilyCreate):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO families (name) VALUES (?)", (family.name,))
    conn.commit()
    fam_id = c.lastrowid
    conn.close()
    return Family(id=fam_id, name=family.name)


@app.get("/users/", response_model=List[User])
def list_users():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, family_id, username FROM users")
    rows = c.fetchall()
    conn.close()
    return [User(id=r[0], family_id=r[1], username=r[2]) for r in rows]


@app.post("/users/", response_model=User)
def create_user(user: UserCreate):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    hashed = sha256(user.password.encode()).hexdigest()
    c.execute(
        "INSERT INTO users (family_id, username, password) VALUES (?, ?, ?)",
        (user.family_id, user.username, hashed),
    )
    conn.commit()
    user_id = c.lastrowid
    conn.close()
    return User(id=user_id, family_id=user.family_id, username=user.username)


class Account(BaseModel):
    id: int
    name: str


class AccountCreate(BaseModel):
    user_id: int
    name: str


class Category(BaseModel):
    id: int
    name: str


class CategoryCreate(BaseModel):
    user_id: int
    name: str


class Expense(BaseModel):
    id: int
    user_id: int
    account_id: int
    category_id: int
    description: str
    amount: float


class ExpenseCreate(BaseModel):
    user_id: int
    account_id: int
    category_id: int
    description: str
    amount: float


@app.get("/accounts/", response_model=List[Account])
def list_accounts():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, name FROM accounts")
    rows = c.fetchall()
    conn.close()
    return [Account(id=r[0], name=r[1]) for r in rows]


@app.post("/accounts/", response_model=Account)
def create_account(account: AccountCreate):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "INSERT INTO accounts (user_id, name) VALUES (?, ?)",
        (account.user_id, account.name),
    )
    conn.commit()
    acc_id = c.lastrowid
    conn.close()
    return Account(id=acc_id, name=account.name)


@app.get("/categories/", response_model=List[Category])
def list_categories():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, name FROM categories")
    rows = c.fetchall()
    conn.close()
    return [Category(id=r[0], name=r[1]) for r in rows]


@app.post("/categories/", response_model=Category)
def create_category(category: CategoryCreate):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "INSERT INTO categories (user_id, name) VALUES (?, ?)",
        (category.user_id, category.name),
    )
    conn.commit()
    cat_id = c.lastrowid
    conn.close()
    return Category(id=cat_id, name=category.name)


@app.post("/expenses/", response_model=Expense)
def create_expense(expense: ExpenseCreate):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "INSERT INTO expenses (user_id, account_id, category_id, description, amount) VALUES (?, ?, ?, ?, ?)",
        (
            expense.user_id,
            expense.account_id,
            expense.category_id,
            expense.description,
            expense.amount,
        ),
    )
    conn.commit()
    exp_id = c.lastrowid
    conn.close()
    return Expense(id=exp_id, **expense.dict())


@app.get("/expenses/", response_model=List[Expense])
def list_expenses():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, user_id, account_id, category_id, description, amount FROM expenses")
    rows = c.fetchall()
    conn.close()
    return [
        Expense(
            id=r[0],
            user_id=r[1],
            account_id=r[2],
            category_id=r[3],
            description=r[4],
            amount=r[5],
        )
        for r in rows
    ]
