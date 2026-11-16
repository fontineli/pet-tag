import assert from 'node:assert/strict';
import * as L from './lib.js';

// parseCSV
assert.deepEqual(L.parseCSV('a,b\r\n1,2\r\n'), [['a','b'],['1','2']]);
assert.deepEqual(L.parseCSV('a,b\n"x, y","l1\nl2"\n\n'), [['a','b'],['x, y','l1\nl2']]);
assert.deepEqual(L.parseCSV('a\n"diz ""oi"""'), [['a'],['diz "oi"']]);
assert.deepEqual(L.toObjects([[' id ','nome'],['thor','Thor']]), [{id:'thor', nome:'Thor'}]);

// datas e status (today = 16/11/2026)
const today = new Date(2026, 10, 16);
assert.equal(L.parseDateBR('03/12/2026').getTime(), new Date(2026, 11, 3).getTime());
assert.equal(L.parseDateBR('16/11/2026 10:00:00').getTime(), today.getTime());
assert.equal(L.parseDateBR(''), null);
assert.equal(L.parseDateBR('lixo'), null);
assert.equal(L.parseDateBR('31/02/2026'), null);
assert.equal(L.vaccineStatus(null, today), 'none');
assert.equal(L.vaccineStatus(new Date(2026, 10, 15), today), 'overdue');
assert.equal(L.vaccineStatus(today, today), 'soon');
assert.equal(L.vaccineStatus(new Date(2026, 11, 16), today), 'soon');   // +30
assert.equal(L.vaccineStatus(new Date(2026, 11, 17), today), 'ok');     // +31

// latestByVaccine
const recs = [
  {Vacina:'V10', 'Data de aplicação':'01/01/2025'},
  {Vacina:' v10 ', 'Data de aplicação':'01/01/2026'},
  {Vacina:'Raiva', 'Data de aplicação':'10/01/2026'},
];
const latest = L.latestByVaccine(recs);
assert.equal(latest.length, 2);
assert.equal(latest.find(r => r.Vacina.trim().toLowerCase()==='v10')['Data de aplicação'], '01/01/2026');

// Review Focus helpers
assert.equal(L.findPet([{id:'thor'}], ' Thor ').id, 'thor');
assert.equal(L.findPet([{id:'thor'}], null), null);
assert.equal(L.findPet([{id:'thor'}], 'rex'), null);
for (const v of ['TRUE','verdadeiro','Sim','1']) assert.equal(L.isTrue(v), true);
for (const v of ['FALSE','FALSO','', undefined]) assert.equal(L.isTrue(v), false);
assert.equal(L.digits('+55 (11) 99999-9999'), '5511999999999');
assert.equal(L.phone('5511999999999'), '+5511999999999');   // Sheets comeu o +
assert.equal(L.phone('+55 (11) 99999-9999'), '+5511999999999');
assert.equal(L.firstUrl('https://drive.google.com/a, https://drive.google.com/b'), 'https://drive.google.com/a');
assert.equal(L.firstUrl(''), null);

console.log('ok');
