from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import sqlite3

app = FastAPI()

DB_PATH = "expenses.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY, description TEXT, amount REAL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    )
    conn.commit()
    conn.close()

init_db()

class Expense(BaseModel):
    description: str
    amount: float

@app.post("/expenses/", response_model=Expense)
def create_expense(expense: Expense):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO expenses (description, amount) VALUES (?, ?)", (expense.description, expense.amount))
    conn.commit()
    conn.close()
    return expense

@app.get("/expenses/", response_model=List[Expense])
def list_expenses():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT description, amount FROM expenses")
    rows = c.fetchall()
    conn.close()
    return [Expense(description=row[0], amount=row[1]) for row in rows]
