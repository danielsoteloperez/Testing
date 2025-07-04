const usuarioSel = document.getElementById('usuario');
const lista = document.getElementById('gastos');
const selectedInfo = document.getElementById('selected-info');
let usersData = [];
let familiesData = [];

function updateSelectedInfo() {
    const userId = parseInt(usuarioSel.value);
    const user = usersData.find(u => u.id === userId);
    const family = user ? familiesData.find(f => f.id === user.family_id) : null;
    if (user && family) {
        selectedInfo.textContent = `Familia: ${family.name}`;
    } else {
        selectedInfo.textContent = '';
    }
}

async function cargarUsuarios() {
    const famResp = await fetch('http://localhost:8000/families/');
    familiesData = await famResp.json();
    const userResp = await fetch('http://localhost:8000/users/');
    usersData = await userResp.json();
    usersData.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = u.username;
        usuarioSel.appendChild(opt);
    });
    updateSelectedInfo();
    cargarGastos();
}

async function cargarGastos() {
    lista.innerHTML = '';
    const userId = parseInt(usuarioSel.value);
    const user = usersData.find(u => u.id === userId);
    if (!user) return;
    const resp = await fetch(`http://localhost:8000/expenses/family/${user.family_id}`);
    const gastos = await resp.json();
    gastos.forEach(g => {
        const owner = usersData.find(u => u.id === g.user_id);
        const nombre = owner ? owner.username : 'desconocido';
        const item = document.createElement('li');
        item.textContent = `${nombre}: ${g.description} - ${g.amount}€`;
        lista.appendChild(item);
    });
}

usuarioSel.addEventListener('change', () => {
    updateSelectedInfo();
    cargarGastos();
});

cargarUsuarios();
