const form = document.getElementById('gasto-form');
const lista = document.getElementById('gastos');
const cuentas = document.getElementById('cuenta');
const categorias = document.getElementById('categoria');
const usuarioSel = document.getElementById('usuario');
const familyForm = document.getElementById('family-form');
const userForm = document.getElementById('user-form');
const familySelect = document.getElementById('family-select');

async function cargarOpciones() {
    const famResp = await fetch('http://localhost:8000/families/');
    const fams = await famResp.json();
    fams.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = f.name;
        familySelect.appendChild(opt.cloneNode(true));
    });

    const userResp = await fetch('http://localhost:8000/users/');
    const users = await userResp.json();
    users.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = u.username;
        usuarioSel.appendChild(opt);
    });

    const accResp = await fetch('http://localhost:8000/accounts/');
    const accounts = await accResp.json();
    accounts.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        opt.textContent = a.name;
        cuentas.appendChild(opt);
    });

    const catResp = await fetch('http://localhost:8000/categories/');
    const cats = await catResp.json();
    cats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        categorias.appendChild(opt);
    });
}

async function cargarGastos() {
    const resp = await fetch('http://localhost:8000/expenses/');
    const gastos = await resp.json();
    gastos.forEach(g => {
        const item = document.createElement('li');
        item.textContent = `${g.description} - ${g.amount}€`;
        lista.appendChild(item);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const descripcion = document.getElementById('descripcion').value;
    const cantidad = parseFloat(document.getElementById('cantidad').value);

    await fetch('http://localhost:8000/expenses/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: parseInt(usuarioSel.value),
            account_id: parseInt(cuentas.value),
            category_id: parseInt(categorias.value),
            description: descripcion,
            amount: cantidad
        })
    });

    const item = document.createElement('li');
    item.textContent = `${descripcion} - ${cantidad}€`;
    lista.appendChild(item);

    form.reset();
});

familyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('family-name').value;
    await fetch('http://localhost:8000/families/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    location.reload();
});

userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('userpass').value;
    await fetch('http://localhost:8000/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            family_id: parseInt(familySelect.value),
            username,
            password
        })
    });
    location.reload();
});

cargarOpciones();
cargarGastos();
