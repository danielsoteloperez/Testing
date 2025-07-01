const form = document.getElementById('gasto-form');
const lista = document.getElementById('gastos');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const descripcion = document.getElementById('descripcion').value;
    const cantidad = parseFloat(document.getElementById('cantidad').value);

    await fetch('http://localhost:8000/expenses/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: descripcion, amount: cantidad })
    });

    const item = document.createElement('li');
    item.textContent = `${descripcion} - ${cantidad}€`;
    lista.appendChild(item);

    form.reset();
});
