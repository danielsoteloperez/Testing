from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import sqlite3
from hashlib import sha256
import logging

app = FastAPI()

# allow requests from the frontend served on a different origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# basic logging to a file. force=True ensures the handler is added even when
# tests configure logging beforehand.
logging.basicConfig(
    filename="app.log",
    level=logging.INFO,
    format="%(asctime)s %(message)s",
    force=True,
)

DB_PATH = "expenses.db"

# path to the local SQLite database


def get_conn():
    """Return a connection to the SQLite database."""
    return sqlite3.connect(DB_PATH)




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
    logging.info("Listing families")
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT id, name FROM families")
    rows = c.fetchall()
    conn.close()
    return [Family(id=r[0], name=r[1]) for r in rows]


@app.post("/families/", response_model=Family)
def create_family(family: FamilyCreate):
    logging.info("Creating family %s", family.name)
    conn = get_conn()
    c = conn.cursor()
    c.execute("INSERT INTO families (name) VALUES (?)", (family.name,))
    conn.commit()
    fam_id = c.lastrowid
    # default categories for the family
    defaults = [
        "Alquiler",
        "Super",
        "Bares",
        "Farmacia",
        "Gasolina",
    ]
    for name in defaults:
        c.execute("INSERT INTO categories (family_id, name) VALUES (?, ?)", (fam_id, name))
    conn.commit()
    conn.close()
    return Family(id=fam_id, name=family.name)


@app.get("/users/", response_model=List[User])
def list_users():
    logging.info("Listing users")
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT id, family_id, username FROM users")
    rows = c.fetchall()
    conn.close()
    return [User(id=r[0], family_id=r[1], username=r[2]) for r in rows]


@app.post("/users/", response_model=User)
def create_user(user: UserCreate):
    logging.info("Creating user %s", user.username)
    conn = get_conn()
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
    family_id: int
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


class ClientLog(BaseModel):
    message: str


@app.get("/accounts/", response_model=List[Account])
def list_accounts():
    logging.info("Listing accounts")
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT id, name FROM accounts")
    rows = c.fetchall()
    conn.close()
    return [Account(id=r[0], name=r[1]) for r in rows]


@app.post("/accounts/", response_model=Account)
def create_account(account: AccountCreate):
    logging.info("Creating account %s for user %s", account.name, account.user_id)
    conn = get_conn()
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
    logging.info("Listing categories")
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT id, name FROM categories")
    rows = c.fetchall()
    conn.close()
    return [Category(id=r[0], name=r[1]) for r in rows]


@app.get("/categories/family/{family_id}", response_model=List[Category])
def list_categories_family(family_id: int):
    """List categories for a given family."""
    logging.info("Listing categories for family %s", family_id)
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT id, name FROM categories WHERE family_id = ?", (family_id,))
    rows = c.fetchall()
    conn.close()
    return [Category(id=r[0], name=r[1]) for r in rows]


@app.post("/categories/", response_model=Category)
def create_category(category: CategoryCreate):
    name = category.name.lower().capitalize()
    logging.info("Creating category %s", name)
    conn = get_conn()
    c = conn.cursor()
    c.execute(
        "SELECT id FROM categories WHERE family_id = ? AND lower(name) = lower(?)",
        (category.family_id, name),
    )
    if c.fetchone():
        conn.close()
        raise ValueError("Category already exists")
    c.execute(
        "INSERT INTO categories (family_id, name) VALUES (?, ?)",
        (category.family_id, name),
    )
    conn.commit()
    cat_id = c.lastrowid
    conn.close()
    return Category(id=cat_id, name=name)


@app.post("/expenses/", response_model=Expense)
def create_expense(expense: ExpenseCreate):
    logging.info("Creating expense %s %.2f", expense.description, expense.amount)
    conn = get_conn()
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
    logging.info("Listing expenses")
    conn = get_conn()
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


@app.get("/expenses/user/{user_id}", response_model=List[Expense])
def list_expenses_user(user_id: int):
    """List expenses belonging to a single user."""
    logging.info("Listing expenses for user %s", user_id)
    conn = get_conn()
    c = conn.cursor()
    c.execute(
        "SELECT id, user_id, account_id, category_id, description, amount FROM expenses WHERE user_id = ?",
        (user_id,),
    )
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


@app.get("/expenses/family/{family_id}", response_model=List[Expense])
def list_expenses_family(family_id: int):
    """List expenses for all users in a family."""
    logging.info("Listing expenses for family %s", family_id)
    conn = get_conn()
    c = conn.cursor()
    c.execute(
        """
        SELECT e.id, e.user_id, e.account_id, e.category_id, e.description, e.amount
        FROM expenses e
        JOIN users u ON e.user_id = u.id
        WHERE u.family_id = ?
        """,
        (family_id,),
    )
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


@app.post("/client-log/")
def client_log(log: ClientLog):
    """Record logs sent from the frontend."""
    logging.info("CLIENT: %s", log.message)
    return {"status": "ok"}
