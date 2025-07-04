const fs = require('fs');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const famHtml = fs.readFileSync(__dirname + '/familias.html', 'utf8');
const catHtml = fs.readFileSync(__dirname + '/categorias.html', 'utf8');
const vm = require('vm');

// simple localStorage stub
const storage = {};
global.localStorage = {
  getItem: k => (k in storage ? storage[k] : null),
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: k => { delete storage[k]; }
};

// Minimal DOM stubs
const elements = {
  'gasto-form': {
    addEventListener: (ev, cb) => { if (ev === 'submit') elements._expense = cb; },
    dispatchEvent(ev) { if (ev.type === 'submit' && elements._expense) elements._expense(ev); },
    reset() {}
  },
  'gastos': { appendChild() {} },
  'cuenta': { value: '1', appendChild() {} },
  'categoria': {
    value: '1',
    options: [{ value: '1', textContent: 'Cat' }],
    appendChild(opt) { this.options.push(opt); }
  },
  'usuario': { value: '1', appendChild() {} },
  'descripcion': { value: 'test gasto' },
  'cantidad': { value: '5' },
  'family-form': { addEventListener: (ev, cb) => { if (ev === 'submit') elements._family = cb; } },
  'family-name': { value: 'FamTest' },
  'user-form': { addEventListener: (ev, cb) => { if (ev === 'submit') elements._user = cb; } },
  'username': { value: 'user1' },
  'userpass': { value: 'pass' },
  'family-select': { value: '1', appendChild() {} },
  'category-form': { addEventListener: (ev, cb) => { if (ev === 'submit') elements._cat = cb; }, reset() {} },
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

function expect(source, str, msg){
  if(!source.includes(str)) throw new Error('Missing ' + msg);
}

expect(famHtml, 'family-form', 'family form');
expect(famHtml, 'user-form', 'user form');
expect(html, 'gasto-form', 'expense form');
expect(html, 'usuario', 'user select');
expect(html, 'voice-btn', 'voice button');
expect(catHtml, 'category-form', 'category form');
expect(html, 'step="0.01"', 'decimal input');

// Execute the front-end script in this context
vm.runInThisContext(fs.readFileSync(__dirname + '/app.js', 'utf8'));

(async () => {
  await elements._family({ preventDefault() {} });
  const famCall = fetchCalls.find(c => c.url.endsWith('/families/') && c.opts && c.opts.method === 'POST');
  if (!famCall) throw new Error('Family creation not sent');

  await elements._user({ preventDefault() {} });
  const userCall = fetchCalls.find(c => c.url.endsWith('/users/') && c.opts && c.opts.method === 'POST');
  if (!userCall) throw new Error('User creation not sent');

  const beforeCat = fetchCalls.length;
  await elements._cat({ preventDefault() {} });
  const catCall = fetchCalls.find(c => c.url.endsWith('/categories/') && c.opts && c.opts.method === 'POST');
  if (!catCall) throw new Error('Category creation not sent');
  const afterCalls = fetchCalls.slice(beforeCat);
  const reloadCall = afterCalls.find(c => c.url.includes('/categories/family/1'));
  if (!reloadCall) throw new Error('Categories not reloaded');

  await cargarFamilias();
  const btn = elements.familias._child.children[0].children[0].children[0];
  btn._click();
  if (String(elements.usuario.value) !== '2') throw new Error('Impersonation failed');

  // simulate new page load
  elements.usuario.value = '1';
  await init();
  if (String(elements.usuario.value) !== '2') throw new Error('Impersonation not persisted');

  procesarComandoVoz('inserta 1,5 de u en los Cat');

  elements.descripcion.value = '';
  await elements._expense({ preventDefault() {} });
  elements.descripcion.value = 'test gasto';
  await elements._expense({ preventDefault() {} });

  const expenseCalls = fetchCalls.filter(c => c.url.endsWith('/expenses/') && c.opts && c.opts.method === 'POST');
  if (expenseCalls.length < 3) throw new Error('Expense calls missing');
  const voice = JSON.parse(expenseCalls[0].opts.body);
  const last = JSON.parse(expenseCalls[expenseCalls.length - 1].opts.body);
  if (voice.amount !== 1.5 || last.description !== 'test gasto') throw new Error('Wrong payload');

  // Ensure script works without family-select element
  const elements2 = {
    'family-category-select': { value: '1', appendChild() {} },
    'category-form': { addEventListener() {}, reset() {} }
  };
  const doc2 = {
    getElementById: id => elements2[id],
    createElement: global.document.createElement
  };
  vm.runInNewContext(fs.readFileSync(__dirname + '/app.js', 'utf8'), {
    document: doc2,
    fetch: global.fetch,
    location: { reload() {} },
    console,
    localStorage
  });

  console.log('Frontend tests passed');
})();

