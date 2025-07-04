import os
import sys
import sqlite3
sys.path.insert(0, os.path.dirname(__file__))
import main


def reset_db():
    """Create a fresh database for testing."""
    if os.path.exists(main.DB_PATH):
        os.remove(main.DB_PATH)
    conn = sqlite3.connect(main.DB_PATH)
    with open(os.path.join(os.path.dirname(__file__), 'schema.sql')) as f:
        conn.executescript(f.read())
    conn.close()


# ensure fresh database on import
reset_db()


def test_flow():
    reset_db()
    fam = main.create_family(main.FamilyCreate(name='Fam1'))
    user = main.create_user(main.UserCreate(family_id=fam.id, username='u1', password='pass'))
    # default categories should exist for the family
    fam_cats = [c.name for c in main.list_categories_family(fam.id)]
    for expected in ['Alquiler', 'Super', 'Bares', 'Farmacia', 'Gasolina']:
        assert expected in fam_cats
    cat = main.create_category(main.CategoryCreate(family_id=fam.id, name='Extra'))
    acc = main.create_account(main.AccountCreate(user_id=user.id, name='Cuenta'))
    main.create_expense(main.ExpenseCreate(user_id=user.id, account_id=acc.id, category_id=cat.id, description='test', amount=5.0))
    gastos = main.list_expenses()
    assert any(e.description == 'test' for e in gastos)
    # new endpoints
    user_exp = main.list_expenses_user(user.id)
    assert len(user_exp) == 1
    fam_exp = main.list_expenses_family(fam.id)
    assert any(e.user_id == user.id for e in fam_exp)


def test_client_log():
    reset_db()
    # ensure the log file is empty before logging
    open('app.log', 'w').close()
    main.client_log(main.ClientLog(message='mensaje'))
    with open('app.log') as f:
        data = f.read()
    assert 'CLIENT: mensaje' in data


def test_multiple_families():
    reset_db()
    fam1 = main.create_family(main.FamilyCreate(name='A'))
    fam2 = main.create_family(main.FamilyCreate(name='B'))
    main.create_category(main.CategoryCreate(family_id=fam1.id, name='Extra1'))
    main.create_category(main.CategoryCreate(family_id=fam2.id, name='Extra2'))
    fam1_cats = [c.name for c in main.list_categories_family(fam1.id)]
    fam2_cats = [c.name for c in main.list_categories_family(fam2.id)]
    assert 'Extra1' in fam1_cats and 'Extra1' not in fam2_cats
    assert 'Extra2' in fam2_cats and 'Extra2' not in fam1_cats


def test_duplicate_category():
    reset_db()
    fam = main.create_family(main.FamilyCreate(name='Fam'))
    cat = main.create_category(main.CategoryCreate(family_id=fam.id, name='extra'))
    assert cat.name == 'Extra'
    try:
        main.create_category(main.CategoryCreate(family_id=fam.id, name='Extra'))
        raise AssertionError('Duplicate allowed')
    except ValueError:
        pass


if __name__ == '__main__':
    test_flow()
    test_client_log()
    test_multiple_families()
    print('Backend tests passed')
