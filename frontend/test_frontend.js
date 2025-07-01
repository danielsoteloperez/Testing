const fs = require('fs');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');

function expect(str, msg){
  if(!html.includes(str)) throw new Error('Missing ' + msg);
}

expect('family-form', 'family form');
expect('user-form', 'user form');
expect('gasto-form', 'expense form');
expect('usuario', 'user select');
console.log('Frontend tests passed');

