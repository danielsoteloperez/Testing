const form = document.getElementById('gasto-form');
const lista = document.getElementById('gastos');
const cuentas = document.getElementById('cuenta');
const categorias = document.getElementById('categoria');
const usuarioSel = document.getElementById('usuario');
const familyForm = document.getElementById('family-form');
const userForm = document.getElementById('user-form');
const familySelect = document.getElementById('family-select');
const familiesList = document.getElementById('familias');
const selectedInfo = document.getElementById('selected-info');
const voiceBtn = document.getElementById('voice-btn');

let familiesData = [];
let usersData = [];

async function logClient(msg) {
    try {
        await fetch('http://localhost:8000/client-log/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });
    } catch (e) {
        console.warn('No se pudo enviar el log');
    }
}

function updateSelectedInfo() {
    const userId = parseInt(usuarioSel.value);
    const user = usersData.find(u => u.id === userId);
    const family = user ? familiesData.find(f => f.id === user.family_id) : null;
    if (!selectedInfo) return;
    if (user && family) {
        selectedInfo.textContent = `Familia: ${family.name} - Usuario: ${user.username}`;
    } else {
        selectedInfo.textContent = '';
    }
}

if (usuarioSel && usuarioSel.addEventListener) {
    usuarioSel.addEventListener('change', updateSelectedInfo);
}

async function cargarOpciones() {
    const famResp = await fetch('http://localhost:8000/families/');
    familiesData = await famResp.json();
    familiesData.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = f.name;
        familySelect.appendChild(opt);
    });

    const userResp = await fetch('http://localhost:8000/users/');
    usersData = await userResp.json();
    usersData.forEach(u => {
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

    updateSelectedInfo();
}

async function cargarFamilias() {
    const famResp = await fetch('http://localhost:8000/families/');
    const fams = await famResp.json();
    const userResp = await fetch('http://localhost:8000/users/');
    const users = await userResp.json();
    familiesList.innerHTML = '';
    fams.forEach(f => {
        const li = document.createElement('li');
        li.textContent = f.name;
        const sub = document.createElement('ul');
        users.filter(u => u.family_id === f.id).forEach(u => {
            const uItem = document.createElement('li');
            uItem.textContent = u.username + ' ';
            const btn = document.createElement('button');
            btn.textContent = 'Impersonar';
            btn.addEventListener('click', () => {
                usuarioSel.value = u.id;
                updateSelectedInfo();
            });
            uItem.appendChild(btn);
            sub.appendChild(uItem);
        });
        li.appendChild(sub);
        familiesList.appendChild(li);
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
    updateSelectedInfo();
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

function procesarComandoVoz(texto) {
    logClient(`voz: ${texto}`);
    const re = /inserta\s+(\d+(?:[\.,]\d+)?)\s*(?:euros|€)?\s+de\s+gastos\s+de\s+(\w+)\s+en\s+el\s+(\w+)/i;
    const m = texto.match(re);
    if (!m) {
        const ejemplo = 'inserta 5 euros de gastos de comida en el super';
        console.warn(`No se pudo interpretar el comando: "${texto}". Debe ser similar a "${ejemplo}"`);
        logClient(`Error: comando no coincide con la expresión. Recibido: "${texto}"`);
        return;
    }
    const cantidad = parseFloat(m[1].replace(',', '.'));
    const usuarioNom = m[2].toLowerCase();
    const categoriaNom = m[3].toLowerCase();
    const user = usersData.find(u => u.username.toLowerCase() === usuarioNom);
    const catOption = Array.from(categorias.options).find(o => o.textContent.toLowerCase() === categoriaNom);
    if (!user || !catOption) {
        console.warn('Usuario o categoría no encontrados');
        logClient('Error: usuario o categoría no encontrados');
        return;
    }
    usuarioSel.value = user.id;
    categorias.value = catOption.value;
    const desc = categoriaNom;
    document.getElementById('descripcion').value = desc;
    document.getElementById('cantidad').value = cantidad;
    form.dispatchEvent(new Event('submit'));
    logClient(`Gasto insertado: ${cantidad} en ${categoriaNom}`);
}

function iniciarVoz() {
    const SpeechRecognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn('Speech recognition not available');
        return;
    }
    const recog = new SpeechRecognition();
    recog.lang = 'es-ES';
    recog.onresult = (e) => {
        const texto = e.results[0][0].transcript;
        procesarComandoVoz(texto);
    };
    recog.start();
}

if (voiceBtn && voiceBtn.addEventListener) {
    voiceBtn.addEventListener('click', iniciarVoz);
}

cargarOpciones();
cargarFamilias();
cargarGastos();
