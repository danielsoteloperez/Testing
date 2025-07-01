import os
import sys
sys.path.insert(0, os.path.dirname(__file__))
import main

# ensure fresh database
if os.path.exists(main.DB_PATH):
    os.remove(main.DB_PATH)
main.init_db()


def test_flow():
    fam = main.create_family(main.FamilyCreate(name='Fam1'))
    user = main.create_user(main.UserCreate(family_id=fam.id, username='u1', password='pass'))
    cat = main.create_category(main.CategoryCreate(user_id=user.id, name='Super'))
    acc = main.create_account(main.AccountCreate(user_id=user.id, name='Cuenta'))
    main.create_expense(main.ExpenseCreate(user_id=user.id, account_id=acc.id, category_id=cat.id, description='test', amount=5.0))
    gastos = main.list_expenses()
    assert any(e.description == 'test' for e in gastos)

if __name__ == '__main__':
    test_flow()
    print('Backend tests passed')
