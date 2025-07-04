const fs = require('fs');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const vm = require('vm');

// Minimal DOM stubs
const elements = {
  'gasto-form': { addEventListener: (ev, cb) => { if (ev === 'submit') elements._expense = cb; }, reset() {} },
  'gastos': { appendChild() {} },
  'cuenta': { value: '1', appendChild() {} },
  'categoria': { value: '1', appendChild() {} },
  'usuario': { value: '1', appendChild() {} },
  'descripcion': { value: 'test gasto' },
  'cantidad': { value: '5' },
  'family-form': { addEventListener: (ev, cb) => { if (ev === 'submit') elements._family = cb; } },
  'family-name': { value: 'FamTest' },
  'user-form': { addEventListener: (ev, cb) => { if (ev === 'submit') elements._user = cb; } },
  'username': { value: 'user1' },
  'userpass': { value: 'pass' },
  'family-select': { value: '1', appendChild() {} },
  'category-form': { addEventListener: (ev, cb) => { if (ev === 'submit') elements._cat = cb; } },
  'family-category-select': { value: '1', appendChild() {} },
  'category-name': { value: 'Nueva' },
  'familias': { innerHTML: '', appendChild(child) { this._child = child; } },
  'voice-btn': { addEventListener(ev, cb) { if (ev === 'click') elements._voice = cb; } }
};

let created = [];
global.document = {
  getElementById: id => elements[id],
  createElement: () => ({
    children: [],
    appendChild(child) { this.children.push(child); },
    addEventListener(ev, cb) { if (ev === 'click') this._click = cb; },
    textContent: ''
  })
};

const fetchCalls = [];
global.fetch = (url, opts) => {
  fetchCalls.push({ url, opts });
  if (url.endsWith('/families/')) return Promise.resolve({ json: () => Promise.resolve([{ id: 1, name: 'F' }]) });
  if (url.endsWith('/users/')) return Promise.resolve({ json: () => Promise.resolve([{ id: 2, family_id: 1, username: 'u' }]) });
  if (url.endsWith('/accounts/')) return Promise.resolve({ json: () => Promise.resolve([{ id: 1, name: 'C' }]) });
  if (url.includes('/categories')) return Promise.resolve({ json: () => Promise.resolve([{ id: 1, name: 'Cat' }]) });
  return Promise.resolve({ json: () => Promise.resolve([]) });
};

global.location = { reload() {} };

function expect(str, msg){
  if(!html.includes(str)) throw new Error('Missing ' + msg);
}

expect('family-form', 'family form');
expect('user-form', 'user form');
expect('gasto-form', 'expense form');
expect('usuario', 'user select');
expect('voice-btn', 'voice button');
expect('category-form', 'category form');

// Execute the front-end script in this context
vm.runInThisContext(fs.readFileSync(__dirname + '/app.js', 'utf8'));

(async () => {
  await elements._family({ preventDefault() {} });
  const famCall = fetchCalls.find(c => c.url.endsWith('/families/') && c.opts && c.opts.method === 'POST');
  if (!famCall) throw new Error('Family creation not sent');

  await elements._user({ preventDefault() {} });
  const userCall = fetchCalls.find(c => c.url.endsWith('/users/') && c.opts && c.opts.method === 'POST');
  if (!userCall) throw new Error('User creation not sent');

  await elements._cat({ preventDefault() {} });
  const catCall = fetchCalls.find(c => c.url.endsWith('/categories/') && c.opts && c.opts.method === 'POST');
  if (!catCall) throw new Error('Category creation not sent');

  await cargarFamilias();
  const btn = elements.familias._child.children[0].children[0].children[0];
  btn._click();
  if (String(elements.usuario.value) !== '2') throw new Error('Impersonation failed');

  elements.descripcion.value = '';
  await elements._expense({ preventDefault() {} });
  elements.descripcion.value = 'test gasto';
  await elements._expense({ preventDefault() {} });

  const expenseCalls = fetchCalls.filter(c => c.url.endsWith('/expenses/') && c.opts && c.opts.method === 'POST');
  if (expenseCalls.length < 2) throw new Error('Expense calls missing');
  const first = JSON.parse(expenseCalls[0].opts.body);
  const second = JSON.parse(expenseCalls[1].opts.body);
  if (first.category_id !== 1 || second.description !== 'test gasto') throw new Error('Wrong payload');
  console.log('Frontend tests passed');
})();

